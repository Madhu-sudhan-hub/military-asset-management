package com.mams.service.impl;

import com.mams.dto.response.DashboardSummaryResponse;
import com.mams.dto.response.InventoryMovementResponse;
import com.mams.repository.AssignmentRepository;
import com.mams.repository.ExpenditureRepository;
import com.mams.repository.PurchaseRepository;
import com.mams.repository.TransferItemRepository;
import com.mams.security.UserDetailsImpl;
import com.mams.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;

@Service
public class DashboardServiceImpl implements DashboardService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private TransferItemRepository transferItemRepository;

    @Autowired
    private ExpenditureRepository expenditureRepository;

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Override
    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId) {
        baseId = resolveBaseIdForUser(baseId);

        Integer prevPurchases = purchaseRepository.sumPurchasesForDashboard(baseId, equipmentTypeId, null, startDate != null ? startDate.minusDays(1) : null);
        Integer prevTransferIn = transferItemRepository.sumTransferInForDashboard(baseId, equipmentTypeId, null, startDate != null ? startDate.atStartOfDay().minusNanos(1) : null);
        Integer prevTransferOut = transferItemRepository.sumTransferOutForDashboard(baseId, equipmentTypeId, null, startDate != null ? startDate.atStartOfDay().minusNanos(1) : null);
        Integer prevExpenditure = expenditureRepository.sumExpendituresForDashboard(baseId, equipmentTypeId, null, startDate != null ? startDate.atStartOfDay().minusNanos(1) : null);

        Integer openingBalance = prevPurchases + prevTransferIn - prevTransferOut - prevExpenditure;

        Integer currentPurchases = purchaseRepository.sumPurchasesForDashboard(baseId, equipmentTypeId, startDate, endDate);
        Integer currentTransferIn = transferItemRepository.sumTransferInForDashboard(baseId, equipmentTypeId, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.plusDays(1).atStartOfDay().minusNanos(1) : null);
        Integer currentTransferOut = transferItemRepository.sumTransferOutForDashboard(baseId, equipmentTypeId, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.plusDays(1).atStartOfDay().minusNanos(1) : null);
        Integer currentExpenditure = expenditureRepository.sumExpendituresForDashboard(baseId, equipmentTypeId, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.plusDays(1).atStartOfDay().minusNanos(1) : null);

        Integer netMovement = currentPurchases + currentTransferIn - currentTransferOut;
        Integer closingBalance = openingBalance + netMovement - currentExpenditure;

        Integer assignedCount = assignmentRepository.countAssignedForDashboard(baseId, equipmentTypeId);

        DashboardSummaryResponse response = new DashboardSummaryResponse();
        response.setStartDate(startDate);
        response.setEndDate(endDate);
        response.setBaseId(baseId);
        response.setEquipmentTypeId(equipmentTypeId);
        response.setOpeningBalance(openingBalance);
        response.setPurchases(currentPurchases);
        response.setTransferIn(currentTransferIn);
        response.setTransferOut(currentTransferOut);
        response.setNetMovement(netMovement);
        response.setExpenditure(currentExpenditure);
        response.setClosingBalance(closingBalance);
        response.setAssigned(assignedCount);

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryMovementResponse getInventoryMovement(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId) {
        baseId = resolveBaseIdForUser(baseId);

        Integer currentPurchases = purchaseRepository.sumPurchasesForDashboard(baseId, equipmentTypeId, startDate, endDate);
        Integer currentTransferIn = transferItemRepository.sumTransferInForDashboard(baseId, equipmentTypeId, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.plusDays(1).atStartOfDay().minusNanos(1) : null);
        Integer currentTransferOut = transferItemRepository.sumTransferOutForDashboard(baseId, equipmentTypeId, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.plusDays(1).atStartOfDay().minusNanos(1) : null);
        Integer currentExpenditure = expenditureRepository.sumExpendituresForDashboard(baseId, equipmentTypeId, startDate != null ? startDate.atStartOfDay() : null, endDate != null ? endDate.plusDays(1).atStartOfDay().minusNanos(1) : null);

        InventoryMovementResponse response = new InventoryMovementResponse();
        response.setStartDate(startDate);
        response.setEndDate(endDate);
        response.setBaseId(baseId);
        response.setEquipmentTypeId(equipmentTypeId);
        response.setPurchases(currentPurchases);
        response.setTransferIn(currentTransferIn);
        response.setTransferOut(currentTransferOut);
        response.setExpenditure(currentExpenditure);

        return response;
    }

    private Long resolveBaseIdForUser(Long requestedBaseId) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            
            if (!isAdmin) {
                Long userBaseId = userDetails.getBaseId();
                if (userBaseId == null) {
                    throw new AccessDeniedException("User is not assigned to a base");
                }
                if (requestedBaseId != null && !requestedBaseId.equals(userBaseId)) {
                    throw new AccessDeniedException("Access denied to this base");
                }
                return userBaseId; // Enforce user's base
            }
        }
        return requestedBaseId;
    }
}
