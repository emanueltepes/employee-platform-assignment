package com.newwork.backend.repository;

import com.newwork.backend.entity.Feedback;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    
    /**
     * Optimized queries with EntityGraph to eagerly fetch employee relationship
     * Prevents N+1 queries when loading feedbacks
     */
    @EntityGraph(attributePaths = {"employee"})
    List<Feedback> findByEmployeeId(Long employeeId);
    
    @EntityGraph(attributePaths = {"employee"})
    List<Feedback> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}

