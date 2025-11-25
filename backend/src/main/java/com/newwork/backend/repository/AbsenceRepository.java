package com.newwork.backend.repository;

import com.newwork.backend.entity.Absence;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    
    /**
     * Optimized queries with EntityGraph to eagerly fetch employee relationship
     * Prevents N+1 queries when loading absences
     */
    @EntityGraph(attributePaths = {"employee"})
    List<Absence> findByEmployeeId(Long employeeId);
    
    @EntityGraph(attributePaths = {"employee"})
    List<Absence> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
    
    /**
     * Count pending absence requests
     */
    long countByStatus(Absence.AbsenceStatus status);
}

