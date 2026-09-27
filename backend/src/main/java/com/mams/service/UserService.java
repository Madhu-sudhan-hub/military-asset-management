package com.mams.service;

import com.mams.dto.request.RegisterRequest;
import com.mams.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Long id);
    UserResponse createUser(RegisterRequest request);
    UserResponse updateUser(Long id, RegisterRequest request);
    UserResponse updateRole(Long id, String roleName);
    UserResponse updateStatus(Long id, String status);
}
