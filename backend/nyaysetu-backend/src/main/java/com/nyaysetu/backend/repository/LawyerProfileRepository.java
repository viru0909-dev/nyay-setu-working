package com.nyaysetu.backend.repository;

import com.nyaysetu.backend.entity.LawyerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LawyerProfileRepository extends JpaRepository<LawyerProfile, Long> {

    Optional<LawyerProfile> findByUserId(Long userId);

    List<LawyerProfile> findByAvailableTrue();

    List<LawyerProfile> findByCityIgnoreCase(String city);

    @Query("SELECT lp FROM LawyerProfile lp JOIN lp.expertiseTags t WHERE LOWER(t) IN :tags")
    List<LawyerProfile> findByExpertiseTagsIn(@Param("tags") List<String> tags);
}