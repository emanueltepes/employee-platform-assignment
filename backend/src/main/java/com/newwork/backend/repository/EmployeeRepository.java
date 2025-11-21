package com.newwork.backend.repository;

import com.newwork.backend.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, Long> {
    
    Optional<Employee> findByUserId(Long userId);
    
    @Query("SELECT DISTINCT e FROM Employee e LEFT JOIN FETCH e.absences WHERE e.id = :id")
    Optional<Employee> findByIdWithAbsences(Long id);
    
    @Query("SELECT DISTINCT e FROM Employee e LEFT JOIN FETCH e.feedbacks WHERE e.id = :id")
    Optional<Employee> findByIdWithFeedbacks(Long id);
    
    List<Employee> findByDepartment(String department);
}

