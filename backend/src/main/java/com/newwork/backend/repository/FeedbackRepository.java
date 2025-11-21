package com.newwork.backend.repository;

import com.newwork.backend.entity.Feedback;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FeedbackRepository extends JpaRepository<Feedback, Long> {
    List<Feedback> findByEmployeeId(Long employeeId);
    List<Feedback> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}

