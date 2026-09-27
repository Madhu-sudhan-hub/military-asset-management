package com.mams.service.impl;

import com.mams.dto.request.EquipmentTypeRequest;
import com.mams.dto.response.EquipmentTypeResponse;
import com.mams.entity.EquipmentType;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.EquipmentTypeRepository;
import com.mams.service.EquipmentTypeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class EquipmentTypeServiceImpl implements EquipmentTypeService {

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<EquipmentTypeResponse> getAllEquipmentTypes(Pageable pageable) {
        return equipmentTypeRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public EquipmentTypeResponse getEquipmentTypeById(Long id) {
        EquipmentType equipmentType = getEquipmentTypeEntity(id);
        return mapToResponse(equipmentType);
    }

    @Override
    @Transactional
    public EquipmentTypeResponse createEquipmentType(EquipmentTypeRequest request) {
        validateCategory(request.getCategory());
        validateTrackingType(request.getTrackingType());

        try {
            EquipmentType equipmentType = new EquipmentType();
            equipmentType.setEquipmentCode(request.getEquipmentCode());
            equipmentType.setEquipmentName(request.getEquipmentName());
            equipmentType.setCategory(request.getCategory());
            equipmentType.setTrackingType(request.getTrackingType());
            equipmentType.setUnitOfMeasure(request.getUnitOfMeasure());
            equipmentType.setStatus(request.getStatus());

            EquipmentType savedType = equipmentTypeRepository.save(equipmentType);
            return mapToResponse(savedType);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Equipment Type with code " + request.getEquipmentCode() + " already exists.");
        }
    }

    @Override
    @Transactional
    public EquipmentTypeResponse updateEquipmentType(Long id, EquipmentTypeRequest request) {
        validateCategory(request.getCategory());
        validateTrackingType(request.getTrackingType());

        EquipmentType equipmentType = getEquipmentTypeEntity(id);

        try {
            equipmentType.setEquipmentCode(request.getEquipmentCode());
            equipmentType.setEquipmentName(request.getEquipmentName());
            equipmentType.setCategory(request.getCategory());
            equipmentType.setTrackingType(request.getTrackingType());
            equipmentType.setUnitOfMeasure(request.getUnitOfMeasure());
            equipmentType.setStatus(request.getStatus());

            EquipmentType updatedType = equipmentTypeRepository.save(equipmentType);
            return mapToResponse(updatedType);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Equipment Type with code " + request.getEquipmentCode() + " already exists.");
        }
    }

    @Override
    @Transactional
    public void deleteEquipmentType(Long id) {
        EquipmentType equipmentType = getEquipmentTypeEntity(id);
        try {
            equipmentTypeRepository.delete(equipmentType);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete equipment type. It is referenced by assets or transactions.");
        }
    }

    private EquipmentType getEquipmentTypeEntity(Long id) {
        return equipmentTypeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found with id: " + id));
    }

    private void validateCategory(String category) {
        if (!category.equals("VEHICLE") && !category.equals("WEAPON") && 
            !category.equals("AMMUNITION") && !category.equals("COMMUNICATION") && !category.equals("OTHER")) {
            throw new IllegalArgumentException("Invalid category. Must be VEHICLE, WEAPON, AMMUNITION, COMMUNICATION, or OTHER");
        }
    }

    private void validateTrackingType(String trackingType) {
        if (!trackingType.equals("INDIVIDUAL") && !trackingType.equals("BULK")) {
            throw new IllegalArgumentException("Invalid tracking type. Must be INDIVIDUAL or BULK");
        }
    }

    private EquipmentTypeResponse mapToResponse(EquipmentType equipmentType) {
        EquipmentTypeResponse response = new EquipmentTypeResponse();
        response.setEquipmentTypeId(equipmentType.getEquipmentTypeId());
        response.setEquipmentCode(equipmentType.getEquipmentCode());
        response.setEquipmentName(equipmentType.getEquipmentName());
        response.setCategory(equipmentType.getCategory());
        response.setTrackingType(equipmentType.getTrackingType());
        response.setUnitOfMeasure(equipmentType.getUnitOfMeasure());
        response.setStatus(equipmentType.getStatus());
        response.setCreatedAt(equipmentType.getCreatedAt());
        return response;
    }
}
