package com.mams.controller;

import com.mams.dto.request.EquipmentTypeRequest;
import com.mams.dto.response.EquipmentTypeResponse;
import com.mams.service.EquipmentTypeService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/equipment-types")
public class EquipmentTypeController {

    @Autowired
    private EquipmentTypeService equipmentTypeService;

    @GetMapping
    public ResponseEntity<Page<EquipmentTypeResponse>> getAllEquipmentTypes(Pageable pageable) {
        return ResponseEntity.ok(equipmentTypeService.getAllEquipmentTypes(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EquipmentTypeResponse> getEquipmentTypeById(@PathVariable Long id) {
        return ResponseEntity.ok(equipmentTypeService.getEquipmentTypeById(id));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EquipmentTypeResponse> createEquipmentType(@Valid @RequestBody EquipmentTypeRequest request) {
        return new ResponseEntity<>(equipmentTypeService.createEquipmentType(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<EquipmentTypeResponse> updateEquipmentType(@PathVariable Long id, @Valid @RequestBody EquipmentTypeRequest request) {
        return ResponseEntity.ok(equipmentTypeService.updateEquipmentType(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteEquipmentType(@PathVariable Long id) {
        equipmentTypeService.deleteEquipmentType(id);
        return ResponseEntity.noContent().build();
    }
}
