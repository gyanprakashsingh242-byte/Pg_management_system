package com.livingpeace.backend.repository;

import com.livingpeace.backend.entity.Room;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RoomRepository extends JpaRepository<Room, Long> {
    Optional<Room> findByRoomNumber(String roomNumber);
    List<Room> findByFloorOrderByRoomNumberAsc(Integer floor);
    List<Room> findAllByOrderByRoomNumberAsc();
}
