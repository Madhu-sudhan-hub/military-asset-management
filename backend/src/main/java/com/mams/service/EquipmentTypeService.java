package com.mams.service;

import com.mams.dto.request.EquipmentTypeRequest;
import com.mams.dto.response.EquipmentTypeResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface EquipmentTypeService {
    Page<EquipmentTypeResponse> getAllEquipmentTypes(Pageable pageable);
    EquipmentTypeResponse getEquipmentTypeById(Long id);
    EquipmentTypeResponse createEquipmentType(EquipmentTypeRequest request);
    EquipmentTypeResponse updateEquipmentType(Long id, EquipmentTypeRequest request);
    void deleteEquipmentType(Long id);
}
