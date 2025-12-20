package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.entity.CourtOrder;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CourtOrderRepository;
import com.nyaysetu.backend.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final CourtOrderRepository orderRepository;
    private final AuthService authService;

    /**
     * Get all orders for a specific case
     */
    @GetMapping("/case/{caseId}")
    public ResponseEntity<?> getOrdersByCase(@PathVariable UUID caseId) {
        try {
            List<CourtOrder> orders = orderRepository.findByCaseId(caseId);
            
            List<Map<String, Object>> response = orders.stream().map(order -> {
                Map<String, Object> orderData = new HashMap<>();
                orderData.put("id", order.getId());
                orderData.put("caseId", order.getCaseId());
                orderData.put("orderType", order.getOrderType());
                orderData.put("content", order.getContent());
                orderData.put("status", order.getStatus());
                orderData.put("issuedBy", order.getIssuedBy());
                orderData.put("createdAt", order.getCreatedAt());
                orderData.put("updatedAt", order.getUpdatedAt());
                orderData.put("issuedAt", order.getIssuedAt());
                return orderData;
            }).toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching orders for case {}", caseId, e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }

    /**
     * Create a new court order
     */
    @PostMapping
    public ResponseEntity<?> createOrder(
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            
            CourtOrder order = CourtOrder.builder()
                    .caseId(UUID.fromString((String) request.get("caseId")))
                    .orderType((String) request.get("orderType"))
                    .content((String) request.get("content"))
                    .status("DRAFT")
                    .issuedBy(judge.getName())
                    .build();
            
            CourtOrder saved = orderRepository.save(order);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("caseId", saved.getCaseId());
            response.put("orderType", saved.getOrderType());
            response.put("content", saved.getContent());
            response.put("status", saved.getStatus());
            response.put("issuedBy", saved.getIssuedBy());
            response.put("createdAt", saved.getCreatedAt());
            response.put("message", "Order created successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error creating order", e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Update an existing order
     */
    @PutMapping("/{orderId}")
    public ResponseEntity<?> updateOrder(
            @PathVariable UUID orderId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {
        try {
            Optional<CourtOrder> optOrder = orderRepository.findById(orderId);
            if (optOrder.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourtOrder order = optOrder.get();
            
            if (request.containsKey("content")) {
                order.setContent((String) request.get("content"));
            }
            if (request.containsKey("orderType")) {
                order.setOrderType((String) request.get("orderType"));
            }
            if (request.containsKey("status")) {
                String newStatus = (String) request.get("status");
                order.setStatus(newStatus);
                if ("ISSUED".equals(newStatus) || "FINAL".equals(newStatus)) {
                    order.setIssuedAt(LocalDateTime.now());
                }
            }
            
            CourtOrder saved = orderRepository.save(order);
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", saved.getId());
            response.put("status", saved.getStatus());
            response.put("updatedAt", saved.getUpdatedAt());
            response.put("message", "Order updated successfully");
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error updating order {}", orderId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Delete an order (only drafts can be deleted)
     */
    @DeleteMapping("/{orderId}")
    public ResponseEntity<?> deleteOrder(@PathVariable UUID orderId) {
        try {
            Optional<CourtOrder> optOrder = orderRepository.findById(orderId);
            if (optOrder.isEmpty()) {
                return ResponseEntity.notFound().build();
            }
            
            CourtOrder order = optOrder.get();
            if (!"DRAFT".equals(order.getStatus())) {
                return ResponseEntity.badRequest().body(Map.of("error", "Only draft orders can be deleted"));
            }
            
            orderRepository.delete(order);
            return ResponseEntity.ok(Map.of("message", "Order deleted successfully"));
        } catch (Exception e) {
            log.error("Error deleting order {}", orderId, e);
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * Get all orders issued by the current judge
     */
    @GetMapping("/my-orders")
    public ResponseEntity<?> getMyOrders(Authentication authentication) {
        try {
            User judge = authService.findByEmail(authentication.getName());
            List<CourtOrder> orders = orderRepository.findByIssuedBy(judge.getName());
            
            List<Map<String, Object>> response = orders.stream().map(order -> {
                Map<String, Object> orderData = new HashMap<>();
                orderData.put("id", order.getId());
                orderData.put("caseId", order.getCaseId());
                orderData.put("orderType", order.getOrderType());
                orderData.put("content", order.getContent());
                orderData.put("status", order.getStatus());
                orderData.put("createdAt", order.getCreatedAt());
                orderData.put("issuedAt", order.getIssuedAt());
                return orderData;
            }).toList();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Error fetching judge orders", e);
            return ResponseEntity.ok(Collections.emptyList());
        }
    }
}
