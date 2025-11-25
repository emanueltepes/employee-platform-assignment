package com.newwork.backend.service;

import com.newwork.backend.dto.AbsenceDto;
import com.newwork.backend.dto.AbsenceRequest;
import com.newwork.backend.entity.Absence;
import com.newwork.backend.entity.Employee;
import com.newwork.backend.entity.User;
import com.newwork.backend.mapper.AbsenceMapper;
import com.newwork.backend.repository.AbsenceRepository;
import com.newwork.backend.repository.EmployeeRepository;
import com.newwork.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AbsenceService {
    
    private final AbsenceRepository absenceRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final AbsenceMapper absenceMapper;
    
    @Transactional
    public AbsenceDto createAbsence(Long employeeId, AbsenceRequest request) {
        User currentUser = getCurrentUser();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Only the employee themselves can request absence
        if (!employee.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only request absence for yourself");
        }
        
        // Validate dates
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date must be before or equal to end date");
        }
        
        // Validate dates are not in the past
        if (request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("Cannot request absence for past dates");
        }
        
        Absence absence = Absence.builder()
                .employee(employee)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .type(request.getType())
                .reason(request.getReason())
                .status(Absence.AbsenceStatus.PENDING)
                .build();
        
        absence = absenceRepository.save(absence);
        return absenceMapper.toDto(absence);
    }
    
    @Transactional(readOnly = true)
    public List<AbsenceDto> getEmployeeAbsences(Long employeeId) {
        List<Absence> absences = absenceRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        return absences.stream()
                .map(absenceMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public AbsenceDto updateAbsence(Long absenceId, AbsenceRequest request) {
        User currentUser = getCurrentUser();
        
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new RuntimeException("Absence not found"));
        
        // Only the employee who created it can update
        if (!absence.getEmployee().getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only update your own absence requests");
        }
        
        // Can only update pending absences
        if (absence.getStatus() != Absence.AbsenceStatus.PENDING) {
            throw new RuntimeException("Can only update pending absence requests");
        }
        
        // Validate dates
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Start date must be before or equal to end date");
        }
        
        // Validate dates are not in the past
        if (request.getStartDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("Cannot set absence dates in the past");
        }
        
        // Update fields
        absence.setStartDate(request.getStartDate());
        absence.setEndDate(request.getEndDate());
        absence.setType(request.getType());
        absence.setReason(request.getReason());
        
        absence = absenceRepository.save(absence);
        
        return absenceMapper.toDto(absence);
    }
    
    @Transactional
    public void deleteAbsence(Long absenceId) {
        User currentUser = getCurrentUser();
        
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new RuntimeException("Absence not found"));
        
        // Only the employee who created it can delete
        if (!absence.getEmployee().getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own absence requests");
        }
        
        // Can only delete pending absences
        if (absence.getStatus() != Absence.AbsenceStatus.PENDING) {
            throw new RuntimeException("Can only delete pending absence requests");
        }
        
        absenceRepository.delete(absence);
    }
    
    @Transactional
    public AbsenceDto updateAbsenceStatus(Long absenceId, Absence.AbsenceStatus status) {
        User currentUser = getCurrentUser();
        
        // Only managers can approve/reject absences
        if (currentUser.getRole() != User.Role.MANAGER) {
            throw new RuntimeException("Only managers can update absence status");
        }
        
        Absence absence = absenceRepository.findById(absenceId)
                .orElseThrow(() -> new RuntimeException("Absence not found"));
        
        absence.setStatus(status);
        absence.setApprovedBy(currentUser.getUsername());
        absence = absenceRepository.save(absence);
        
        log.info("Updated absence {} status to {} for employee {}", absenceId, status, absence.getEmployee().getId());
        
        return absenceMapper.toDto(absence);
    }
    
    @Transactional(readOnly = true)
    public List<AbsenceDto> getAllAbsences() {
        User currentUser = getCurrentUser();
        
        // Only managers can view all absences
        if (currentUser.getRole() != User.Role.MANAGER) {
            throw new RuntimeException("Only managers can view all absences");
        }
        
        List<Absence> absences = absenceRepository.findAll();
        return absences.stream()
                .map(absenceMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public long getPendingAbsencesCount() {
        return absenceRepository.countByStatus(Absence.AbsenceStatus.PENDING);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

