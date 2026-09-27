package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.LawyerAvailability;
import com.nyaysetu.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface LawyerAvailabilityRepository extends JpaRepository<LawyerAvailability, Long> {

    List<LawyerAvailability> findByLawyerIdAndDateBetween(Long lawyerId, LocalDate startDate, LocalDate endDate);

    List<LawyerAvailability> findByLawyerId(Long lawyerId);

    Optional<LawyerAvailability> findByLawyerIdAndDate(Long lawyerId, LocalDate date);

    void deleteByLawyerAndDate(User lawyer, LocalDate date);
}
