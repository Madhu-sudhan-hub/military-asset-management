package com.mams.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mams.dto.request.BaseRequest;
import com.mams.dto.response.BaseResponse;
import com.mams.exception.DuplicateResourceException;
import com.mams.exception.ResourceNotFoundException;
import com.mams.service.BaseService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BaseController.class)
public class BaseControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BaseService baseService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    public void testCreateBase_Success() throws Exception {
        BaseRequest request = new BaseRequest();
        request.setBaseCode("B-01");
        request.setBaseName("Alpha Base");

        BaseResponse response = new BaseResponse();
        response.setBaseId(1L);
        response.setBaseCode("B-01");
        response.setBaseName("Alpha Base");

        Mockito.when(baseService.createBase(any(BaseRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/bases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.baseId").value(1L))
                .andExpect(jsonPath("$.baseCode").value("B-01"));
    }

    @Test
    public void testCreateBase_InvalidFields() throws Exception {
        BaseRequest request = new BaseRequest();
        // Missing required fields

        mockMvc.perform(post("/api/bases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.error").value("VALIDATION_ERROR"));
    }

    @Test
    public void testCreateBase_Duplicate() throws Exception {
        BaseRequest request = new BaseRequest();
        request.setBaseCode("B-01");
        request.setBaseName("Alpha Base");

        Mockito.when(baseService.createBase(any(BaseRequest.class)))
                .thenThrow(new DuplicateResourceException("Base code exists"));

        mockMvc.perform(post("/api/bases")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error").value("DUPLICATE_RESOURCE"));
    }

    @Test
    public void testGetBase_NotFound() throws Exception {
        Mockito.when(baseService.getBaseById(99L))
                .thenThrow(new ResourceNotFoundException("Not found"));

        mockMvc.perform(get("/api/bases/99"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("RESOURCE_NOT_FOUND"));
    }
}
