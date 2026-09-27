package com.mams.service.impl;

import com.mams.dto.request.PurchaseRequest;
import com.mams.dto.response.BaseResponse;
import com.mams.dto.response.EquipmentTypeResponse;
import com.mams.dto.response.PurchaseResponse;
import com.mams.entity.Base;
import com.mams.entity.EquipmentType;
import com.mams.entity.Purchase;
import com.mams.entity.User;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.BaseRepository;
import com.mams.repository.EquipmentTypeRepository;
import com.mams.repository.PurchaseRepository;
import com.mams.repository.UserRepository;
import com.mams.security.UserDetailsImpl;
import com.mams.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;

@Service
public class PurchaseServiceImpl implements PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;
    
    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.mams.security.SecurityService securityService;

    @Autowired
    private com.mams.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<PurchaseResponse> searchPurchases(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, Pageable pageable) {
        // Enforce RBAC for listing
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                // If not admin, force baseId to their assigned base
                Long userBaseId = userDetails.getBaseId();
                if (userBaseId == null) {
                    throw new org.springframework.security.access.AccessDeniedException("User is not assigned to a base");
                }
                if (baseId != null && !baseId.equals(userBaseId)) {
                    throw new org.springframework.security.access.AccessDeniedException("Access denied to this base");
                }
                baseId = userBaseId; // Force the filter
            }
        }

        return purchaseRepository.searchPurchases(baseId, equipmentTypeId, startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseResponse getPurchaseById(Long id) {
        Purchase purchase = getPurchaseEntity(id);
        if (!securityService.canAccessBase(purchase.getBase().getBaseId())) {
            throw new org.springframework.security.access.AccessDeniedException("Access denied to this base");
        }
        return mapToResponse(purchase);
    }

    @Override
    @Transactional
    public PurchaseResponse createPurchase(PurchaseRequest request) {
        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found: " + request.getBaseId()));
                
        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found: " + request.getEquipmentTypeId()));

        User currentUser = getAuthenticatedUser();

        try {
            Purchase purchase = new Purchase();
            purchase.setBase(base);
            purchase.setEquipmentType(equipmentType);
            purchase.setQuantity(request.getQuantity());
            purchase.setPurchaseDate(request.getPurchaseDate());
            purchase.setSupplier(request.getSupplier());
            purchase.setReferenceNumber(request.getReferenceNumber());
            purchase.setUnitCost(request.getUnitCost());
            
            // Calculate securely on backend
            BigDecimal totalCost = request.getUnitCost().multiply(BigDecimal.valueOf(request.getQuantity()));
            purchase.setTotalCost(totalCost);
            
            purchase.setCreatedBy(currentUser);

            Purchase savedPurchase = purchaseRepository.save(purchase);
            auditLogService.logAction(currentUser, "PURCHASE_CREATE", "PURCHASE", savedPurchase.getPurchaseId(), "Purchase created for equipment type " + equipmentType.getEquipmentTypeId() + " at base " + base.getBaseId(), null);
            return mapToResponse(savedPurchase);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Purchase with reference number " + request.getReferenceNumber() + " already exists.");
        }
    }

    @Override
    @Transactional
    public PurchaseResponse updatePurchase(Long id, PurchaseRequest request) {
        Purchase purchase = getPurchaseEntity(id);

        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found: " + request.getBaseId()));
                
        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found: " + request.getEquipmentTypeId()));

        try {
            purchase.setBase(base);
            purchase.setEquipmentType(equipmentType);
            purchase.setQuantity(request.getQuantity());
            purchase.setPurchaseDate(request.getPurchaseDate());
            purchase.setSupplier(request.getSupplier());
            purchase.setReferenceNumber(request.getReferenceNumber());
            purchase.setUnitCost(request.getUnitCost());
            
            // Recalculate securely on backend
            BigDecimal totalCost = request.getUnitCost().multiply(BigDecimal.valueOf(request.getQuantity()));
            purchase.setTotalCost(totalCost);

            Purchase savedPurchase = purchaseRepository.save(purchase);
            auditLogService.logAction("UPDATE", "PURCHASE", savedPurchase.getPurchaseId(), "Purchase updated", null);
            return mapToResponse(savedPurchase);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Purchase with reference number " + request.getReferenceNumber() + " already exists.");
        }
    }

    @Override
    @Transactional
    public void deletePurchase(Long id) {
        // Physical deletion is risky for transactions, but Phase 6 says:
        // "If you choose to allow DELETE during this development phase, document the decision clearly."
        // We will allow physical deletion for development simplicity, but it must be properly documented.
        Purchase purchase = getPurchaseEntity(id);
        purchaseRepository.delete(purchase);
        auditLogService.logAction("DELETE", "PURCHASE", id, "Purchase deleted", null);
    }

    private Purchase getPurchaseEntity(Long id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found: " + id));
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) principal).getUserId();
            return userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalStateException("Authenticated user not found in DB"));
        }
        throw new IllegalStateException("No authenticated user found");
    }

    private PurchaseResponse mapToResponse(Purchase purchase) {
        PurchaseResponse response = new PurchaseResponse();
        response.setPurchaseId(purchase.getPurchaseId());
        
        if (purchase.getBase() != null) {
            BaseResponse br = new BaseResponse();
            br.setBaseId(purchase.getBase().getBaseId());
            br.setBaseCode(purchase.getBase().getBaseCode());
            br.setBaseName(purchase.getBase().getBaseName());
            response.setBase(br);
        }
        
        if (purchase.getEquipmentType() != null) {
            EquipmentTypeResponse er = new EquipmentTypeResponse();
            er.setEquipmentTypeId(purchase.getEquipmentType().getEquipmentTypeId());
            er.setEquipmentCode(purchase.getEquipmentType().getEquipmentCode());
            er.setEquipmentName(purchase.getEquipmentType().getEquipmentName());
            er.setTrackingType(purchase.getEquipmentType().getTrackingType());
            response.setEquipmentType(er);
        }
        
        response.setQuantity(purchase.getQuantity());
        response.setPurchaseDate(purchase.getPurchaseDate());
        response.setSupplier(purchase.getSupplier());
        response.setReferenceNumber(purchase.getReferenceNumber());
        response.setUnitCost(purchase.getUnitCost());
        response.setTotalCost(purchase.getTotalCost());
        
        if (purchase.getCreatedBy() != null) {
            response.setCreatedById(purchase.getCreatedBy().getUserId());
            response.setCreatedByUsername(purchase.getCreatedBy().getUsername());
        }
        
        response.setCreatedAt(purchase.getCreatedAt());
        
        return response;
    }
}
