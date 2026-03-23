package com.nova.controller;

import com.nova.entity.User;
import com.nova.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserController(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    // ── PATCH /api/users/profile ──────────────────────────────────────
    @PatchMapping("/profile")
    public ResponseEntity<?> updateProfile(@Valid @RequestBody ProfileRequest req, Authentication auth) {
        User user = currentUser(auth);

        // check email uniqueness if changed
        if (!user.getEmail().equals(req.getEmail()) && userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email already in use."));
        }

        user.setName(req.getName());
        user.setEmail(req.getEmail());
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Profile updated.", "name", user.getName(), "email", user.getEmail()));
    }

    // ── PATCH /api/users/password ─────────────────────────────────────
    @PatchMapping("/password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody PasswordRequest req, Authentication auth) {
        User user = currentUser(auth);

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("message", "Current password is incorrect."));
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        return ResponseEntity.ok(Map.of("message", "Password changed successfully."));
    }

    // ── DELETE /api/users/account ─────────────────────────────────────
    @DeleteMapping("/account")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteAccount(Authentication auth) {
        User user = currentUser(auth);
        if (user != null) userRepository.delete(user);
    }

    // ── DTOs ──────────────────────────────────────────────────────────
    public static class ProfileRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
    }

    public static class PasswordRequest {
        @NotBlank private String currentPassword;
        @Size(min = 8) private String newPassword;

        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}