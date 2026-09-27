package com.mams.service;

import com.mams.entity.User;

public interface AuditLogService {
    void logAction(User user, String action, String entityType, Long entityId, String description, String ipAddress);
    void logAction(String action, String entityType, Long entityId, String description, String ipAddress); // Auto-fetches current user
}
