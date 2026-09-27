package com.mams.service.impl;

import com.mams.dto.request.TransferItemRequest;
import com.mams.dto.request.TransferRequest;
import com.mams.dto.response.*;
import com.mams.entity.*;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.*;
import com.mams.security.SecurityService;
import com.mams.security.UserDetailsImpl;
import com.mams.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TransferServiceImpl implements TransferService {

    @Autowired
    private TransferRepository transferRepository;

    @Autowired
    private TransferItemRepository transferItemRepository;

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired // Assume it exists since Asset entity exists
    private org.springframework.data.jpa.repository.JpaRepository<Asset, Long> assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private com.mams.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<TransferResponse> searchTransfers(Long fromBaseId, Long toBaseId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Long involvedBaseId = null;
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                involvedBaseId = userDetails.getBaseId();
                if (involvedBaseId == null) {
                    throw new AccessDeniedException("User is not assigned to a base");
                }
                // If they explicitly requested a base filter, verify they are allowed
                if (fromBaseId != null && !fromBaseId.equals(involvedBaseId)) {
                    if (toBaseId == null || !toBaseId.equals(involvedBaseId)) {
                        throw new AccessDeniedException("Access denied to this base");
                    }
                }
                if (toBaseId != null && !toBaseId.equals(involvedBaseId)) {
                    if (fromBaseId == null || !fromBaseId.equals(involvedBaseId)) {
                        throw new AccessDeniedException("Access denied to this base");
                    }
                }
            }
        }
        
        return transferRepository.searchTransfers(fromBaseId, toBaseId, involvedBaseId, status, startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public TransferResponse getTransferById(Long id) {
        Transfer transfer = getTransferEntity(id);
        verifyAccess(transfer);
        return mapToResponse(transfer);
    }

    @Override
    @Transactional
    public TransferResponse createTransfer(TransferRequest request) {
        if (request.getFromBaseId().equals(request.getToBaseId())) {
            throw new IllegalArgumentException("Source and destination bases must be different");
        }

        Base fromBase = baseRepository.findById(request.getFromBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Source Base not found"));
        Base toBase = baseRepository.findById(request.getToBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Destination Base not found"));

        if (!securityService.canAccessBase(fromBase.getBaseId())) {
            throw new AccessDeniedException("You do not have permission to initiate a transfer from this base");
        }

        User currentUser = getAuthenticatedUser();

        try {
            Transfer transfer = new Transfer();
            transfer.setFromBase(fromBase);
            transfer.setToBase(toBase);
            transfer.setTransferDate(request.getTransferDate());
            transfer.setReferenceNumber(request.getReferenceNumber());
            transfer.setStatus("PENDING");
            transfer.setInitiatedBy(currentUser);

            Transfer savedTransfer = transferRepository.save(transfer);

            for (TransferItemRequest itemReq : request.getItems()) {
                EquipmentType eqType = equipmentTypeRepository.findById(itemReq.getEquipmentTypeId())
                        .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found"));

                TransferItem item = new TransferItem();
                item.setTransfer(savedTransfer);
                item.setEquipmentType(eqType);

                if (itemReq.getAssetId() != null) {
                    Asset asset = assetRepository.findById(itemReq.getAssetId())
                            .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
                    if (asset.getCurrentBase() == null || !asset.getCurrentBase().getBaseId().equals(fromBase.getBaseId())) {
                        throw new IllegalArgumentException("Asset " + asset.getAssetTag() + " does not belong to the source base");
                    }
                    if (!asset.getEquipmentType().getEquipmentTypeId().equals(eqType.getEquipmentTypeId())) {
                        throw new IllegalArgumentException("Asset type mismatch");
                    }
                    item.setAsset(asset);
                    item.setQuantity(1);
                } else {
                    item.setQuantity(itemReq.getQuantity());
                }

            transferItemRepository.save(item);
            }
            
            auditLogService.logAction(currentUser, "TRANSFER_CREATE", "TRANSFER", savedTransfer.getTransferId(), "Transfer " + savedTransfer.getReferenceNumber() + " created from base " + fromBase.getBaseId() + " to base " + toBase.getBaseId(), null);

            return mapToResponse(transferRepository.findById(savedTransfer.getTransferId()).get());
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Transfer with reference number " + request.getReferenceNumber() + " already exists.");
        }
    }

    @Override
    @Transactional
    public TransferResponse completeTransfer(Long id) {
        Transfer transfer = getTransferEntity(id);
        verifyAccess(transfer);

        if (!"PENDING".equals(transfer.getStatus())) {
            throw new IllegalArgumentException("Only PENDING transfers can be completed");
        }

        // Validate inventory and update assets
        List<TransferItem> items = transferItemRepository.findAll().stream()
                .filter(ti -> ti.getTransfer().getTransferId().equals(transfer.getTransferId()))
                .collect(Collectors.toList());

        for (TransferItem item : items) {
            if (item.getAsset() != null) {
                Asset asset = item.getAsset();
                if (asset.getCurrentBase() == null || !asset.getCurrentBase().getBaseId().equals(transfer.getFromBase().getBaseId())) {
                    throw new IllegalArgumentException("Asset " + asset.getAssetTag() + " no longer belongs to the source base");
                }
                asset.setCurrentBase(transfer.getToBase());
                assetRepository.save(asset);
            } else {
                // Bulk inventory check
                int available = getAvailableInventory(transfer.getFromBase().getBaseId(), item.getEquipmentType().getEquipmentTypeId());
                if (item.getQuantity() > available) {
                    throw new IllegalArgumentException("Insufficient available inventory for equipment type: " + item.getEquipmentType().getEquipmentName());
                }
            }
        }

        transfer.setStatus("COMPLETED");
        Transfer savedTransfer = transferRepository.save(transfer);
        auditLogService.logAction("TRANSFER_COMPLETE", "TRANSFER", savedTransfer.getTransferId(), "Transfer " + savedTransfer.getReferenceNumber() + " completed", null);
        return mapToResponse(savedTransfer);
    }

    @Override
    @Transactional
    public TransferResponse cancelTransfer(Long id) {
        Transfer transfer = getTransferEntity(id);
        verifyAccess(transfer);

        if (!"PENDING".equals(transfer.getStatus())) {
            throw new IllegalArgumentException("Only PENDING transfers can be cancelled");
        }

        transfer.setStatus("CANCELLED");
        Transfer savedTransfer = transferRepository.save(transfer);
        auditLogService.logAction("TRANSFER_CANCEL", "TRANSFER", savedTransfer.getTransferId(), "Transfer " + savedTransfer.getReferenceNumber() + " cancelled", null);
        return mapToResponse(savedTransfer);
    }

    @Autowired
    private ExpenditureRepository expenditureRepository;

    @Override
    public Integer getAvailableInventory(Long baseId, Long equipmentTypeId) {
        Integer purchased = purchaseRepository.sumPurchasesByBaseAndEquipment(baseId, equipmentTypeId);
        Integer transferredIn = transferItemRepository.sumTransferInByBaseAndEquipment(baseId, equipmentTypeId);
        Integer transferredOut = transferItemRepository.sumTransferOutByBaseAndEquipment(baseId, equipmentTypeId);
        Integer expended = expenditureRepository.sumExpendituresByBaseAndEquipment(baseId, equipmentTypeId);
        
        return purchased + transferredIn - transferredOut - expended;
    }

    private void verifyAccess(Transfer transfer) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                Long userBaseId = userDetails.getBaseId();
                if (!transfer.getFromBase().getBaseId().equals(userBaseId) && !transfer.getToBase().getBaseId().equals(userBaseId)) {
                    throw new AccessDeniedException("Access denied to this transfer");
                }
            }
        }
    }

    private Transfer getTransferEntity(Long id) {
        return transferRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Transfer not found: " + id));
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) principal).getUserId();
            return userRepository.findById(userId).orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        }
        throw new IllegalStateException("No authenticated user found");
    }

    private TransferResponse mapToResponse(Transfer transfer) {
        TransferResponse response = new TransferResponse();
        response.setTransferId(transfer.getTransferId());
        
        BaseResponse from = new BaseResponse();
        from.setBaseId(transfer.getFromBase().getBaseId());
        from.setBaseName(transfer.getFromBase().getBaseName());
        response.setFromBase(from);

        BaseResponse to = new BaseResponse();
        to.setBaseId(transfer.getToBase().getBaseId());
        to.setBaseName(transfer.getToBase().getBaseName());
        response.setToBase(to);

        response.setTransferDate(transfer.getTransferDate());
        response.setReferenceNumber(transfer.getReferenceNumber());
        response.setStatus(transfer.getStatus());

        if (transfer.getInitiatedBy() != null) {
            response.setInitiatedById(transfer.getInitiatedBy().getUserId());
            response.setInitiatedByUsername(transfer.getInitiatedBy().getUsername());
        }

        response.setCreatedAt(transfer.getCreatedAt());
        response.setUpdatedAt(transfer.getUpdatedAt());

        // We fetch items securely. Assuming lazy loading works inside @Transactional.
        List<TransferItemResponse> itemResponses = new ArrayList<>();
        // Quick fetch of items using repository to avoid LazyInitializationException if outside session
        List<TransferItem> items = transferItemRepository.findAll().stream()
                .filter(ti -> ti.getTransfer().getTransferId().equals(transfer.getTransferId()))
                .collect(Collectors.toList());

        for (TransferItem item : items) {
            TransferItemResponse tir = new TransferItemResponse();
            tir.setTransferItemId(item.getTransferItemId());
            
            EquipmentTypeResponse er = new EquipmentTypeResponse();
            er.setEquipmentTypeId(item.getEquipmentType().getEquipmentTypeId());
            er.setEquipmentName(item.getEquipmentType().getEquipmentName());
            tir.setEquipmentType(er);

            if (item.getAsset() != null) {
                AssetResponse ar = new AssetResponse();
                ar.setAssetId(item.getAsset().getAssetId());
                ar.setAssetTag(item.getAsset().getAssetTag());
                tir.setAsset(ar);
            }
            
            tir.setQuantity(item.getQuantity());
            itemResponses.add(tir);
        }
        response.setItems(itemResponses);

        return response;
    }
}
