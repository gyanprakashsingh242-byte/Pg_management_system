package com.livingpeace.backend.service;

import com.livingpeace.backend.dto.TenantRequest;
import com.livingpeace.backend.dto.TenantResponse;
import com.livingpeace.backend.entity.Room;
import com.livingpeace.backend.entity.Tenant;
import com.livingpeace.backend.repository.RoomRepository;
import com.livingpeace.backend.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TenantService {

    private final TenantRepository tenantRepository;
    private final RoomRepository roomRepository;

    public List<TenantResponse> getAllTenants(Boolean activeOnly) {
        List<Tenant> tenants = tenantRepository.findAll();
        return tenants.stream()
                // Agar activeOnly explicitly true bheja hai toh sirf active dikhao,
                // warna saare ya by default sirf active dikhao:
                .filter(t -> activeOnly == null || t.isActive() == activeOnly)
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public TenantResponse getTenantById(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + id));
        return mapToResponse(tenant);
    }

    @Transactional
    public TenantResponse createTenant(TenantRequest request) {
        Tenant tenant = Tenant.builder()
                .name(request.getName())
                .phone(request.getPhone())
                .emergencyContact(request.getEmergencyContact())
                .active(true)
                .build();

        Tenant savedTenant = tenantRepository.save(tenant);

        if (request.getRoomNumber() != null && !request.getRoomNumber().isBlank()) {
            assignRoom(savedTenant, request.getRoomNumber());
        }

        return mapToResponse(savedTenant);
    }

    @Transactional
    public TenantResponse updateTenant(Long id, TenantRequest request) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + id));

        tenant.setName(request.getName());
        tenant.setPhone(request.getPhone());
        tenant.setEmergencyContact(request.getEmergencyContact());
        tenantRepository.save(tenant);

        // Room allocation handling
        if (request.getRoomNumber() != null && !request.getRoomNumber().isBlank()) {
            assignRoom(tenant, request.getRoomNumber());
        } else {
            // Agar room dropdown me 'No Room Assigned' select kiya ho, toh room se hata do
            unassignTenantFromAllRooms(tenant.getId());
        }

        return mapToResponse(tenant);
    }

    @Transactional
    public void removeTenant(Long id) {
        Tenant tenant = tenantRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Tenant not found with ID: " + id));

        // 1. Pehle Room table se foreign key hatao (Room khali karo)
        unassignTenantFromAllRooms(id);

        // 2. Soft delete / deactivation
        tenant.setActive(false);
        tenantRepository.save(tenant);
    }

    // Helper: Purane kisi bhi room se is tenant ko unlink karna
    private void unassignTenantFromAllRooms(Long tenantId) {
        List<Room> rooms = roomRepository.findAll();
        for (Room room : rooms) {
            if (room.getCurrentTenant() != null && room.getCurrentTenant().getId().equals(tenantId)) {
                room.setCurrentTenant(null);
                roomRepository.save(room);
            }
        }
    }

    // Helper: Naye room ko assign karna aur pehle wale ko free karna
    private void assignRoom(Tenant tenant, String roomNumber) {
        // Step A: Agar tenant kisi aur room me tha, wahan se hatao
        unassignTenantFromAllRooms(tenant.getId());

        // Step B: Target room find karo
        Room targetRoom = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomNumber));

        // Step C: Naye room me assign karo aur save karo
        targetRoom.setCurrentTenant(tenant);
        roomRepository.save(targetRoom);
    }

    private TenantResponse mapToResponse(Tenant tenant) {
        String assignedRoom = roomRepository.findAll().stream()
                .filter(r -> r.getCurrentTenant() != null && r.getCurrentTenant().getId().equals(tenant.getId()))
                .map(Room::getRoomNumber)
                .findFirst()
                .orElse("Unassigned");

        return TenantResponse.builder()
                .id(tenant.getId())
                .name(tenant.getName())
                .phone(tenant.getPhone())
                .emergencyContact(tenant.getEmergencyContact())
                .active(tenant.isActive())
                .assignedRoomNumber(assignedRoom)
                .build();
    }
}
