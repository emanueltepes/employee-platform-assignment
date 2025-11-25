package com.newwork.backend.service;

import com.newwork.backend.dto.FeedbackDto;
import com.newwork.backend.dto.FeedbackRequest;
import com.newwork.backend.dto.FeedbackSuggestionsRequest;
import com.newwork.backend.dto.FeedbackSuggestionsResponse;
import com.newwork.backend.entity.Employee;
import com.newwork.backend.entity.Feedback;
import com.newwork.backend.entity.User;
import com.newwork.backend.mapper.FeedbackMapper;
import com.newwork.backend.repository.EmployeeRepository;
import com.newwork.backend.repository.FeedbackRepository;
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

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FeedbackServiceTest {

    @Mock
    private FeedbackRepository feedbackRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private HuggingFaceService huggingFaceService;

    @Mock
    private FeedbackMapper feedbackMapper;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private FeedbackService feedbackService;

    private Employee testEmployee;
    private User testUser;
    private Feedback testFeedback;
    private FeedbackDto testFeedbackDto;
    private FeedbackRequest testFeedbackRequest;

    @BeforeEach
    void setUp() {
        // Setup test user (manager who gives feedback)
        testUser = User.builder()
                .id(2L)
                .username("manager")
                .email("manager@example.com")
                .role(User.Role.MANAGER)
                .build();

        // Setup employee user (different from manager)
        User employeeUser = User.builder()
                .id(1L)
                .username("employee")
                .email("employee@example.com")
                .role(User.Role.EMPLOYEE)
                .build();

        // Setup test employee
        testEmployee = Employee.builder()
                .id(1L)
                .user(employeeUser)
                .firstName("John")
                .lastName("Doe")
                .build();

        // Setup test feedback request
        testFeedbackRequest = FeedbackRequest.builder()
                .content("Great work on the project!")
                .useAiPolish(false)
                .build();

        // Setup test feedback
        testFeedback = Feedback.builder()
                .id(1L)
                .employee(testEmployee)
                .originalContent("Great work on the project!")
                .authorName("manager")
                .isPolished(false)
                .build();

        // Setup test DTO
        testFeedbackDto = FeedbackDto.builder()
                .id(1L)
                .employeeId(1L)
                .originalContent("Great work on the project!")
                .authorName("Manager")
                .isPolished(false)
                .build();

        // Mock SecurityContext
        SecurityContextHolder.setContext(securityContext);
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("manager");
        lenient().when(userRepository.findByUsername("manager")).thenReturn(Optional.of(testUser));
    }

    @Test
    void createFeedback_WithoutAI_ShouldCreateFeedback() {
        // Arrange
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(testUser));
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(testFeedback);
        when(feedbackMapper.toDto(any(Feedback.class))).thenReturn(testFeedbackDto);

        // Act
        FeedbackDto result = feedbackService.createFeedback(1L, testFeedbackRequest);

        // Assert
        assertNotNull(result);
        assertEquals("Great work on the project!", result.getOriginalContent());
        assertFalse(result.getIsPolished());
        verify(feedbackRepository, times(1)).save(any(Feedback.class));
        verify(huggingFaceService, never()).polishFeedback(anyString());
    }

    @Test
    void createFeedback_WithAI_ShouldPolishFeedback() {
        // Arrange
        testFeedbackRequest = FeedbackRequest.builder()
                .content("Good job")
                .useAiPolish(true)
                .build();

        String polishedContent = "Excellent performance on the recent project deliverables.";
        
        when(employeeRepository.findById(1L)).thenReturn(Optional.of(testEmployee));
        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(testUser));
        when(huggingFaceService.polishFeedback("Good job")).thenReturn(polishedContent);
        when(feedbackRepository.save(any(Feedback.class))).thenReturn(testFeedback);
        when(feedbackMapper.toDto(any(Feedback.class))).thenReturn(testFeedbackDto);

        // Act
        FeedbackDto result = feedbackService.createFeedback(1L, testFeedbackRequest);

        // Assert
        assertNotNull(result);
        verify(huggingFaceService, times(1)).polishFeedback("Good job");
        verify(feedbackRepository, times(1)).save(any(Feedback.class));
    }

    @Test
    void createFeedback_ShouldThrowException_WhenEmployeeNotFound() {
        // Arrange
        when(employeeRepository.findById(999L)).thenReturn(Optional.empty());
        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(testUser));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> 
            feedbackService.createFeedback(999L, testFeedbackRequest));
        verify(feedbackRepository, never()).save(any(Feedback.class));
    }

    @Test
    void getEmployeeFeedbacks_ShouldReturnFeedbackList() {
        // Arrange
        List<Feedback> feedbacks = Arrays.asList(testFeedback);
        lenient().when(employeeRepository.existsById(1L)).thenReturn(true);
        when(feedbackRepository.findByEmployeeIdOrderByCreatedAtDesc(1L)).thenReturn(feedbacks);
        when(feedbackMapper.toDto(any(Feedback.class))).thenReturn(testFeedbackDto);

        // Act
        List<FeedbackDto> result = feedbackService.getEmployeeFeedbacks(1L);

        // Assert
        assertNotNull(result);
        assertEquals(1, result.size());
        verify(feedbackRepository, times(1)).findByEmployeeIdOrderByCreatedAtDesc(1L);
    }

    @Test
    void deleteFeedback_ShouldDeleteFeedback_WhenAuthorized() {
        // Arrange
        testFeedback.setAuthorName("manager");
        
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(testFeedback));
        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(testUser));
        doNothing().when(feedbackRepository).delete(any(Feedback.class));

        // Act
        assertDoesNotThrow(() -> feedbackService.deleteFeedback(1L));

        // Assert
        verify(feedbackRepository, times(1)).delete(testFeedback);
    }

    @Test
    void deleteFeedback_ShouldThrowException_WhenUnauthorized() {
        // Arrange
        testFeedback.setAuthorName("AnotherManager");
        User differentUser = User.builder()
                .username("manager")
                .role(User.Role.EMPLOYEE)
                .build();
        
        when(feedbackRepository.findById(1L)).thenReturn(Optional.of(testFeedback));
        when(userRepository.findByUsername("manager")).thenReturn(Optional.of(differentUser));

        // Act & Assert
        assertThrows(RuntimeException.class, () -> feedbackService.deleteFeedback(1L));
        verify(feedbackRepository, never()).delete(any(Feedback.class));
    }

    @Test
    void generateFeedbackSuggestions_ShouldReturnSuggestions() {
        // Arrange
        FeedbackSuggestionsRequest request = new FeedbackSuggestionsRequest("Good work");
        List<String> suggestions = Arrays.asList(
                "Excellent performance on recent tasks",
                "Great contribution to the team",
                "Outstanding work quality"
        );
        
        when(huggingFaceService.generateFeedbackOptions("Good work")).thenReturn(suggestions);

        // Act
        FeedbackSuggestionsResponse response = feedbackService.generateFeedbackSuggestions(request);

        // Assert
        assertNotNull(response);
        assertEquals(3, response.getSuggestions().size());
        verify(huggingFaceService, times(1)).generateFeedbackOptions("Good work");
    }

    @Test
    void generateFeedbackSuggestions_ShouldHandleEmptyContent() {
        // Arrange
        FeedbackSuggestionsRequest request = new FeedbackSuggestionsRequest("");
        when(huggingFaceService.generateFeedbackOptions("")).thenReturn(Arrays.asList());

        // Act
        FeedbackSuggestionsResponse response = feedbackService.generateFeedbackSuggestions(request);

        // Assert
        assertNotNull(response);
        assertTrue(response.getSuggestions().isEmpty());
    }
}

