package com.newwork.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EmployeeUpdateRequest {
    private String firstName;
    private String lastName;
    private String position;
    private String department;
    private String photoUrl;
    private String phone;
    private String officeLocation;
    private Double salary;
    private LocalDate dateOfBirth;
    private String socialSecurityNumber;
    private String bankAccount;
    private String address;
    private String emergencyContact;
    private LocalDate hireDate;
    private String contractType;
}

