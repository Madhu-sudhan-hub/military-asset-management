package com.mams.service;

import com.mams.dto.request.ExpenditureRequest;
import com.mams.dto.response.ExpenditureResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface ExpenditureService {
    Page<ExpenditureResponse> searchExpenditures(Long baseId, Long equipmentTypeId, Long assetId, String reason, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    ExpenditureResponse getExpenditureById(Long id);
    ExpenditureResponse createExpenditure(ExpenditureRequest request);
}
