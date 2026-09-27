package com.mams.service;

import com.mams.dto.request.TransferRequest;
import com.mams.dto.response.TransferResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface TransferService {
    Page<TransferResponse> searchTransfers(Long fromBaseId, Long toBaseId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    TransferResponse getTransferById(Long id);
    TransferResponse createTransfer(TransferRequest request);
    TransferResponse completeTransfer(Long id);
    TransferResponse cancelTransfer(Long id);
    Integer getAvailableInventory(Long baseId, Long equipmentTypeId);
}
