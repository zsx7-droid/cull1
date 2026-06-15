package com.sheculture.admin.controller;

import com.sheculture.admin.service.DataAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AnalysisController {
    
    @Autowired
    private DataAnalysisService dataAnalysisService;
    
    @GetMapping("/users/statistics")
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getUserStatistics());
        return result;
    }
    
    @GetMapping("/orders/statistics")
    public Map<String, Object> getOrderStatistics() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getOrderStatistics());
        return result;
    }
    
    @GetMapping("/products/statistics")
    public Map<String, Object> getProductStatistics() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getProductStatistics());
        return result;
    }
    
    @GetMapping("/cultures/statistics")
    public Map<String, Object> getCultureStatistics() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getCultureStatistics());
        return result;
    }
    
    @GetMapping("/feedbacks/statistics")
    public Map<String, Object> getFeedbackStatistics() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getFeedbackStatistics());
        return result;
    }
    
    @GetMapping("/orders/trend")
    public Map<String, Object> getMonthlyTrend() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getDailyOrderTrend());
        return result;
    }
    
    @GetMapping("/revenue/statistics")
    public Map<String, Object> getRevenueStatistics() {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getRevenueStatistics());
        return result;
    }
    
    @GetMapping("/products/top")
    public Map<String, Object> getTopProducts(@RequestParam(defaultValue = "5") int limit) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getTopProducts(limit));
        return result;
    }
    
    @GetMapping("/orders/recent")
    public Map<String, Object> getRecentOrders(@RequestParam(defaultValue = "10") int limit) {
        Map<String, Object> result = new HashMap<>();
        result.put("code", 200);
        result.put("data", dataAnalysisService.getRecentOrders(limit));
        return result;
    }
    
    @GetMapping("/orders/export")
    public ResponseEntity<String> exportOrders() {
        String csv = dataAnalysisService.exportOrdersToCsv();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType("text/csv;charset=UTF-8"));
        headers.setContentDispositionFormData("attachment", "orders_export.csv");
        return ResponseEntity.ok().headers(headers).body(csv);
    }
}
