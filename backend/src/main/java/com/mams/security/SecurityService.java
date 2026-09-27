package com.mams.security;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class SecurityService {

    public boolean canAccessBase(Long requestedBaseId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            return false;
        }

        boolean isAdmin = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(role -> role.equals("ROLE_ADMIN"));

        if (isAdmin) {
            return true;
        }

        if (auth.getPrincipal() instanceof UserDetailsImpl) {
            UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
            boolean isBaseCommander = auth.getAuthorities().stream()
                    .map(GrantedAuthority::getAuthority)
                    .anyMatch(role -> role.equals("ROLE_BASE_COMMANDER"));

            if (isBaseCommander) {
                Long userBaseId = userDetails.getBaseId();
                return userBaseId != null && userBaseId.equals(requestedBaseId);
            }
            
            // Logistics Officers might have different rules, but typically tied to their base as well
            Long userBaseId = userDetails.getBaseId();
            return userBaseId != null && userBaseId.equals(requestedBaseId);
        }

        return false;
    }
}
