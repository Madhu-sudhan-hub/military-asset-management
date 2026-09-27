package com.mams.service;

import com.mams.dto.request.PurchaseRequest;
import com.mams.dto.response.PurchaseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDate;

public interface PurchaseService {
    Page<PurchaseResponse> searchPurchases(Long baseId, Long equipmentTypeId, LocalDate startDate, LocalDate endDate, Pageable pageable);
    PurchaseResponse getPurchaseById(Long id);
    PurchaseResponse createPurchase(PurchaseRequest request);
    PurchaseResponse updatePurchase(Long id, PurchaseRequest request);
    void deletePurchase(Long id);
}
