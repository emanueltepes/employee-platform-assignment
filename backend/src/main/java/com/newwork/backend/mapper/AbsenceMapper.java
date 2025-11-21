package com.newwork.backend.mapper;

import com.newwork.backend.dto.AbsenceDto;
import com.newwork.backend.entity.Absence;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface AbsenceMapper {
    
    @Mapping(source = "employee.id", target = "employeeId")
    AbsenceDto toDto(Absence absence);
    
    @Mapping(target = "employee", ignore = true)
    Absence toEntity(AbsenceDto dto);
}

