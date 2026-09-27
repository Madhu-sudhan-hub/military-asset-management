package com.mams.service;

import com.mams.dto.request.AssetRequest;
import com.mams.dto.response.AssetResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AssetService {
    Page<AssetResponse> getAllAssets(Long baseId, Long equipmentTypeId, String status, String search, Pageable pageable);
    AssetResponse getAssetById(Long id);
    AssetResponse createAsset(AssetRequest request);
    AssetResponse updateAsset(Long id, AssetRequest request);
    void deleteAsset(Long id);
}
