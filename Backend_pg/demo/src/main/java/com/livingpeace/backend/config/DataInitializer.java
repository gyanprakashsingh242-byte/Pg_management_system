package com.livingpeace.backend.config;

import com.livingpeace.backend.entity.Role;
import com.livingpeace.backend.entity.Room;
import com.livingpeace.backend.entity.Tenant;
import com.livingpeace.backend.entity.User;
import com.livingpeace.backend.repository.RoomRepository;
import com.livingpeace.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoomRepository roomRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        // 1. Seed / Ensure Admin User Exists
        if (userRepository.findByUsername("shailendra").isEmpty()) {
            userRepository.save(User.builder()
                    .username("shailendra")
                    .password(passwordEncoder.encode("shailendra@2026"))
                    .role(Role.ROLE_ADMIN)
                    .enabled(true)
                    .build());
            log.info("Seeded admin user: shailendra / shailendra@2026");
        }

        // 2. Seed / Ensure Caretaker Exists
        if (userRepository.findByUsername("Golu").isEmpty()) {
            userRepository.save(User.builder()
                    .username("Golu")
                    .password(passwordEncoder.encode("golu123"))
                    .role(Role.ROLE_CARETAKER)
                    .enabled(true)
                    .build());
            log.info("Seeded caretaker user: Golu / golu123");
        }

        // 3. Seed 54 Rooms (Agar khali ho)
        if (roomRepository.count() == 0) {
            log.info("Seeding 54 rooms for Living Peace Residencies into MySQL...");
            List<Room> rooms = new ArrayList<>();

            for (int floor = 1; floor <= 3; floor++) {
                for (int roomIndex = 1; roomIndex <= 18; roomIndex++) {
                    String roomNumber = String.format("%d%02d", floor, roomIndex);
                    BigDecimal rent = BigDecimal.valueOf(7500 + (floor * 500));

                    Tenant tenant = Tenant.builder()
                            .name(roomIndex % 2 == 0 ? "Resident " + roomNumber : "Aman " + roomNumber)
                            .phone("919876543210")
                            .active(true)
                            .build();

                    Room room = Room.builder()
                            .roomNumber(roomNumber)
                            .floor(floor)
                            .baseRent(rent)
                            .previousMeter(100.0)
                            .currentMeter(100.0 + ((roomIndex * 5) % 45) + 12)
                            .isPaid(roomIndex % 3 == 0)
                            .currentTenant(tenant)
                            .build();

                    rooms.add(room);
                }
            }

            roomRepository.saveAll(rooms);
            log.info("Successfully seeded 54 rooms into MySQL database!");
        }
    }
}