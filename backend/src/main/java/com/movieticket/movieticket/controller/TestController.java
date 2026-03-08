package com.movieticket.movieticket.controller;

import com.movieticket.movieticket.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/test")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class TestController {

    private final UserRepository userRepository;

    @GetMapping("/hello")
    public ResponseEntity<Map<String, Object>> hello() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Hello World from Movie Ticket Booking API!");
        response.put("status", "success");
        response.put("timestamp", LocalDateTime.now());
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "Movie Ticket Booking Backend");
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @PostMapping("/echo")
    public ResponseEntity<Map<String, Object>> echo(@RequestBody Map<String, Object> payload) {
        Map<String, Object> response = new HashMap<>();
        response.put("received", payload);
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "Echo successful");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/info")
    public ResponseEntity<Map<String, Object>> info() {
        Map<String, Object> response = new HashMap<>();
        response.put("projectName", "Movie Ticket Booking System");
        response.put("version", "0.0.1-SNAPSHOT");
        response.put("framework", "Spring Boot 3.5.7");
        response.put("javaVersion", System.getProperty("java.version"));
        response.put("timestamp", LocalDateTime.now());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/users-count")
    public ResponseEntity<Map<String, Object>> usersCount() {
        Map<String, Object> response = new HashMap<>();
        long totalUsers = userRepository.count();
        long adminCount = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("ADMIN"))
                .count();
        long userCount = userRepository.findAll().stream()
                .filter(u -> u.getRole().name().equals("USER"))
                .count();

        response.put("totalUsers", totalUsers);
        response.put("adminCount", adminCount);
        response.put("userCount", userCount);
        response.put("timestamp", LocalDateTime.now());
        response.put("message", "User count retrieved successfully");

        // Also add some user details for debugging
        var users = userRepository.findAll();
        var usersList = new java.util.ArrayList<>();
        for (var user : users) {
            var userMap = new HashMap<String, Object>();
            userMap.put("id", user.getId());
            userMap.put("username", user.getUsername());
            userMap.put("name", user.getName());
            userMap.put("role", user.getRole().name());
            userMap.put("email", user.getEmail());
            usersList.add(userMap);
        }
        response.put("users", usersList);

        return ResponseEntity.ok(response);
    }
}
