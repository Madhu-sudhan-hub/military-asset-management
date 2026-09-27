package com.mams.controller;

import com.mams.dto.request.LoginRequest;
import com.mams.dto.request.RegisterRequest;
import com.mams.dto.response.AuthResponse;
import com.mams.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private com.mams.service.AuditLogService auditLogService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        return new ResponseEntity<>(authService.register(request), HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        try {
            auditLogService.logAction("LOGOUT", "USER", null, "User logged out", null);
        } catch (Exception e) {
            // Ignore if context is missing
        }
        return ResponseEntity.ok().build();
    }
}
