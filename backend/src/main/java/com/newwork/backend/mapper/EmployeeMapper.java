package com.newwork.backend.mapper;

import com.newwork.backend.dto.EmployeeDto;
import com.newwork.backend.dto.EmployeeUpdateRequest;
import com.newwork.backend.entity.Employee;
import org.mapstruct.*;

@Mapper(componentModel = "spring", uses = {AbsenceMapper.class, FeedbackMapper.class})
public interface EmployeeMapper {
    
    @Mapping(target = "absences", ignore = true)
    @Mapping(target = "feedbacks", ignore = true)
    EmployeeDto toDto(Employee employee);
    
    @Mapping(target = "absences", source = "absences")
    @Mapping(target = "feedbacks", source = "feedbacks")
    EmployeeDto toDtoWithRelations(Employee employee);
    
    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    @Mapping(target = "id", ignore = true)
    @Mapping(target = "user", ignore = true)
    @Mapping(target = "absences", ignore = true)
    @Mapping(target = "feedbacks", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEmployeeFromDto(EmployeeUpdateRequest dto, @MappingTarget Employee entity);
}

