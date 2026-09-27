package com.mams.service;

import com.mams.dto.request.LoginRequest;
import com.mams.dto.request.RegisterRequest;
import com.mams.dto.response.AuthResponse;
import com.mams.entity.Role;
import com.mams.entity.User;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.BaseRepository;
import com.mams.repository.PersonnelRepository;
import com.mams.repository.RoleRepository;
import com.mams.repository.UserRepository;
import com.mams.security.JwtService;
import com.mams.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class AuthService {

    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private RoleRepository roleRepository;
    
    @Autowired
    private BaseRepository baseRepository;
    
    @Autowired
    private PersonnelRepository personnelRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private JwtService jwtService;
    
    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private AuditLogService auditLogService;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists");
        }

        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setStatus("ACTIVE");

        if (request.getBaseId() != null) {
            user.setBase(baseRepository.findById(request.getBaseId()).orElse(null));
        }
        if (request.getPersonnelId() != null) {
            user.setPersonnel(personnelRepository.findById(request.getPersonnelId()).orElse(null));
        }

        Role defaultRole = roleRepository.findByRoleName("LOGISTICS_OFFICER")
                .orElseThrow(() -> new ResourceNotFoundException("Default role not found"));
        user.getRoles().add(defaultRole);

        User savedUser = userRepository.save(user);

        // Normally, the first user created without a session doesn't have an authenticated user yet
        // so we log with the newly created user as the actor
        auditLogService.logAction(savedUser, "USER_CREATE", "USER", savedUser.getUserId(), "User registered successfully", null);

        UserDetailsImpl userDetails = new UserDetailsImpl(savedUser);
        String jwtToken = jwtService.generateToken(userDetails);

        return new AuthResponse(jwtToken, jwtExpiration / 1000, mapToResponse(savedUser));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        Authentication auth = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsernameOrEmail(), request.getPassword())
        );

        UserDetailsImpl userDetails = (UserDetailsImpl) auth.getPrincipal();
        
        User user = userRepository.findById(userDetails.getUserId())
            .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        auditLogService.logAction(user, "LOGIN", "USER", user.getUserId(), "User logged in successfully", null);

        String jwtToken = jwtService.generateToken(userDetails);
        
        return new AuthResponse(jwtToken, jwtExpiration / 1000, mapToResponse(user));
    }

    private com.mams.dto.response.UserResponse mapToResponse(User user) {
        com.mams.dto.response.UserResponse response = new com.mams.dto.response.UserResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setStatus(user.getStatus());
        if (user.getBase() != null) response.setBaseId(user.getBase().getBaseId());
        if (user.getPersonnel() != null) response.setPersonnelId(user.getPersonnel().getPersonnelId());
        response.setRoles(user.getRoles().stream().map(Role::getRoleName).collect(Collectors.toList()));
        response.setLastLoginAt(user.getLastLoginAt());
        response.setCreatedAt(user.getCreatedAt());
        return response;
    }
}
