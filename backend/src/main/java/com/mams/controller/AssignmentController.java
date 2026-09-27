package com.mams.controller;

import com.mams.dto.request.AssignmentRequest;
import com.mams.dto.response.AssignmentResponse;
import com.mams.service.AssignmentService;
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
@RequestMapping("/api/assignments")
public class AssignmentController {

    @Autowired
    private AssignmentService assignmentService;

    @GetMapping
    public ResponseEntity<Page<AssignmentResponse>> getAssignments(
            @RequestParam(required = false) Long personnelId,
            @RequestParam(required = false) Long assetId,
            @RequestParam(required = false) Long baseId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) LocalDateTime startDate,
            @RequestParam(required = false) LocalDateTime endDate,
            @PageableDefault(sort = "assignedDate", direction = Sort.Direction.DESC) Pageable pageable) {
        
        return ResponseEntity.ok(assignmentService.searchAssignments(personnelId, assetId, baseId, status, startDate, endDate, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AssignmentResponse> getAssignmentById(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.getAssignmentById(id));
    }

    @PostMapping
    public ResponseEntity<AssignmentResponse> createAssignment(@Valid @RequestBody AssignmentRequest request) {
        return new ResponseEntity<>(assignmentService.createAssignment(request), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/return")
    public ResponseEntity<AssignmentResponse> returnAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.returnAssignment(id));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<AssignmentResponse> cancelAssignment(@PathVariable Long id) {
        return ResponseEntity.ok(assignmentService.cancelAssignment(id));
    }
}
