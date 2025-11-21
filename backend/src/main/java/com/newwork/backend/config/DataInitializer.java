package com.newwork.backend.config;

import com.newwork.backend.entity.Employee;
import com.newwork.backend.entity.User;
import com.newwork.backend.repository.EmployeeRepository;
import com.newwork.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {
    
    private final UserRepository userRepository;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    
    @Override
    public void run(String... args) {
        if (userRepository.count() == 0) {
            log.info("Initializing sample data...");
            
            // Create a manager user
            User managerUser = User.builder()
                    .username("manager")
                    .password(passwordEncoder.encode("password123"))
                    .email("manager@newwork.com")
                    .role(User.Role.MANAGER)
                    .build();
            managerUser = userRepository.save(managerUser);
            
            Employee manager = Employee.builder()
                    .user(managerUser)
                    .firstName("John")
                    .lastName("Manager")
                    .position("HR Manager")
                    .department("Human Resources")
                    .phone("+1234567890")
                    .officeLocation("Building A, Floor 3")
                    .salary(80000.0)
                    .dateOfBirth(LocalDate.of(1985, 5, 15))
                    .socialSecurityNumber("123-45-6789")
                    .bankAccount("DE89370400440532013000")
                    .address("123 Manager Street, City")
                    .emergencyContact("Jane Manager: +1234567891")
                    .hireDate(LocalDate.of(2020, 1, 1))
                    .contractType("Full-time")
                    .build();
            employeeRepository.save(manager);
            
            // Create an employee user
            User employeeUser = User.builder()
                    .username("employee")
                    .password(passwordEncoder.encode("password123"))
                    .email("employee@newwork.com")
                    .role(User.Role.EMPLOYEE)
                    .build();
            employeeUser = userRepository.save(employeeUser);
            
            Employee employee = Employee.builder()
                    .user(employeeUser)
                    .firstName("Alice")
                    .lastName("Smith")
                    .position("Software Engineer")
                    .department("Engineering")
                    .phone("+1234567892")
                    .officeLocation("Building B, Floor 2")
                    .salary(70000.0)
                    .dateOfBirth(LocalDate.of(1990, 8, 20))
                    .socialSecurityNumber("987-65-4321")
                    .bankAccount("DE89370400440532013001")
                    .address("456 Employee Avenue, City")
                    .emergencyContact("Bob Smith: +1234567893")
                    .hireDate(LocalDate.of(2021, 6, 15))
                    .contractType("Full-time")
                    .build();
            employeeRepository.save(employee);
            
            // Create a coworker user
            User coworkerUser = User.builder()
                    .username("coworker")
                    .password(passwordEncoder.encode("password123"))
                    .email("coworker@newwork.com")
                    .role(User.Role.COWORKER)
                    .build();
            coworkerUser = userRepository.save(coworkerUser);
            
            Employee coworker = Employee.builder()
                    .user(coworkerUser)
                    .firstName("Bob")
                    .lastName("Johnson")
                    .position("Product Designer")
                    .department("Design")
                    .phone("+1234567894")
                    .officeLocation("Building B, Floor 1")
                    .salary(65000.0)
                    .dateOfBirth(LocalDate.of(1992, 3, 10))
                    .socialSecurityNumber("555-55-5555")
                    .bankAccount("DE89370400440532013002")
                    .address("789 Coworker Lane, City")
                    .emergencyContact("Mary Johnson: +1234567895")
                    .hireDate(LocalDate.of(2022, 3, 1))
                    .contractType("Full-time")
                    .build();
            employeeRepository.save(coworker);
            
            log.info("Sample data initialized successfully!");
            log.info("Test users:");
            log.info("  Manager - username: manager, password: password123");
            log.info("  Employee - username: employee, password: password123");
            log.info("  Coworker - username: coworker, password: password123");
        }
    }
}

