package com.newwork.backend.repository;

import com.newwork.backend.entity.Employee;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
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
    
    /**
     * Optimized query with EntityGraph to prevent N+1 problem when loading user relationship
     * This is crucial for authentication checks in the service layer
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT e FROM Employee e")
    List<Employee> findAllWithUser();
    
    /**
     * Optimized paginated query with EntityGraph to prevent N+1 problem
     */
    @EntityGraph(attributePaths = {"user"})
    Page<Employee> findAll(Pageable pageable);
    
    @EntityGraph(attributePaths = {"user"})
    List<Employee> findByDepartment(String department);
    
    /**
     * Search employees by name, position, or department
     * Uses LIKE with case-insensitive matching
     */
    @EntityGraph(attributePaths = {"user"})
    @Query("SELECT e FROM Employee e WHERE " +
           "LOWER(e.firstName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.lastName) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.position) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
           "LOWER(e.department) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    Page<Employee> searchEmployees(String searchTerm, Pageable pageable);
}

