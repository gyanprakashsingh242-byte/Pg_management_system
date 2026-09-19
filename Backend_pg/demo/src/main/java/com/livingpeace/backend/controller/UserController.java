package com.livingpeace.backend.controller;

import com.livingpeace.backend.dto.AuthRequest;
import com.livingpeace.backend.entity.Role;
import com.livingpeace.backend.entity.User;
import com.livingpeace.backend.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasRole('ADMIN')") // Sirf main Admin hi users manage kar sakta hai
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    // 1. Saare staff/caretakers ki list dekhna
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    // 2. Naya Caretaker ya Admin jodna
    @PostMapping
    public ResponseEntity<?> createUser(@Valid @RequestBody Map<String, String> request) {
        String username = request.get("username");
        String rawPassword = request.get("password");
        String roleStr = request.getOrDefault("role", "ROLE_CARETAKER");

        if (userRepository.findByUsername(username).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Username already exists!"));
        }

        User newUser = User.builder()
                .username(username)
                .password(passwordEncoder.encode(rawPassword))
                .role(Role.valueOf(roleStr))
                .enabled(true)
                .build();

        userRepository.save(newUser);
        return new ResponseEntity<>(Map.of("message", "User created successfully!"), HttpStatus.CREATED);
    }

    // 3. Kisi staff member ko delete/remove karna
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Khud ko galti se delete na kar le admin
        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "User deleted successfully!"));
    }
}
