package com.mams.service;

import com.mams.dto.request.PersonnelRequest;
import com.mams.dto.response.PersonnelResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface PersonnelService {
    Page<PersonnelResponse> getAllPersonnel(Pageable pageable);
    PersonnelResponse getPersonnelById(Long id);
    PersonnelResponse createPersonnel(PersonnelRequest request);
    PersonnelResponse updatePersonnel(Long id, PersonnelRequest request);
    void deletePersonnel(Long id);
}
