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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
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
class AbsenceServiceTest {

    @Mock
    private AbsenceRepository absenceRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private AbsenceMapper absenceMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private AbsenceService absenceService;

    private Employee testEmployee;
    private User testUser;
    private Absence testAbsence;
    private AbsenceDto testAbsenceDto;
    private AbsenceRequest testAbsenceRequest;

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
                .build();

        // Setup test absence request
        testAbsenceRequest = AbsenceRequest.builder()
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .type(Absence.AbsenceType.VACATION)
                .reason("Family vacation")
                .build();

        // Setup test absence
        testAbsence = Absence.builder()
                .id(1L)
                .employee(testEmployee)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .type(Absence.AbsenceType.VACATION)
                .reason("Family vacation")
                .status(Absence.AbsenceStatus.PENDING)
                .build();

        // Setup test DTO
        testAbsenceDto = AbsenceDto.builder()
                .id(1L)
                .employeeId(1L)
                .startDate(LocalDate.now().plusDays(1))
                .endDate(LocalDate.now().plusDays(5))
                .type(Absence.AbsenceType.VACATION)
                .status(Absence.AbsenceStatus.PENDING)
                .build();

        // Mock SecurityContext
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("testuser");
        lenient().when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
    }

    @Test
    void createAbsence_ShouldCreateAbsence_WhenValidRequest() {
        // Arrange
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(absenceRepository.save(any(Absence.class))).thenReturn(testAbsence);
        when(absenceMapper.toDto(any(Absence.class))).thenReturn(testAbsenceDto);

        // Act
        AbsenceDto result = absenceService.createAbsence(1L, testAbsenceRequest);

        // Assert
        assertNotNull(result);
        assertEquals(Absence.AbsenceType.VACATION, result.getType());
        assertEquals(Absence.AbsenceStatus.PENDING, result.getStatus());
        verify(absenceRepository, times(1)).save(any(Absence.class));
    }

    @Test
    void createAbsence_ShouldThrowException_WhenEmployeeNotFound() {
        // Arrange
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            absenceService.createAbsence(999L, testAbsenceRequest));
        verify(absenceRepository, never()).save(any(Absence.class));
    }

    @Test
    void getEmployeeAbsences_ShouldReturnAbsences_WhenEmployeeExists() {
        // Arrange
        List<Absence> absences = Arrays.asList(testAbsence);
        lenient().when(employeeRepository.existsById(1L)).thenReturn(true);
        when(absenceRepository.findByEmployeeIdOrderByCreatedAtDesc(1L)).thenReturn(absences);
        when(absenceMapper.toDto(any(Absence.class))).thenReturn(testAbsenceDto);

        // Act
        List<AbsenceDto> result = absenceService.getEmployeeAbsences(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(absenceRepository, times(1)).findByEmployeeIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void updateAbsence_ShouldUpdateAbsence_WhenOwnerAndPending() {
        // Arrange
        testEmployee.setUser(testUser);
        testAbsence.setEmployee(testEmployee);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(absenceRepository.findById(1L)).thenReturn(Optional.of(testAbsence));
        when(absenceRepository.save(any(Absence.class))).thenReturn(testAbsence);
        when(absenceMapper.toDto(any(Absence.class))).thenReturn(testAbsenceDto);

        AbsenceRequest updateRequest = AbsenceRequest.builder()
                .startDate(LocalDate.now().plusDays(2))
                .endDate(LocalDate.now().plusDays(6))
                .type(Absence.AbsenceType.VACATION)
                .reason("Updated reason")
                .build();

        // Act
        AbsenceDto result = absenceService.updateAbsence(1L, updateRequest);

        // Assert
        assertNotNull(result);
        verify(absenceRepository, times(1)).save(any(Absence.class));
    }

    @Test
    void updateAbsence_ShouldThrowException_WhenNotPending() {
        // Arrange
        testAbsence.setStatus(Absence.AbsenceStatus.APPROVED);
        testEmployee.setUser(testUser);
        testAbsence.setEmployee(testEmployee);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(absenceRepository.findById(1L)).thenReturn(Optional.of(testAbsence));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            absenceService.updateAbsence(1L, testAbsenceRequest));
        verify(absenceRepository, never()).save(any(Absence.class));
    }

    @Test
    void deleteAbsence_ShouldDeleteAbsence_WhenOwnerAndPending() {
        // Arrange
        testEmployee.setUser(testUser);
        testAbsence.setEmployee(testEmployee);
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(testUser));
        when(absenceRepository.findById(1L)).thenReturn(Optional.of(testAbsence));
        doNothing().when(absenceRepository).delete(any(Absence.class));

        // Act
        assertDoesNotThrow(() -> absenceService.deleteAbsence(1L));

        // Assert
        verify(absenceRepository, times(1)).delete(testAbsence);
    }

    @Test
    void updateAbsenceStatus_AsManager_ShouldUpdateStatus() {
        // Arrange
        User managerUser = User.builder()
                .username("manager")
                .role(User.Role.MANAGER)
                .build();
        
        when(userRepository.findByUsername("testuser")).thenReturn(Optional.of(managerUser));
        when(absenceRepository.findById(1L)).thenReturn(Optional.of(testAbsence));
        when(absenceRepository.save(any(Absence.class))).thenReturn(testAbsence);
        when(absenceMapper.toDto(any(Absence.class))).thenReturn(testAbsenceDto);

        // Act
        AbsenceDto result = absenceService.updateAbsenceStatus(1L, Absence.AbsenceStatus.APPROVED);

        // Assert
        assertNotNull(result);
        verify(absenceRepository, times(1)).save(any(Absence.class));
    }

    @Test
    void getPendingAbsencesCount_ShouldReturnCount() {
        // Arrange
        when(absenceRepository.countByStatus(Absence.AbsenceStatus.PENDING)).thenReturn(5L);

        // Act
        long count = absenceService.getPendingAbsencesCount();

        // Assert
        assertEquals(5L, count);
        verify(absenceRepository, times(1)).countByStatus(Absence.AbsenceStatus.PENDING);
    }
}

