package com.newwork.backend.service;

import com.newwork.backend.config.CacheConfig;
import com.newwork.backend.dto.EmployeeDto;
import com.newwork.backend.dto.EmployeeUpdateRequest;
import com.newwork.backend.entity.Employee;
import com.newwork.backend.entity.User;
import com.newwork.backend.mapper.EmployeeMapper;
import com.newwork.backend.repository.EmployeeRepository;
import com.newwork.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeMapper employeeMapper;
    
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Long id) {
        log.info("Fetching employee from database (uncached): {}", id);
        // Fetch employee with absences first
        Employee employee = employeeRepository.findByIdWithAbsences(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Then fetch feedbacks separately to avoid MultipleBagFetchException
        employeeRepository.findByIdWithFeedbacks(id);
        
        User currentUser = getCurrentUser();
        
        // Filter sensitive data based on role
        EmployeeDto dto = employeeMapper.toDtoWithRelations(employee);
        
        if (!canViewSensitiveData(currentUser, employee)) {
            // Remove sensitive data for co-workers
            dto.setSalary(null);
            dto.setDateOfBirth(null);
            dto.setSocialSecurityNumber(null);
            dto.setBankAccount(null);
            dto.setAddress(null);
            dto.setEmergencyContact(null);
            dto.setHireDate(null);
            dto.setContractType(null);
        }
        
        return dto;
    }
    
    @Transactional(readOnly = true)
    @Cacheable(value = CacheConfig.EMPLOYEES_CACHE, key = "'all'")
    public List<EmployeeDto> getAllEmployees() {
        log.info("Fetching all employees from database (with EntityGraph optimization) - CACHE MISS");
        List<Employee> employees = employeeRepository.findAllWithUser();
        User currentUser = getCurrentUser();
        
        return employees.stream()
                .map(employee -> {
                    // Use toDto instead of toDtoWithRelations for list view - much faster!
                    EmployeeDto dto = employeeMapper.toDto(employee);
                    if (!canViewSensitiveData(currentUser, employee)) {
                        dto.setSalary(null);
                        dto.setDateOfBirth(null);
                        dto.setSocialSecurityNumber(null);
                        dto.setBankAccount(null);
                        dto.setAddress(null);
                        dto.setEmergencyContact(null);
                        dto.setHireDate(null);
                        dto.setContractType(null);
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    // Note: Not caching Page objects due to serialization complexity with Redis
    // Pagination queries are already fast as they only fetch a small subset
    public Page<EmployeeDto> getEmployeesPaginated(int page, int size, String sortBy, String sortDir) {
        log.info("Fetching employees page {} with size {} from database", page, size);
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Employee> employeePage = employeeRepository.findAll(pageable);
        User currentUser = getCurrentUser();
        
        return employeePage.map(employee -> {
            EmployeeDto dto = employeeMapper.toDto(employee);
            if (!canViewSensitiveData(currentUser, employee)) {
                dto.setSalary(null);
                dto.setDateOfBirth(null);
                dto.setSocialSecurityNumber(null);
                dto.setBankAccount(null);
                dto.setAddress(null);
                dto.setEmergencyContact(null);
                dto.setHireDate(null);
                dto.setContractType(null);
            }
            return dto;
        });
    }
    
    @Transactional(readOnly = true)
    public Page<EmployeeDto> searchEmployees(String searchTerm, int page, int size, String sortBy, String sortDir) {
        log.info("Searching employees with term '{}' on page {} with size {}", searchTerm, page, size);
        
        Sort.Direction direction = sortDir.equalsIgnoreCase("desc") ? Sort.Direction.DESC : Sort.Direction.ASC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));
        
        Page<Employee> employeePage = employeeRepository.searchEmployees(searchTerm, pageable);
        User currentUser = getCurrentUser();
        
        return employeePage.map(employee -> {
            EmployeeDto dto = employeeMapper.toDto(employee);
            if (!canViewSensitiveData(currentUser, employee)) {
                dto.setSalary(null);
                dto.setDateOfBirth(null);
                dto.setSocialSecurityNumber(null);
                dto.setBankAccount(null);
                dto.setAddress(null);
                dto.setEmergencyContact(null);
                dto.setHireDate(null);
                dto.setContractType(null);
            }
            return dto;
        });
    }
    
    @Transactional
    @CacheEvict(value = CacheConfig.EMPLOYEES_CACHE, allEntries = true)
    public EmployeeDto updateEmployee(Long id, EmployeeUpdateRequest request) {
        log.info("Updating employee {} and clearing cache", id);
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        User currentUser = getCurrentUser();
        
        if (!canModifyEmployee(currentUser, employee)) {
            throw new RuntimeException("You don't have permission to modify this employee");
        }
        
        // Apply field-level permissions based on role
        EmployeeUpdateRequest filteredRequest = filterUpdateFieldsByRole(currentUser, request);
        
        employeeMapper.updateEmployeeFromDto(filteredRequest, employee);
        employee = employeeRepository.save(employee);
        
        return employeeMapper.toDto(employee);
    }
    
    @Transactional(readOnly = true)
    public EmployeeDto getMyProfile() {
        User currentUser = getCurrentUser();
        Employee employee = employeeRepository.findByUserId(currentUser.getId())
                .orElseThrow(() -> new RuntimeException("Employee profile not found"));
        
        // Fetch relations separately to avoid MultipleBagFetchException
        Long employeeId = employee.getId();
        employeeRepository.findByIdWithAbsences(employeeId);
        employeeRepository.findByIdWithFeedbacks(employeeId);
        
        return employeeMapper.toDtoWithRelations(employee);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    private boolean canViewSensitiveData(User currentUser, Employee employee) {
        // Manager can view all sensitive data
        if (currentUser.getRole() == User.Role.MANAGER) {
            return true;
        }
        
        // Employee can view their own sensitive data
        return employee.getUser().getId().equals(currentUser.getId());
    }
    
    private boolean canModifyEmployee(User currentUser, Employee employee) {
        // Manager can modify all employees
        if (currentUser.getRole() == User.Role.MANAGER) {
            return true;
        }
        
        // Employee can modify their own profile
        return employee.getUser().getId().equals(currentUser.getId());
    }
    
    /**
     * Filter update fields based on user role:
     * - MANAGER: Can edit all fields
     * - EMPLOYEE/COWORKER: Can only edit contact data (phone, officeLocation, address, emergencyContact)
     */
    private EmployeeUpdateRequest filterUpdateFieldsByRole(User currentUser, EmployeeUpdateRequest request) {
        // Managers can update all fields
        if (currentUser.getRole() == User.Role.MANAGER) {
            return request;
        }
        
        // Regular employees can only update contact information
        EmployeeUpdateRequest filteredRequest = new EmployeeUpdateRequest();
        filteredRequest.setPhone(request.getPhone());
        filteredRequest.setOfficeLocation(request.getOfficeLocation());
        filteredRequest.setAddress(request.getAddress());
        filteredRequest.setEmergencyContact(request.getEmergencyContact());
        
        log.info("Filtered update request for non-manager user. Only contact fields allowed.");
        return filteredRequest;
    }
}

