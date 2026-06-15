package com.sheculture.admin.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;

import javax.annotation.PostConstruct;
import java.io.InputStream;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class DataAnalysisService {
    
    private JsonNode rootNode;
    private final ObjectMapper objectMapper = new ObjectMapper();
    
    @PostConstruct
    public void init() {
        try {
            Resource resource = new ClassPathResource("db.json");
            InputStream inputStream = resource.getInputStream();
            rootNode = objectMapper.readTree(inputStream);
            inputStream.close();
            System.out.println("数据加载成功!");
            System.out.println("订单数量: " + (rootNode.path("orders").isArray() ? rootNode.path("orders").size() : 0));
        } catch (Exception e) {
            System.err.println("数据加载失败: " + e.getMessage());
            e.printStackTrace();
        }
    }
    
    // 获取用户统计
    public Map<String, Object> getUserStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        JsonNode users = rootNode.path("users");
        int totalUsers = users.size();
        
        int inheritors = 0, merchants = 0, admins = 0, normalUsers = 0;
        
        for (JsonNode user : users) {
            String role = user.path("role").asText();
            switch (role) {
                case "inheritor": inheritors++; break;
                case "merchant": merchants++; break;
                case "admin": admins++; break;
                default: normalUsers++;
            }
        }
        
        stats.put("totalUsers", totalUsers);
        stats.put("inheritors", inheritors);
        stats.put("merchants", merchants);
        stats.put("admins", admins);
        stats.put("normalUsers", normalUsers);
        
        return stats;
    }
    
    // 获取订单统计
    public Map<String, Object> getOrderStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        JsonNode orders = rootNode.path("orders");
        int totalOrders = orders.size();
        
        double totalAmount = 0;
        int pendingOrders = 0, paidOrders = 0, completedOrders = 0, cancelledOrders = 0;
        
        for (JsonNode order : orders) {
            totalAmount += order.path("totalAmount").asDouble();
            String status = order.path("status").asText();
            switch (status) {
                case "pending": pendingOrders++; break;
                case "paid": paidOrders++; break;
                case "completed": completedOrders++; break;
                case "cancelled": cancelledOrders++; break;
            }
        }
        
        stats.put("totalOrders", totalOrders);
        stats.put("totalAmount", totalAmount);
        stats.put("pendingOrders", pendingOrders);
        stats.put("paidOrders", paidOrders);
        stats.put("completedOrders", completedOrders);
        stats.put("cancelledOrders", cancelledOrders);
        
        return stats;
    }
    
    // 获取商品统计
    public Map<String, Object> getProductStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        JsonNode products = rootNode.path("products");
        int totalProducts = products.size();
        
        double totalSales = 0;
        double totalStock = 0;
        Map<String, Integer> categoryCount = new HashMap<>();
        
        for (JsonNode product : products) {
            totalSales += product.path("sales").asInt();
            totalStock += product.path("stock").asInt();
            String category = product.path("category").asText();
            categoryCount.put(category, categoryCount.getOrDefault(category, 0) + 1);
        }
        
        stats.put("totalProducts", totalProducts);
        stats.put("totalSales", totalSales);
        stats.put("totalStock", totalStock);
        stats.put("categoryCount", categoryCount);
        
        return stats;
    }
    
    // 获取文化文章统计
    public Map<String, Object> getCultureStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        JsonNode cultures = rootNode.path("cultures");
        int totalArticles = cultures.size();
        
        Map<String, Integer> typeCount = new HashMap<>();
        
        for (JsonNode culture : cultures) {
            String type = culture.path("type").asText();
            typeCount.put(type, typeCount.getOrDefault(type, 0) + 1);
        }
        
        stats.put("totalArticles", totalArticles);
        stats.put("typeCount", typeCount);
        
        return stats;
    }
    
    // 获取反馈统计
    public Map<String, Object> getFeedbackStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        JsonNode feedbacks = rootNode.path("feedbacks");
        int totalFeedbacks = feedbacks.size();
        
        int pending = 0, processed = 0;
        Map<String, Integer> typeCount = new HashMap<>();
        
        for (JsonNode feedback : feedbacks) {
            String status = feedback.path("status").asText();
            if ("pending".equals(status)) pending++;
            else processed++;
            
            String type = feedback.path("type").asText();
            typeCount.put(type, typeCount.getOrDefault(type, 0) + 1);
        }
        
        stats.put("totalFeedbacks", totalFeedbacks);
        stats.put("pending", pending);
        stats.put("processed", processed);
        stats.put("typeCount", typeCount);
        
        return stats;
    }
    
    // 获取每日订单趋势
    public List<Map<String, Object>> getDailyOrderTrend() {
        List<Map<String, Object>> trend = new ArrayList<>();
        
        JsonNode orders = rootNode.path("orders");
        Map<String, Double> dailyAmount = new LinkedHashMap<>();
        Map<String, Integer> dailyCount = new LinkedHashMap<>();
        
        for (JsonNode order : orders) {
            String createTime = order.path("createTime").asText();
            if (createTime.length() >= 10) {
                String day = createTime.substring(0, 10);
                dailyAmount.put(day, dailyAmount.getOrDefault(day, 0.0) + order.path("totalAmount").asDouble());
                dailyCount.put(day, dailyCount.getOrDefault(day, 0) + 1);
            }
        }
        
        for (Map.Entry<String, Double> entry : dailyAmount.entrySet()) {
            Map<String, Object> dayData = new HashMap<>();
            dayData.put("day", entry.getKey());
            dayData.put("amount", entry.getValue());
            dayData.put("count", dailyCount.get(entry.getKey()));
            trend.add(dayData);
        }
        
        return trend;
    }
    
    // 获取交易额统计
    public Map<String, Object> getRevenueStatistics() {
        Map<String, Object> stats = new HashMap<>();
        
        JsonNode orders = rootNode.path("orders");
        double totalRevenue = 0;
        double todayRevenue = 0;
        double yesterdayRevenue = 0;
        double weekRevenue = 0;
        
        String today = java.time.LocalDate.now().toString();
        String yesterday = java.time.LocalDate.now().minusDays(1).toString();
        String weekAgo = java.time.LocalDate.now().minusDays(7).toString();
        
        for (JsonNode order : orders) {
            String status = order.path("status").asText();
            if ("paid".equals(status)) {
                double amount = order.path("totalAmount").asDouble();
                totalRevenue += amount;
                
                String createTime = order.path("createTime").asText();
                if (createTime.length() >= 10) {
                    String date = createTime.substring(0, 10);
                    if (date.equals(today)) {
                        todayRevenue += amount;
                    }
                    if (date.equals(yesterday)) {
                        yesterdayRevenue += amount;
                    }
                    if (date.compareTo(weekAgo) >= 0) {
                        weekRevenue += amount;
                    }
                }
            }
        }
        
        double growthRate = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0;
        
        stats.put("totalRevenue", totalRevenue);
        stats.put("todayRevenue", todayRevenue);
        stats.put("yesterdayRevenue", yesterdayRevenue);
        stats.put("weekRevenue", weekRevenue);
        stats.put("growthRate", growthRate);
        
        return stats;
    }
    
    // 获取热门商品
    public List<Map<String, Object>> getTopProducts(int limit) {
        List<Map<String, Object>> topProducts = new ArrayList<>();
        
        JsonNode products = rootNode.path("products");
        for (JsonNode product : products) {
            Map<String, Object> productMap = new HashMap<>();
            productMap.put("id", product.path("id").asLong());
            productMap.put("name", product.path("name").asText());
            productMap.put("sales", product.path("sales").asInt());
            productMap.put("price", product.path("price").asDouble());
            productMap.put("category", product.path("category").asText());
            topProducts.add(productMap);
        }
        
        topProducts.sort((a, b) -> {
            int salesA = (int) a.get("sales");
            int salesB = (int) b.get("sales");
            return salesB - salesA;
        });
        
        return topProducts.stream().limit(limit).collect(Collectors.toList());
    }
    
    // 获取最近订单
    public List<Map<String, Object>> getRecentOrders(int limit) {
        List<Map<String, Object>> recentOrders = new ArrayList<>();
        
        JsonNode orders = rootNode.path("orders");
        for (JsonNode order : orders) {
            Map<String, Object> orderMap = new HashMap<>();
            orderMap.put("id", order.path("id").asLong());
            orderMap.put("orderNo", order.path("orderNo").asText());
            orderMap.put("totalAmount", order.path("totalAmount").asDouble());
            orderMap.put("status", order.path("status").asText());
            orderMap.put("createTime", order.path("createTime").asText());
            orderMap.put("paymentMethod", order.path("paymentMethod").asText());
            recentOrders.add(orderMap);
        }
        
        recentOrders.sort((a, b) -> {
            String timeA = (String) a.get("createTime");
            String timeB = (String) b.get("createTime");
            return timeB.compareTo(timeA);
        });
        
        return recentOrders.stream().limit(limit).collect(Collectors.toList());
    }
    
    // 导出订单为CSV格式
    public String exportOrdersToCsv() {
        StringBuilder csv = new StringBuilder();
        csv.append("订单ID,订单号,用户ID,总金额,支付方式,状态,创建时间,支付时间\n");
        
        JsonNode orders = rootNode.path("orders");
        for (JsonNode order : orders) {
            csv.append(order.path("id").asLong()).append(",");
            csv.append(order.path("orderNo").asText()).append(",");
            csv.append(order.path("userId").asLong()).append(",");
            csv.append(order.path("totalAmount").asDouble()).append(",");
            csv.append(order.path("paymentMethod").asText()).append(",");
            csv.append(order.path("status").asText()).append(",");
            csv.append(order.path("createTime").asText()).append(",");
            csv.append(order.path("payTime").asText()).append("\n");
        }
        
        return csv.toString();
    }
}
