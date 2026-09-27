package com.mams.controller;

import com.mams.dto.request.ExpenditureRequest;
import com.mams.dto.response.ExpenditureResponse;
import com.mams.service.ExpenditureService;
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
@RequestMapping("/api/expenditures")
public class ExpenditureController {

    @Autowired
    private ExpenditureService expenditureService;

    @GetMapping
    public ResponseEntity<Page<ExpenditureResponse>> getExpenditures(
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) Long equipmentTypeId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) String reason,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @PageableDefault(sort = "expenditureDate", direction = Sort.Direction.DESC) Pageable pageable) {
        
        return ResponseEntity.ok(expenditureService.searchExpenditures(baseId, equipmentTypeId, assetId, reason, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExpenditureResponse> getExpenditureById(@PathVariable Long id) {
        return ResponseEntity.ok(expenditureService.getExpenditureById(id));
    }

    @PostMapping
    public ResponseEntity<ExpenditureResponse> createExpenditure(@Valid @RequestBody ExpenditureRequest request) {
        return new ResponseEntity<>(expenditureService.createExpenditure(request), HttpStatus.CREATED);
    }
}
