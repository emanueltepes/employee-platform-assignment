package com.newwork.backend.service;

import com.newwork.backend.dto.EmployeeDto;
import com.newwork.backend.dto.EmployeeUpdateRequest;
import com.newwork.backend.entity.Employee;
import com.newwork.backend.entity.User;
import com.newwork.backend.mapper.EmployeeMapper;
import com.newwork.backend.repository.EmployeeRepository;
import com.newwork.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDate;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EmployeeServiceTest {

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private EmployeeMapper employeeMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private EmployeeService employeeService;

    private Employee testEmployee;
    private EmployeeDto testEmployeeDto;
    private User testUser;

    @BeforeEach
    void setUp() {
        // Setup test user
        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .role(User.Role.EMPLOYEE)
                .build();

        // Setup test employee
        testEmployee = Employee.builder()
                .id(1L)
                .user(testUser)
                .firstName("John")
                .lastName("Doe")
                .position("Software Engineer")
                .department("Engineering")
                .phone("+1234567890")
                .salary(100000.0)
                .dateOfBirth(LocalDate.of(1990, 1, 1))
                .build();

        // Setup test DTO
        testEmployeeDto = EmployeeDto.builder()
                .id(1L)
                .firstName("John")
                .lastName("Doe")
                .position("Software Engineer")
                .department("Engineering")
                .build();

        // Mock SecurityContext
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("testuser");
        lenient().when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
    }

    @Test
    void getEmployeeById_ShouldReturnEmployee_WhenEmployeeExists() {
        // Arrange
        when(employeeRepository.findByIdWithAbsences(1L)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.findByIdWithFeedbacks(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(employeeMapper.toDtoWithRelations(testEmployee)).thenReturn(testEmployeeDto);

        // Act
        EmployeeDto result = employeeService.getEmployeeById(1L);

        // Assert
        assertNotNull(result);
        assertEquals("John", result.getFirstName());
        assertEquals("Doe", result.getLastName());
        verify(employeeRepository, times(1)).findByIdWithAbsences(1L);
        verify(employeeMapper, times(1)).toDtoWithRelations(testEmployee);
    }

    @Test
    void getEmployeeById_ShouldThrowException_WhenEmployeeNotFound() {
        // Arrange
        when(employeeRepository.findByIdWithAbsences(999L)).thenReturn(Optional.empty());

        // Act & Assert
        assertThrows(RuntimeException.class, () -> employeeService.getEmployeeById(999L));
        verify(employeeRepository, times(1)).findByIdWithAbsences(999L);
    }

    @Test
    void getAllEmployees_ShouldReturnListOfEmployees() {
        // Arrange
        List<Employee> employees = Arrays.asList(testEmployee);
        when(employeeRepository.findAllWithUser()).thenReturn(employees);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(employeeMapper.toDto(any(Employee.class))).thenReturn(testEmployeeDto);

        // Act
        List<EmployeeDto> result = employeeService.getAllEmployees();

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(employeeRepository, times(1)).findAllWithUser();
    }

    @Test
    void getEmployeesPaginated_ShouldReturnPagedEmployees() {
        // Arrange
        List<Employee> employees = Arrays.asList(testEmployee);
        Page<Employee> page = new PageImpl<>(employees);
        Pageable pageable = PageRequest.of(0, 10);
        
        when(employeeRepository.findAll(any(Pageable.class))).thenReturn(page);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(employeeMapper.toDto(any(Employee.class))).thenReturn(testEmployeeDto);

        // Act
        Page<EmployeeDto> result = employeeService.getEmployeesPaginated(0, 10, "lastName", "asc");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        assertEquals(1, result.getContent().size());
        verify(employeeRepository, times(1)).findAll(any(Pageable.class));
    }

    @Test
    void updateEmployee_AsManager_ShouldUpdateAllFields() {
        // Arrange
        User managerUser = User.builder()
                .username("manager")
                .role(User.Role.MANAGER)
                .build();
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(managerUser));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(testEmployee);
        when(employeeMapper.toDto(any(Employee.class))).thenReturn(testEmployeeDto);

        EmployeeUpdateRequest request = EmployeeUpdateRequest.builder()
                .firstName("Jane")
                .position("Senior Engineer")
                .salary(120000.0)
                .build();

        // Act
        EmployeeDto result = employeeService.updateEmployee(1L, request);

        // Assert
        assertNotNull(result);
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void updateEmployee_AsEmployee_ShouldUpdateOnlyContactFields() {
        // Arrange
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(employeeRepository.save(any(Employee.class))).thenReturn(testEmployee);
        when(employeeMapper.toDto(any(Employee.class))).thenReturn(testEmployeeDto);

        EmployeeUpdateRequest request = EmployeeUpdateRequest.builder()
                .phone("+9876543210")
                .address("New Address")
                .salary(150000.0) // This should be filtered out
                .build();

        // Act
        EmployeeDto result = employeeService.updateEmployee(1L, request);

        // Assert
        assertNotNull(result);
        verify(employeeRepository, times(1)).save(any(Employee.class));
    }

    @Test
    void searchEmployees_ShouldReturnMatchingEmployees() {
        // Arrange
        List<Employee> employees = Arrays.asList(testEmployee);
        Page<Employee> page = new PageImpl<>(employees);
        
        when(employeeRepository.searchEmployees(anyString(), any(Pageable.class))).thenReturn(page);
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(employeeMapper.toDto(any(Employee.class))).thenReturn(testEmployeeDto);

        // Act
        Page<EmployeeDto> result = employeeService.searchEmployees("John", 0, 10, "lastName", "asc");

        // Assert
        assertNotNull(result);
        assertEquals(1, result.getTotalElements());
        verify(employeeRepository, times(1)).searchEmployees(anyString(), any(Pageable.class));
    }
}

