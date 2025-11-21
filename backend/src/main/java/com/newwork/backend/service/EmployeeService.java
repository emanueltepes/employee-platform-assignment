package com.newwork.backend.service;

import com.newwork.backend.dto.EmployeeDto;
import com.newwork.backend.dto.EmployeeUpdateRequest;
import com.newwork.backend.entity.Employee;
import com.newwork.backend.entity.User;
import com.newwork.backend.mapper.EmployeeMapper;
import com.newwork.backend.repository.EmployeeRepository;
import com.newwork.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {
    
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final EmployeeMapper employeeMapper;
    
    @Transactional(readOnly = true)
    public EmployeeDto getEmployeeById(Long id) {
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
    public List<EmployeeDto> getAllEmployees() {
        List<Employee> employees = employeeRepository.findAll();
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
    
    @Transactional
    public EmployeeDto updateEmployee(Long id, EmployeeUpdateRequest request) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        User currentUser = getCurrentUser();
        
        if (!canModifyEmployee(currentUser, employee)) {
            throw new RuntimeException("You don't have permission to modify this employee");
        }
        
        employeeMapper.updateEmployeeFromDto(request, employee);
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
}

