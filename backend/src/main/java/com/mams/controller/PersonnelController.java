package com.mams.controller;

import com.mams.dto.request.PersonnelRequest;
import com.mams.dto.response.PersonnelResponse;
import com.mams.service.PersonnelService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/personnel")
public class PersonnelController {

    @Autowired
    private PersonnelService personnelService;

    @GetMapping
    public ResponseEntity<Page<PersonnelResponse>> getAllPersonnel(Pageable pageable) {
        return ResponseEntity.ok(personnelService.getAllPersonnel(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<PersonnelResponse> getPersonnelById(@PathVariable Long id) {
        return ResponseEntity.ok(personnelService.getPersonnelById(id));
    }

    @PostMapping
    @PreAuthorize("@securityService.canAccessBase(#request.baseId)")
    public ResponseEntity<PersonnelResponse> createPersonnel(@Valid @RequestBody PersonnelRequest request) {
        return new ResponseEntity<>(personnelService.createPersonnel(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("@securityService.canAccessBase(#request.baseId)")
    public ResponseEntity<PersonnelResponse> updatePersonnel(@PathVariable Long id, @Valid @RequestBody PersonnelRequest request) {
        return ResponseEntity.ok(personnelService.updatePersonnel(id, request));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deletePersonnel(@PathVariable Long id) {
        personnelService.deletePersonnel(id);
        return ResponseEntity.noContent().build();
    }
}
