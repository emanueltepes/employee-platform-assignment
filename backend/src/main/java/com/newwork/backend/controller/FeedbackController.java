package com.newwork.backend.controller;

import com.newwork.backend.dto.FeedbackDto;
import com.newwork.backend.dto.FeedbackRequest;
import com.newwork.backend.dto.FeedbackSuggestionsRequest;
import com.newwork.backend.dto.FeedbackSuggestionsResponse;
import com.newwork.backend.service.FeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {
    
    private final FeedbackService feedbackService;
    
    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<FeedbackDto> createFeedback(
            @PathVariable Long employeeId,
            @Valid @RequestBody FeedbackRequest request
    ) {
        return ResponseEntity.ok(feedbackService.createFeedback(employeeId, request));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<FeedbackDto>> getEmployeeFeedbacks(@PathVariable Long employeeId) {
        return ResponseEntity.ok(feedbackService.getEmployeeFeedbacks(employeeId));
    }
    
    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<Void> deleteFeedback(@PathVariable Long feedbackId) {
        feedbackService.deleteFeedback(feedbackId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/suggestions")
    public ResponseEntity<FeedbackSuggestionsResponse> getFeedbackSuggestions(
            @Valid @RequestBody FeedbackSuggestionsRequest request
    ) {
        return ResponseEntity.ok(feedbackService.generateFeedbackSuggestions(request));
    }
}

