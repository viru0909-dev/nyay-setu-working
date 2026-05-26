package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.Payment;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    
    Optional<Payment> findByStripePaymentIntentId(String stripePaymentIntentId);

    Optional<Payment> findByConsultationId(Long consultationId);

    Page<Payment> findByClientId(Long clientId, Pageable pageable);

    @Query("SELECT p FROM Payment p WHERE p.status = 'COMPLETED' AND p.client.id = :clientId " +
           "ORDER BY p.createdAt DESC")
    Page<Payment> findCompletedPaymentsByClient(@Param("clientId") Long clientId, Pageable pageable);

    @Query("SELECT COUNT(p) FROM Payment p WHERE p.status = 'COMPLETED' AND p.client.id = :clientId")
    int countCompletedPayments(@Param("clientId") Long clientId);
}
