package com.newwork.backend.controller;

import com.newwork.backend.dto.EmployeeDto;
import com.newwork.backend.dto.EmployeeUpdateRequest;
import com.newwork.backend.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    
    private final EmployeeService employeeService;
    
    @GetMapping
    public ResponseEntity<?> getAllEmployees(
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size,
            @RequestParam(defaultValue = "lastName") String sortBy,
            @RequestParam(defaultValue = "asc") String sortDir
    ) {
        // If pagination parameters are provided, return paginated response
        if (page != null && size != null) {
            Page<EmployeeDto> employeePage = employeeService.getEmployeesPaginated(
                    page, size, sortBy, sortDir
            );
            return ResponseEntity.ok(employeePage);
        }
        
        // Otherwise, return all employees (backward compatibility)
        List<EmployeeDto> employees = employeeService.getAllEmployees();
        return ResponseEntity.ok(employees);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<EmployeeDto> getEmployeeById(@PathVariable Long id) {
        return ResponseEntity.ok(employeeService.getEmployeeById(id));
    }
    
    @GetMapping("/me")
    public ResponseEntity<EmployeeDto> getMyProfile() {
        return ResponseEntity.ok(employeeService.getMyProfile());
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<EmployeeDto> updateEmployee(
            @PathVariable Long id,
            @RequestBody EmployeeUpdateRequest request
    ) {
        return ResponseEntity.ok(employeeService.updateEmployee(id, request));
    }
}
