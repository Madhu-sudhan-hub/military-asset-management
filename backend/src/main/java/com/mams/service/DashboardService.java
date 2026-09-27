package com.mams.service;

import com.mams.dto.response.DashboardSummaryResponse;
import com.mams.dto.response.InventoryMovementResponse;

import java.time.LocalDate;

public interface DashboardService {
    DashboardSummaryResponse getDashboardSummary(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId);
    InventoryMovementResponse getInventoryMovement(LocalDate startDate, LocalDate endDate, Long baseId, Long equipmentTypeId);
}
