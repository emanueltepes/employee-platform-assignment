package com.newwork.backend.mapper;

import com.newwork.backend.dto.FeedbackDto;
import com.newwork.backend.entity.Feedback;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface FeedbackMapper {
    
    @Mapping(source = "employee.id", target = "employeeId")
    FeedbackDto toDto(Feedback feedback);
    
    @Mapping(target = "employee", ignore = true)
    Feedback toEntity(FeedbackDto dto);
}

