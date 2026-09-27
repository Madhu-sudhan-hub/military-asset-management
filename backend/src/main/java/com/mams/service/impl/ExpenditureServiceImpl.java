package com.mams.service.impl;

import com.mams.dto.request.ExpenditureRequest;
import com.mams.dto.response.AssetResponse;
import com.mams.dto.response.BaseResponse;
import com.mams.dto.response.EquipmentTypeResponse;
import com.mams.dto.response.ExpenditureResponse;
import com.mams.entity.Asset;
import com.mams.entity.Base;
import com.mams.entity.EquipmentType;
import com.mams.entity.Expenditure;
import com.mams.entity.User;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.BaseRepository;
import com.mams.repository.EquipmentTypeRepository;
import com.mams.repository.ExpenditureRepository;
import com.mams.repository.UserRepository;
import com.mams.security.SecurityService;
import com.mams.security.UserDetailsImpl;
import com.mams.service.ExpenditureService;
import com.mams.service.TransferService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class ExpenditureServiceImpl implements ExpenditureService {

    @Autowired
    private ExpenditureRepository expenditureRepository;

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private JpaRepository<Asset, Long> assetRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TransferService transferService;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private com.mams.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<ExpenditureResponse> searchExpenditures(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                Long userBaseId = userDetails.getBaseId();
                if (userBaseId == null) {
                    throw new AccessDeniedException("User is not assigned to a base");
                }
                if (baseId != null && !baseId.equals(userBaseId)) {
                    throw new AccessDeniedException("Access denied to this base");
                }
                baseId = userBaseId;
            }
        }

        return expenditureRepository.searchExpenditures(baseId, equipmentTypeId, assetId, reason, startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenditureResponse getExpenditureById(Long id) {
        Expenditure expenditure = expenditureRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Expenditure not found"));
        if (!securityService.canAccessBase(expenditure.getBase().getBaseId())) {
            throw new AccessDeniedException("Access denied to this expenditure");
        }
        return mapToResponse(expenditure);
    }

    @Override
    @Transactional
    public ExpenditureResponse createExpenditure(ExpenditureRequest request) {
        if (!securityService.canAccessBase(request.getBaseId())) {
            throw new AccessDeniedException("You do not have permission to record expenditure for this base");
        }

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found"));
        EquipmentType eqType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found"));

        Expenditure expenditure = new Expenditure();
        expenditure.setBase(base);
        expenditure.setEquipmentType(eqType);
        expenditure.setExpenditureDate(request.getExpenditureDate());
        expenditure.setReason(request.getReason());
        expenditure.setReferenceNumber(request.getReferenceNumber());
        expenditure.setRecordedBy(getAuthenticatedUser());

        if (request.getAssetId() != null) {
            Asset asset = assetRepository.findById(request.getAssetId())
                    .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));
            
            if (asset.getCurrentBase() == null || !asset.getCurrentBase().getBaseId().equals(base.getBaseId())) {
                throw new IllegalArgumentException("Asset does not belong to the selected base");
            }
            if (!asset.getEquipmentType().getEquipmentTypeId().equals(eqType.getEquipmentTypeId())) {
                throw new IllegalArgumentException("Asset type mismatch");
            }
            if ("EXPENDED".equals(asset.getStatus())) {
                throw new IllegalArgumentException("Asset is already expended");
            }

            asset.setStatus("EXPENDED");
            assetRepository.save(asset);
            
            expenditure.setAsset(asset);
            expenditure.setQuantity(1);
        } else {
            // Bulk check
            int available = transferService.getAvailableInventory(base.getBaseId(), eqType.getEquipmentTypeId());
            // Need to subtract existing expenditures? Wait, getAvailableInventory needs to include expenditures!
            // I'll update TransferServiceImpl to subtract expenditures as per rules.
            Integer previousExpenditures = expenditureRepository.sumExpendituresByBaseAndEquipment(base.getBaseId(), eqType.getEquipmentTypeId());
            available -= previousExpenditures;
            
            if (request.getQuantity() > available) {
                throw new IllegalArgumentException("Insufficient available inventory for the selected equipment type.");
            }
            expenditure.setQuantity(request.getQuantity());
        }

        Expenditure savedExpenditure = expenditureRepository.save(expenditure);
        auditLogService.logAction("EXPENDITURE_CREATE", "EXPENDITURE", savedExpenditure.getExpenditureId(), "Expenditure " + savedExpenditure.getReferenceNumber() + " recorded at base " + base.getBaseId(), null);
        return mapToResponse(savedExpenditure);
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) principal).getUserId();
            return userRepository.findById(userId).orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        }
        throw new IllegalStateException("No authenticated user found");
    }

    private ExpenditureResponse mapToResponse(Expenditure expenditure) {
        ExpenditureResponse response = new ExpenditureResponse();
        response.setExpenditureId(expenditure.getExpenditureId());
        response.setQuantity(expenditure.getQuantity());
        response.setExpenditureDate(expenditure.getExpenditureDate());
        response.setReason(expenditure.getReason());
        response.setReferenceNumber(expenditure.getReferenceNumber());

        BaseResponse b = new BaseResponse();
        b.setBaseId(expenditure.getBase().getBaseId());
        b.setBaseName(expenditure.getBase().getBaseName());
        response.setBase(b);

        EquipmentTypeResponse et = new EquipmentTypeResponse();
        et.setEquipmentTypeId(expenditure.getEquipmentType().getEquipmentTypeId());
        et.setEquipmentName(expenditure.getEquipmentType().getEquipmentName());
        response.setEquipmentType(et);

        if (expenditure.getAsset() != null) {
            AssetResponse a = new AssetResponse();
            a.setAssetId(expenditure.getAsset().getAssetId());
            a.setAssetTag(expenditure.getAsset().getAssetTag());
            response.setAsset(a);
        }

        if (expenditure.getRecordedBy() != null) {
            response.setRecordedById(expenditure.getRecordedBy().getUserId());
            response.setRecordedByUsername(expenditure.getRecordedBy().getUsername());
        }

        response.setCreatedAt(expenditure.getCreatedAt());

        return response;
    }
}
