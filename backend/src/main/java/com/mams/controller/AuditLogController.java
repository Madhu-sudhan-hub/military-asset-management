package com.mams.controller;

import com.mams.dto.response.AuditLogResponse;
import com.mams.entity.AuditLog;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.AuditLogRepository;
import com.mams.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit-logs")
public class AuditLogController {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @GetMapping
    public ResponseEntity<Page<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String entityType,
            @RequestParam(required = false) Long entityId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate,
            @PageableDefault(sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {

        verifyAdminAccess(); // BASE_COMMANDER shouldn't easily read full logs unless mapped. Admin only for now based on prompt or check base if required. Let's strictly enforce ADMIN for now, unless we can filter by base.

        Page<AuditLog> logs = auditLogRepository.searchAuditLogs(userId, action, entityType, entityId, startDate, endDate, pageable);
        return ResponseEntity.ok(logs.map(this::mapToResponse));
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuditLogResponse> getAuditLogById(@PathVariable Long id) {
        verifyAdminAccess();
        AuditLog log = auditLogRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("Audit Log not found"));
        return ResponseEntity.ok(mapToResponse(log));
    }

    private void verifyAdminAccess() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) principal;
            boolean isAdmin = userDetails.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin) {
                // For Phase 10, if determining base ownership from audit record is not directly possible, do not expose unrelated records.
                // The easiest safe approach when the entity doesn't natively map a Base is restricting to ADMIN.
                throw new AccessDeniedException("Only Admins can view audit logs directly.");
            }
        }
    }

    private AuditLogResponse mapToResponse(AuditLog log) {
        AuditLogResponse res = new AuditLogResponse();
        res.setAuditLogId(log.getAuditLogId());
        res.setAction(log.getAction());
        res.setEntityType(log.getEntityType());
        res.setEntityId(log.getEntityId());
        res.setDescription(log.getDescription());
        res.setIpAddress(log.getIpAddress());
        res.setCreatedAt(log.getCreatedAt());

        if (log.getUser() != null) {
            res.setUserId(log.getUser().getUserId());
            res.setUsername(log.getUser().getUsername());
        }

        return res;
    }
}
