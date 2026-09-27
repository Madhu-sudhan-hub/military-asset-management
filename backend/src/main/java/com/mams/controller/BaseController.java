package com.mams.controller;

import com.mams.dto.request.BaseRequest;
import com.mams.dto.response.BaseResponse;
import com.mams.service.BaseService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/bases")
public class BaseController {

    @Autowired
    private BaseService baseService;

    @GetMapping
    public ResponseEntity<Page<BaseResponse>> getAllBases(Pageable pageable) {
        return ResponseEntity.ok(baseService.getAllBases(pageable));
    }

    @GetMapping("/{id}")
    @PreAuthorize("@securityService.canAccessBase(#id)")
    public ResponseEntity<BaseResponse> getBaseById(@PathVariable Long id) {
        return ResponseEntity.ok(baseService.getBaseById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> createBase(@Valid @RequestBody BaseRequest request) {
        return new ResponseEntity<>(baseService.createBase(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<BaseResponse> updateBase(@PathVariable Long id, @Valid @RequestBody BaseRequest request) {
        return ResponseEntity.ok(baseService.updateBase(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteBase(@PathVariable Long id) {
        baseService.deleteBase(id);
        return ResponseEntity.noContent().build();
    }
}
