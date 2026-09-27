package com.mams.controller;

import com.mams.dto.response.*;
import com.mams.service.ReportService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

import java.time.LocalDate;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

public class ReportControllerTest {

    private MockMvc mockMvc;

    @Mock
    private ReportService reportService;

    @InjectMocks
    private ReportController reportController;

    @BeforeEach
    public void setup() {
        MockitoAnnotations.openMocks(this);
        mockMvc = MockMvcBuilders.standaloneSetup(reportController).build();
    }

    @Test
    public void testGetInventoryReport() throws Exception {
        InventoryReportResponse response = new InventoryReportResponse();
        response.setBaseName("Base A");
        response.setOpeningBalance(100);
        Page<InventoryReportResponse> page = new PageImpl<>(Collections.singletonList(response));

        when(reportService.getInventoryReport(any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/reports/inventory")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].baseName").value("Base A"))
                .andExpect(jsonPath("$.content[0].openingBalance").value(100));
    }

    @Test
    public void testExportInventoryCsv() throws Exception {
        byte[] csvData = "Base,Equipment,Opening\nBase A,Rifle,100".getBytes();
        when(reportService.generateInventoryCsv(any(), any(), any(), any())).thenReturn(csvData);

        mockMvc.perform(get("/api/reports/inventory/export/csv"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "text/csv"))
                .andExpect(content().bytes(csvData));
    }

    @Test
    public void testExportInventoryExcel() throws Exception {
        byte[] excelData = new byte[]{1, 2, 3}; // Dummy byte array
        when(reportService.generateInventoryExcel(any(), any(), any(), any())).thenReturn(excelData);

        mockMvc.perform(get("/api/reports/inventory/export/excel"))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .andExpect(content().bytes(excelData));
    }

    @Test
    public void testGetPurchaseReport() throws Exception {
        PurchaseResponse response = new PurchaseResponse();
        response.setSupplier("Supplier A");
        Page<PurchaseResponse> page = new PageImpl<>(Collections.singletonList(response));

        when(reportService.getPurchaseReport(any(), any(), any(), any(), any(), any(), any())).thenReturn(page);

        mockMvc.perform(get("/api/reports/purchases")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].supplier").value("Supplier A"));
    }
}
