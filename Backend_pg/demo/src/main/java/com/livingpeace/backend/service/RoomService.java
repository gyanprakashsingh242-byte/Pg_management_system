package com.livingpeace.backend.service;

import com.livingpeace.backend.dto.RoomResponse;
import com.livingpeace.backend.dto.UpdateMeterRequest;
import com.livingpeace.backend.entity.Room;
import com.livingpeace.backend.repository.RoomRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RoomService {

    private final RoomRepository roomRepository;

    public List<RoomResponse> getAllRooms(Integer floor) {
        List<Room> rooms = (floor != null)
                ? roomRepository.findByFloorOrderByRoomNumberAsc(floor)
                : roomRepository.findAllByOrderByRoomNumberAsc();

        return rooms.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    public RoomResponse getRoomByNumber(String roomNumber) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomNumber));
        return mapToResponse(room);
    }

    @Transactional
    public RoomResponse updateMeterReading(String roomNumber, UpdateMeterRequest request) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomNumber));

        if (request.getCurrentMeter() < room.getPreviousMeter()) {
            throw new IllegalArgumentException("Current reading cannot be lower than previous reading: " + room.getPreviousMeter());
        }

        room.setCurrentMeter(request.getCurrentMeter());
        Room updated = roomRepository.save(room);
        return mapToResponse(updated);
    }

    @Transactional
    public RoomResponse togglePaymentStatus(String roomNumber) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomNumber));

        room.setPaid(!room.isPaid());
        Room updated = roomRepository.save(room);
        return mapToResponse(updated);
    }
    @Transactional
    public RoomResponse updateRoomRent(String roomNumber, BigDecimal newRent) {
        Room room = roomRepository.findByRoomNumber(roomNumber)
                .orElseThrow(() -> new RuntimeException("Room not found: " + roomNumber));

        room.setBaseRent(newRent);
        Room updated = roomRepository.save(room);
        return mapToResponse(updated);
    }

    private RoomResponse mapToResponse(Room room) {
        return RoomResponse.builder()
                .id(room.getId())
                .roomNumber(room.getRoomNumber())
                .floor(room.getFloor())
                .baseRent(room.getBaseRent())
                .previousMeter(room.getPreviousMeter())
                .currentMeter(room.getCurrentMeter())
                .isPaid(room.isPaid())
                .tenantName(room.getCurrentTenant() != null ? room.getCurrentTenant().getName() : "Unoccupied")
                .tenantPhone(room.getCurrentTenant() != null ? room.getCurrentTenant().getPhone() : "")
                .build();
    }
}
