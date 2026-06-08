package com.nyaysetu.backend.controller;

import com.nyaysetu.backend.dto.CreateCourtOrderRequest;
import com.nyaysetu.backend.dto.UpdateCourtOrderRequest;
import com.nyaysetu.backend.entity.CourtOrder;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.CourtOrderRepository;
import com.nyaysetu.backend.service.AuthService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@Tag(name = "Court Orders", description = "Issue and retrieve court orders for cases")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
@Slf4j
public class OrderController {

    private final CourtOrderRepository orderRepository;
    private final AuthService authService;

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

    @PostMapping
    public ResponseEntity<?> createOrder(
            @Valid @RequestBody CreateCourtOrderRequest request,
            Authentication authentication
    ) {
        try {
            User judge = authService.findByEmail(authentication.getName());

            CourtOrder order = CourtOrder.builder()
                    .caseId(request.getCaseId())
                    .orderType(request.getOrderType())
                    .content(request.getContent())
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

    @PutMapping("/{orderId}")
    public ResponseEntity<?> updateOrder(
            @PathVariable UUID orderId,
            @Valid @RequestBody UpdateCourtOrderRequest request,
            Authentication authentication
    ) {
        try {
            Optional<CourtOrder> optOrder = orderRepository.findById(orderId);
            if (optOrder.isEmpty()) {
                return ResponseEntity.notFound().build();
            }

            CourtOrder order = optOrder.get();

            if (request.getContent() != null) {
                order.setContent(request.getContent());
            }
            if (request.getOrderType() != null) {
                order.setOrderType(request.getOrderType());
            }
            if (request.getStatus() != null) {
                String newStatus = request.getStatus().name();
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