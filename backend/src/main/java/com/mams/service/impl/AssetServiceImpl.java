package com.mams.service.impl;

import com.mams.dto.request.AssetRequest;
import com.mams.dto.response.AssetResponse;
import com.mams.dto.response.BaseResponse;
import com.mams.dto.response.EquipmentTypeResponse;
import com.mams.entity.Asset;
import com.mams.entity.Base;
import com.mams.entity.EquipmentType;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.repository.AssetRepository;
import com.mams.repository.BaseRepository;
import com.mams.repository.EquipmentTypeRepository;
import com.mams.service.AssetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class AssetServiceImpl implements AssetService {

    @Autowired
    private AssetRepository assetRepository;

    @Autowired
    private EquipmentTypeRepository equipmentTypeRepository;

    @Autowired
    private BaseRepository baseRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<AssetResponse> getAllAssets(Long baseId, Long equipmentTypeId, String status, String search, Pageable pageable) {
        return assetRepository.searchAssets(baseId, equipmentTypeId, status, search, pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public AssetResponse getAssetById(Long id) {
        Asset asset = getAssetEntity(id);
        return mapToResponse(asset);
    }

    @Override
    @Transactional
    public AssetResponse createAsset(AssetRequest request) {
        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found"));

        if ("BULK".equals(equipmentType.getTrackingType())) {
            throw new IllegalArgumentException("Equipment Type is marked as BULK. Individual assets cannot be created for it.");
        }

        Base base = baseRepository.findById(request.getCurrentBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found"));

        try {
            Asset asset = new Asset();
            asset.setAssetTag(request.getAssetTag());
            asset.setSerialNumber(request.getSerialNumber());
            asset.setEquipmentType(equipmentType);
            asset.setCurrentBase(base);
            asset.setStatus(request.getStatus());
            asset.setAcquisitionDate(request.getAcquisitionDate());

            Asset savedAsset = assetRepository.save(asset);
            return mapToResponse(savedAsset);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Asset with tag or serial number already exists.");
        }
    }

    @Override
    @Transactional
    public AssetResponse updateAsset(Long id, AssetRequest request) {
        Asset asset = getAssetEntity(id);
        
        EquipmentType equipmentType = equipmentTypeRepository.findById(request.getEquipmentTypeId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment Type not found"));
        
        Base base = baseRepository.findById(request.getCurrentBaseId())
                .orElseThrow(() -> new ResourceNotFoundException("Base not found"));

        try {
            asset.setAssetTag(request.getAssetTag());
            asset.setSerialNumber(request.getSerialNumber());
            asset.setEquipmentType(equipmentType);
            asset.setCurrentBase(base);
            asset.setStatus(request.getStatus());
            asset.setAcquisitionDate(request.getAcquisitionDate());

            Asset updatedAsset = assetRepository.save(asset);
            return mapToResponse(updatedAsset);
        } catch (DataIntegrityViolationException ex) {
            throw new DuplicateResourceException("Asset with tag or serial number already exists.");
        }
    }

    @Override
    @Transactional
    public void deleteAsset(Long id) {
        Asset asset = getAssetEntity(id);
        try {
            assetRepository.delete(asset);
        } catch (DataIntegrityViolationException e) {
            throw new IllegalStateException("Cannot delete asset. It is referenced by transactions or assignments.");
        }
    }

    private Asset getAssetEntity(Long id) {
        return assetRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found with id: " + id));
    }

    private AssetResponse mapToResponse(Asset asset) {
        AssetResponse response = new AssetResponse();
        response.setAssetId(asset.getAssetId());
        response.setAssetTag(asset.getAssetTag());
        response.setSerialNumber(asset.getSerialNumber());
        response.setStatus(asset.getStatus());
        response.setAcquisitionDate(asset.getAcquisitionDate());
        response.setCreatedAt(asset.getCreatedAt());

        if (asset.getEquipmentType() != null) {
            EquipmentTypeResponse typeRes = new EquipmentTypeResponse();
            typeRes.setEquipmentTypeId(asset.getEquipmentType().getEquipmentTypeId());
            typeRes.setEquipmentCode(asset.getEquipmentType().getEquipmentCode());
            typeRes.setEquipmentName(asset.getEquipmentType().getEquipmentName());
            typeRes.setTrackingType(asset.getEquipmentType().getTrackingType());
            response.setEquipmentType(typeRes);
        }

        if (asset.getCurrentBase() != null) {
            BaseResponse baseRes = new BaseResponse();
            baseRes.setBaseId(asset.getCurrentBase().getBaseId());
            baseRes.setBaseCode(asset.getCurrentBase().getBaseCode());
            baseRes.setBaseName(asset.getCurrentBase().getBaseName());
            response.setCurrentBase(baseRes);
        }

        return response;
    }
}
