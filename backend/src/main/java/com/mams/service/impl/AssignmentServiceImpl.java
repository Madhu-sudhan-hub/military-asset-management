package com.mams.service.impl;

import com.mams.dto.request.AssignmentRequest;
import com.mams.dto.response.AssignmentResponse;
import com.mams.dto.response.AssetResponse;
import com.mams.dto.response.BaseResponse;
import com.mams.dto.response.PersonnelResponse;
import com.mams.entity.Asset;
import com.mams.entity.Assignment;
import com.mams.entity.Personnel;
import com.mams.entity.User;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.AssignmentRepository;
import com.mams.repository.UserRepository;
import com.mams.security.SecurityService;
import com.mams.security.UserDetailsImpl;
import com.mams.service.AssignmentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AssignmentServiceImpl implements AssignmentService {

    @Autowired
    private AssignmentRepository assignmentRepository;

    @Autowired
    private JpaRepository<Asset, Long> assetRepository;

    @Autowired
    private JpaRepository<Personnel, Long> personnelRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private SecurityService securityService;

    @Autowired
    private com.mams.service.AuditLogService auditLogService;

    @Override
    @Transactional(readOnly = true)
    public Page<AssignmentResponse> searchAssignments(Long personnelId, Long assetId, Long baseId, String status, LocalDateTime startDate, LocalDateTime endDate, Pageable pageable) {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                Long userBaseId = userDetails.getBaseId();
                if (userBaseId == null) {
                    throw new AccessDeniedException("User is not assigned to a base");
                }
                if (baseId != null && !baseId.equals(userBaseId)) {
                    throw new AccessDeniedException("Access denied to this base");
                }
                baseId = userBaseId;
            }
        }

        return assignmentRepository.searchAssignments(personnelId, assetId, baseId, status, startDate, endDate, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AssignmentResponse getAssignmentById(Long id) {
        Assignment assignment = getAssignmentEntity(id);
        verifyAccess(assignment);
        return mapToResponse(assignment);
    }

    @Override
    @Transactional
    public AssignmentResponse createAssignment(AssignmentRequest request) {
        Asset asset = assetRepository.findById(request.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found"));

        Personnel personnel = personnelRepository.findById(request.getPersonnelId())
                .orElseThrow(() -> new ResourceNotFoundException("Personnel not found"));

        if (!securityService.canAccessBase(asset.getCurrentBase().getBaseId()) || 
            !securityService.canAccessBase(personnel.getBase().getBaseId())) {
            throw new AccessDeniedException("You do not have permission to assign this asset or personnel");
        }

        if (assignmentRepository.existsByAsset_AssetIdAndStatus(asset.getAssetId(), "ACTIVE")) {
            throw new IllegalArgumentException("Asset is already actively assigned");
        }

        if ("EXPENDED".equals(asset.getStatus())) {
            throw new IllegalArgumentException("Asset is expended and cannot be assigned");
        }

        User currentUser = getAuthenticatedUser();

        Assignment assignment = new Assignment();
        assignment.setAsset(asset);
        assignment.setPersonnel(personnel);
        assignment.setAssignedDate(request.getAssignedDate());
        assignment.setStatus("ACTIVE");
        assignment.setNotes(request.getNotes());
        assignment.setAssignedBy(currentUser);

        Assignment savedAssignment = assignmentRepository.save(assignment);
        auditLogService.logAction(currentUser, "ASSIGNMENT_CREATE", "ASSIGNMENT", savedAssignment.getAssignmentId(), "Asset " + asset.getAssetTag() + " assigned to personnel " + personnel.getPersonnelId(), null);

        return mapToResponse(savedAssignment);
    }

    @Override
    @Transactional
    public AssignmentResponse returnAssignment(Long id) {
        Assignment assignment = getAssignmentEntity(id);
        verifyAccess(assignment);

        if (!"ACTIVE".equals(assignment.getStatus())) {
            throw new IllegalArgumentException("Only ACTIVE assignments can be returned");
        }

        assignment.setStatus("RETURNED");
        assignment.setReturnedDate(LocalDateTime.now());
        Assignment savedAssignment = assignmentRepository.save(assignment);
        auditLogService.logAction("ASSIGNMENT_RETURN", "ASSIGNMENT", savedAssignment.getAssignmentId(), "Assignment for Asset " + assignment.getAsset().getAssetTag() + " returned", null);
        return mapToResponse(savedAssignment);
    }

    @Override
    @Transactional
    public AssignmentResponse cancelAssignment(Long id) {
        Assignment assignment = getAssignmentEntity(id);
        verifyAccess(assignment);

        if (!"ACTIVE".equals(assignment.getStatus())) {
            throw new IllegalArgumentException("Only ACTIVE assignments can be cancelled");
        }

        assignment.setStatus("CANCELLED");
        Assignment savedAssignment = assignmentRepository.save(assignment);
        auditLogService.logAction("ASSIGNMENT_CANCEL", "ASSIGNMENT", savedAssignment.getAssignmentId(), "Assignment for Asset " + assignment.getAsset().getAssetTag() + " cancelled", null);
        return mapToResponse(savedAssignment);
    }

    private void verifyAccess(Assignment assignment) {
        if (!securityService.canAccessBase(assignment.getAsset().getCurrentBase().getBaseId()) &&
            !securityService.canAccessBase(assignment.getPersonnel().getBase().getBaseId())) {
            throw new AccessDeniedException("Access denied to this assignment");
        }
    }

    private Assignment getAssignmentEntity(Long id) {
        return assignmentRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Assignment not found: " + id));
    }

    private User getAuthenticatedUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            Long userId = ((UserDetailsImpl) principal).getUserId();
            return userRepository.findById(userId).orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
        }
        throw new IllegalStateException("No authenticated user found");
    }

    private AssignmentResponse mapToResponse(Assignment assignment) {
        AssignmentResponse response = new AssignmentResponse();
        response.setAssignmentId(assignment.getAssignmentId());
        response.setAssignedDate(assignment.getAssignedDate());
        response.setReturnedDate(assignment.getReturnedDate());
        response.setStatus(assignment.getStatus());
        response.setNotes(assignment.getNotes());

        if (assignment.getAssignedBy() != null) {
            response.setAssignedById(assignment.getAssignedBy().getUserId());
            response.setAssignedByUsername(assignment.getAssignedBy().getUsername());
        }

        AssetResponse ar = new AssetResponse();
        ar.setAssetId(assignment.getAsset().getAssetId());
        ar.setAssetTag(assignment.getAsset().getAssetTag());
        response.setAsset(ar);

        PersonnelResponse pr = new PersonnelResponse();
        pr.setPersonnelId(assignment.getPersonnel().getPersonnelId());
        pr.setFullName(assignment.getPersonnel().getFullName());
        pr.setEmployeeNumber(assignment.getPersonnel().getEmployeeNumber());
        BaseResponse br = new BaseResponse();
        br.setBaseId(assignment.getPersonnel().getBase().getBaseId());
        br.setBaseName(assignment.getPersonnel().getBase().getBaseName());
        pr.setBase(br);
        response.setPersonnel(pr);

        response.setCreatedAt(assignment.getCreatedAt());
        response.setUpdatedAt(assignment.getUpdatedAt());

        return response;
    }
}
