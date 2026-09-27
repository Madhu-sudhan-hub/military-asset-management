package com.mams.service;

import com.mams.dto.request.AssignmentRequest;
import com.mams.dto.response.AssignmentResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;

public interface AssignmentService {
    Page<AssignmentResponse> searchAssignments(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable);
    AssignmentResponse getAssignmentById(Long id);
    AssignmentResponse createAssignment(AssignmentRequest request);
    AssignmentResponse returnAssignment(Long id);
    AssignmentResponse cancelAssignment(Long id);
}
