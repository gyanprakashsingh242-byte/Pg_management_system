package com.livingpeace.backend.controller;

import com.livingpeace.backend.dto.TenantRequest;
import com.livingpeace.backend.dto.TenantResponse;
import com.livingpeace.backend.service.TenantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/tenants")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class TenantController {

    private final TenantService tenantService;

    // View directory (Caretaker can see who lives where)
    @GetMapping
    public ResponseEntity<List<TenantResponse>> getAllTenants(@RequestParam(required = false) Boolean activeOnly) {
        return ResponseEntity.ok(tenantService.getAllTenants(activeOnly));
    }

    // 1. ADD: Restricted to ADMIN
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantResponse> createTenant(@Valid @RequestBody TenantRequest request) {
        return new ResponseEntity<>(tenantService.createTenant(request), HttpStatus.CREATED);
    }

    // 2. MODIFY: Restricted to ADMIN
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<TenantResponse> updateTenant(
            @PathVariable Long id,
            @Valid @RequestBody TenantRequest request) {
        return ResponseEntity.ok(tenantService.updateTenant(id, request));
    }

    // 3. DELETE: Restricted to ADMIN
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> removeTenant(@PathVariable Long id) {
        tenantService.removeTenant(id);
        return ResponseEntity.noContent().build();
    }
}
