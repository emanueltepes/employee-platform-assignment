package com.newwork.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FeedbackDto {
    private Long id;
    private Long employeeId;
    private String authorName;
    private String originalContent;
    private String polishedContent;
    private Boolean isPolished;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

