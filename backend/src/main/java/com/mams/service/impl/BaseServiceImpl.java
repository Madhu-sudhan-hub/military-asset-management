package com.mams.service.impl;

import com.mams.dto.request.BaseRequest;
import com.mams.dto.response.BaseResponse;
import com.mams.entity.Base;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.AssetRepository;
import com.mams.repository.BaseRepository;
import com.mams.repository.PersonnelRepository;
import com.mams.service.BaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BaseServiceImpl implements BaseService {

    @Autowired
    private BaseRepository baseRepository;

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private PersonnelRepository personnelRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<BaseResponse> getAllBases(Pageable pageable) {
        return baseRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public BaseResponse getBaseById(Long id) {
        Base base = getBaseEntity(id);
        return mapToResponse(base);
    }

    @Override
    @Transactional
    public BaseResponse createBase(BaseRequest request) {
        try {
            Base base = new Base();
            base.setBaseCode(request.getBaseCode());
            base.setBaseName(request.getBaseName());
            base.setLocation(request.getLocation());
            base.setStatus(request.getStatus());

            Base savedBase = baseRepository.save(base);
            return mapToResponse(savedBase);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Base with code " + request.getBaseCode() + " already exists.");
        }
    }

    @Override
    @Transactional
    public BaseResponse updateBase(Long id, BaseRequest request) {
        Base base = getBaseEntity(id);
        
        try {
            base.setBaseCode(request.getBaseCode());
            base.setBaseName(request.getBaseName());
            base.setLocation(request.getLocation());
            base.setStatus(request.getStatus());

            Base updatedBase = baseRepository.save(base);
            return mapToResponse(updatedBase);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Base with code " + request.getBaseCode() + " already exists.");
        }
    }

    @Override
    @Transactional
    public void deleteBase(Long id) {
        Base base = getBaseEntity(id);
        
        // Don't blindly delete if referenced
        try {
            baseRepository.delete(base);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete base. It has related personnel or assets.");
        }
    }

    private Base getBaseEntity(Long id) {
        return baseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + id));
    }

    private BaseResponse mapToResponse(Base base) {
        BaseResponse response = new BaseResponse();
        response.setBaseId(base.getBaseId());
        response.setBaseCode(base.getBaseCode());
        response.setBaseName(base.getBaseName());
        response.setLocation(base.getLocation());
        response.setStatus(base.getStatus());
        response.setCreatedAt(base.getCreatedAt());
        return response;
    }
}
