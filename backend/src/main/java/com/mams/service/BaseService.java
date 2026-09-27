package com.mams.service;

import com.mams.dto.request.BaseRequest;
import com.mams.dto.response.BaseResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BaseService {
    Page<BaseResponse> getAllBases(Pageable pageable);
    BaseResponse getBaseById(Long id);
    BaseResponse createBase(BaseRequest request);
    BaseResponse updateBase(Long id, BaseRequest request);
    void deleteBase(Long id);
}
