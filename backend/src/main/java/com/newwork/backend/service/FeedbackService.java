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
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeedbackService {
    
    private final FeedbackRepository feedbackRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final FeedbackMapper feedbackMapper;
    private final HuggingFaceService huggingFaceService;
    
    @Transactional
    public FeedbackDto createFeedback(Long employeeId, FeedbackRequest request) {
        User currentUser = getCurrentUser();
        Employee employee = employeeRepository.findById(employeeId)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        // Prevent leaving feedback for yourself
        if (employee.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You cannot leave feedback for yourself");
        }
        
        String polishedContent = null;
        boolean isPolished = false;
        
        if (request.getUseAiPolish()) {
            polishedContent = huggingFaceService.polishFeedback(request.getContent());
            isPolished = true;
        }
        
        Feedback feedback = Feedback.builder()
                .employee(employee)
                .authorName(currentUser.getUsername())
                .originalContent(request.getContent())
                .polishedContent(polishedContent)
                .isPolished(isPolished)
                .build();
        
        feedback = feedbackRepository.save(feedback);
        return feedbackMapper.toDto(feedback);
    }

    public FeedbackSuggestionsResponse generateFeedbackSuggestions(FeedbackSuggestionsRequest request) {
        List<String> suggestions = huggingFaceService.generateFeedbackOptions(request.getContent());
        return FeedbackSuggestionsResponse.builder()
                .suggestions(suggestions)
                .build();
    }
    
    @Transactional(readOnly = true)
    public List<FeedbackDto> getEmployeeFeedbacks(Long employeeId) {
        List<Feedback> feedbacks = feedbackRepository.findByEmployeeIdOrderByCreatedAtDesc(employeeId);
        return feedbacks.stream()
                .map(feedbackMapper::toDto)
                .collect(Collectors.toList());
    }
    
    @Transactional
    public void deleteFeedback(Long feedbackId) {
        User currentUser = getCurrentUser();
        Feedback feedback = feedbackRepository.findById(feedbackId)
                .orElseThrow(() -> new RuntimeException("Feedback not found"));
        
        // Only the author can delete their own feedback
        if (!feedback.getAuthorName().equals(currentUser.getUsername())) {
            throw new RuntimeException("You can only delete your own feedback");
        }
        
        feedbackRepository.delete(feedback);
    }
    
    private User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        String username = authentication.getName();
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
}

