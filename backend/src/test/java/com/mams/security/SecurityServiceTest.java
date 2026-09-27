package com.mams.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collection;
import java.util.Collections;
import java.util.List;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class SecurityServiceTest {

    @InjectMocks
    private SecurityService securityService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCanAccessBase_AdminAccess_ReturnsTrue() {
        // Arrange
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(authentication.isAuthenticated()).thenReturn(true);
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_ADMIN"));
        // Need cast to suppress compiler warnings on mockito
        when((Collection<GrantedAuthority>) authentication.getAuthorities()).thenReturn(authorities);

        // Act & Assert
        assertTrue(securityService.canAccessBase(1L));
        assertTrue(securityService.canAccessBase(2L));
    }

    @Test
    void testCanAccessBase_BaseCommanderSameBase_ReturnsTrue() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(authentication.isAuthenticated()).thenReturn(true);
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_BASE_COMMANDER"));
        when((Collection<GrantedAuthority>) authentication.getAuthorities()).thenReturn(authorities);

        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(userDetails.getBaseId()).thenReturn(1L);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        // Act & Assert
        assertTrue(securityService.canAccessBase(1L));
    }

    @Test
    void testCanAccessBase_BaseCommanderDifferentBase_ReturnsFalse() {
        Authentication authentication = mock(Authentication.class);
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        when(authentication.isAuthenticated()).thenReturn(true);
        Collection<GrantedAuthority> authorities = Collections.singletonList(new SimpleGrantedAuthority("ROLE_BASE_COMMANDER"));
        when((Collection<GrantedAuthority>) authentication.getAuthorities()).thenReturn(authorities);

        UserDetailsImpl userDetails = mock(UserDetailsImpl.class);
        when(userDetails.getBaseId()).thenReturn(1L);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        // Act & Assert
        assertFalse(securityService.canAccessBase(2L)); // Trying to access another base
    }

    @Test
    void testCanAccessBase_Unauthenticated_ReturnsFalse() {
        SecurityContextHolder.clearContext();
        assertFalse(securityService.canAccessBase(1L));
    }
}
