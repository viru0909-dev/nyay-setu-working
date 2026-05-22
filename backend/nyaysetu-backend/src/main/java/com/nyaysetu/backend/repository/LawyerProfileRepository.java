package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.LawyerProfile;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LawyerProfileRepository extends JpaRepository<LawyerProfile, Long> {
    Optional<LawyerProfile> findByUserId(Long userId);

    Page<LawyerProfile> findByVerifiedTrueAndActiveTrue(Pageable pageable);

    @Query("SELECT l FROM LawyerProfile l WHERE l.verified = true AND l.active = true " +
           "AND LOWER(l.user.name) LIKE LOWER(CONCAT('%', :searchText, '%'))")
    Page<LawyerProfile> searchByNameAndVerified(@Param("searchText") String searchText, Pageable pageable);

    @Query("SELECT l FROM LawyerProfile l WHERE l.verified = true AND l.active = true " +
           "AND l.averageRating >= :minRating")
    Page<LawyerProfile> findByMinRating(@Param("minRating") Double minRating, Pageable pageable);

    @Query("SELECT l FROM LawyerProfile l WHERE l.verified = true AND l.active = true " +
           "AND LOWER(l.user.name) LIKE LOWER(CONCAT('%', :searchText, '%')) " +
           "AND l.averageRating >= :minRating")
    Page<LawyerProfile> searchByNameRatingAndVerified(
            @Param("searchText") String searchText,
            @Param("minRating") Double minRating,
            Pageable pageable);
}
