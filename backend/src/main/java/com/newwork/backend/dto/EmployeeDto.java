package com.newwork.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeDto {
    private Long id;
    
    // Non-sensitive data
    private String firstName;
    private String lastName;
    private String position;
    private String department;
    private String photoUrl;
    private String phone;
    private String officeLocation;
    
    // Sensitive data (only for manager/owner)
    private Double salary;
    private LocalDate dateOfBirth;
    private String socialSecurityNumber;
    private String bankAccount;
    private String address;
    private String emergencyContact;
    private LocalDate hireDate;
    private String contractType;
    
    private List<AbsenceDto> absences;
    private List<FeedbackDto> feedbacks;
    
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

