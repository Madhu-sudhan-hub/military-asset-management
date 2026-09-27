package com.mams.controller;

import com.mams.dto.request.TransferRequest;
import com.mams.dto.response.TransferResponse;
import com.mams.service.TransferService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/transfers")
public class TransferController {

    @Autowired
    private TransferService transferService;

    // Note: RBAC is deeply enforced inside the TransferService
    // We do not rely solely on simple @PreAuthorize for complex dual-base scenarios

    @GetMapping
    public ResponseEntity<Page<TransferResponse>> getTransfers(
            @RequestParam(required = false) Long fromBaseId,
            @RequestParam(required = false) Long toBaseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @PageableDefault(sort = "transferDate", direction = Sort.Direction.DESC) Pageable pageable) {
        
        return ResponseEntity.ok(transferService.searchTransfers(fromBaseId, toBaseId, status, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransferResponse> getTransferById(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.getTransferById(id));
    }

    @PostMapping
    public ResponseEntity<TransferResponse> createTransfer(@Valid @RequestBody TransferRequest request) {
        return new ResponseEntity<>(transferService.createTransfer(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/complete")
    public ResponseEntity<TransferResponse> completeTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.completeTransfer(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<TransferResponse> cancelTransfer(@PathVariable Long id) {
        return ResponseEntity.ok(transferService.cancelTransfer(id));
    }
}
