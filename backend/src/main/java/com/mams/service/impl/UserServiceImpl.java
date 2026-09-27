package com.mams.service.impl;

import com.mams.dto.request.RegisterRequest;
import com.mams.dto.response.UserResponse;
import com.mams.entity.Role;
import com.mams.entity.User;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.BaseRepository;
import com.mams.repository.PersonnelRepository;
import com.mams.repository.RoleRepository;
import com.mams.repository.UserRepository;
import com.mams.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

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

    @Override
    @Transactional(readOnly = true)
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponse getUserById(Long id) {
        return mapToResponse(getUserEntity(id));
    }

    @Override
    @Transactional
    public UserResponse createUser(RegisterRequest request) {
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

        // Admin can set any role
        String roleName = request.getRole() != null ? request.getRole() : "LOGISTICS_OFFICER";
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        user.getRoles().add(role);

        return mapToResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateUser(Long id, RegisterRequest request) {
        User user = getUserEntity(id);

        if (!user.getUsername().equals(request.getUsername()) && userRepository.findByUsername(request.getUsername()).isPresent()) {
            throw new DuplicateResourceException("Username already exists");
        }
        if (!user.getEmail().equals(request.getEmail()) && userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateResourceException("Email already exists");
        }

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        
        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        }

        if (request.getBaseId() != null) {
            user.setBase(baseRepository.findById(request.getBaseId()).orElse(null));
        }
        if (request.getPersonnelId() != null) {
            user.setPersonnel(personnelRepository.findById(request.getPersonnelId()).orElse(null));
        }

        return mapToResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateRole(Long id, String roleName) {
        User user = getUserEntity(id);
        Role role = roleRepository.findByRoleName(roleName)
                .orElseThrow(() -> new ResourceNotFoundException("Role not found: " + roleName));
        
        user.getRoles().clear();
        user.getRoles().add(role);
        return mapToResponse(userRepository.save(user));
    }

    @Override
    @Transactional
    public UserResponse updateStatus(Long id, String status) {
        User user = getUserEntity(id);
        if (!status.equals("ACTIVE") && !status.equals("INACTIVE") && !status.equals("LOCKED")) {
            throw new IllegalArgumentException("Status must be ACTIVE, INACTIVE, or LOCKED");
        }
        user.setStatus(status);
        return mapToResponse(userRepository.save(user));
    }

    private User getUserEntity(Long id) {
        return userRepository.findById(id).orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
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
