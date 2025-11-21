package com.newwork.backend.repository;

import com.newwork.backend.entity.Absence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AbsenceRepository extends JpaRepository<Absence, Long> {
    List<Absence> findByEmployeeId(Long employeeId);
    List<Absence> findByEmployeeIdOrderByCreatedAtDesc(Long employeeId);
}

