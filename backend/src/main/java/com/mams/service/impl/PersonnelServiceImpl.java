package com.mams.service.impl;

import com.mams.dto.request.PersonnelRequest;
import com.mams.dto.response.BaseResponse;
import com.mams.dto.response.PersonnelResponse;
import com.mams.entity.Base;
import com.mams.entity.Personnel;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.BaseRepository;
import com.mams.repository.PersonnelRepository;
import com.mams.service.PersonnelService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PersonnelServiceImpl implements PersonnelService {

    @Autowired
    private PersonnelRepository personnelRepository;

    @Autowired
    private BaseRepository baseRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<PersonnelResponse> getAllPersonnel(Pageable pageable) {
        return personnelRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public PersonnelResponse getPersonnelById(Long id) {
        Personnel personnel = getPersonnelEntity(id);
        return mapToResponse(personnel);
    }

    @Override
    @Transactional
    public PersonnelResponse createPersonnel(PersonnelRequest request) {
        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));

        try {
            Personnel personnel = new Personnel();
            personnel.setEmployeeNumber(request.getEmployeeNumber());
            personnel.setFullName(request.getFullName());
            personnel.setRank(request.getRank());
            personnel.setContactNumber(request.getContactNumber());
            personnel.setBase(base);
            personnel.setStatus(request.getStatus());

            Personnel savedPersonnel = personnelRepository.save(personnel);
            return mapToResponse(savedPersonnel);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Personnel with employee number " + request.getEmployeeNumber() + " already exists.");
        }
    }

    @Override
    @Transactional
    public PersonnelResponse updatePersonnel(Long id, PersonnelRequest request) {
        Personnel personnel = getPersonnelEntity(id);
        Base base = baseRepository.findById(request.getBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found with id: " + request.getBaseId()));

        try {
            personnel.setEmployeeNumber(request.getEmployeeNumber());
            personnel.setFullName(request.getFullName());
            personnel.setRank(request.getRank());
            personnel.setContactNumber(request.getContactNumber());
            personnel.setBase(base);
            personnel.setStatus(request.getStatus());

            Personnel updatedPersonnel = personnelRepository.save(personnel);
            return mapToResponse(updatedPersonnel);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Personnel with employee number " + request.getEmployeeNumber() + " already exists.");
        }
    }

    @Override
    @Transactional
    public void deletePersonnel(Long id) {
        Personnel personnel = getPersonnelEntity(id);
        personnelRepository.delete(personnel);
    }

    private Personnel getPersonnelEntity(Long id) {
        return personnelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Personnel not found with id: " + id));
    }

    private PersonnelResponse mapToResponse(Personnel personnel) {
        PersonnelResponse response = new PersonnelResponse();
        response.setPersonnelId(personnel.getPersonnelId());
        response.setEmployeeNumber(personnel.getEmployeeNumber());
        response.setFullName(personnel.getFullName());
        response.setRank(personnel.getRank());
        response.setContactNumber(personnel.getContactNumber());
        response.setStatus(personnel.getStatus());
        response.setCreatedAt(personnel.getCreatedAt());

        if (personnel.getBase() != null) {
            BaseResponse baseResponse = new BaseResponse();
            baseResponse.setBaseId(personnel.getBase().getBaseId());
            baseResponse.setBaseCode(personnel.getBase().getBaseCode());
            baseResponse.setBaseName(personnel.getBase().getBaseName());
            response.setBase(baseResponse);
        }

        return response;
    }
}
