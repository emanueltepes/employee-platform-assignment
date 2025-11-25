package com.newwork.backend.controller;

import com.newwork.backend.dto.AbsenceDto;
import com.newwork.backend.dto.AbsenceRequest;
import com.newwork.backend.entity.Absence;
import com.newwork.backend.service.AbsenceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/absences")
@RequiredArgsConstructor
public class AbsenceController {
    
    private final AbsenceService absenceService;
    
    @PostMapping("/employee/{employeeId}")
    public ResponseEntity<AbsenceDto> createAbsence(
            @PathVariable Long employeeId,
            @Valid @RequestBody AbsenceRequest request
    ) {
        return ResponseEntity.ok(absenceService.createAbsence(employeeId, request));
    }
    
    @GetMapping("/employee/{employeeId}")
    public ResponseEntity<List<AbsenceDto>> getEmployeeAbsences(@PathVariable Long employeeId) {
        return ResponseEntity.ok(absenceService.getEmployeeAbsences(employeeId));
    }
    
    @GetMapping
    public ResponseEntity<List<AbsenceDto>> getAllAbsences() {
        return ResponseEntity.ok(absenceService.getAllAbsences());
    }
    
    @PutMapping("/{absenceId}")
    public ResponseEntity<AbsenceDto> updateAbsence(
            @PathVariable Long absenceId,
            @Valid @RequestBody AbsenceRequest request
    ) {
        return ResponseEntity.ok(absenceService.updateAbsence(absenceId, request));
    }
    
    @DeleteMapping("/{absenceId}")
    public ResponseEntity<Void> deleteAbsence(@PathVariable Long absenceId) {
        absenceService.deleteAbsence(absenceId);
        return ResponseEntity.noContent().build();
    }
    
    @PutMapping("/{absenceId}/status")
    public ResponseEntity<AbsenceDto> updateAbsenceStatus(
            @PathVariable Long absenceId,
            @RequestParam Absence.AbsenceStatus status
    ) {
        return ResponseEntity.ok(absenceService.updateAbsenceStatus(absenceId, status));
    }
}

