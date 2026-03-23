package com.nova.controller;

import com.nova.entity.User;
import com.nova.repository.UserRepository;
import com.nova.security.JwtUtils;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository     userRepository;
    private final PasswordEncoder    passwordEncoder;
    private final AuthenticationManager authManager;
    private final JwtUtils           jwtUtils;

    // ── POST /api/auth/register ────────────────────────────────────────
    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest req) {
        if (userRepository.existsByEmail(req.getEmail())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Email already registered."));
        }

        User user = User.builder()
                .name(req.getName())
                .email(req.getEmail())
                .password(passwordEncoder.encode(req.getPassword()))
                .role(User.Role.OWNER)
                .build();

        userRepository.save(user);

        String accessToken  = jwtUtils.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(buildTokenResponse(user, accessToken, refreshToken));
    }

    // ── POST /api/auth/login ───────────────────────────────────────────
    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest req) {
        try {
            authManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.getEmail(), req.getPassword())
            );
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid email or password."));
        }

        User user = userRepository.findByEmail(req.getEmail())
                .orElseThrow();

        String accessToken  = jwtUtils.generateAccessToken(user.getEmail());
        String refreshToken = jwtUtils.generateRefreshToken(user.getEmail());

        return ResponseEntity.ok(buildTokenResponse(user, accessToken, refreshToken));
    }

    // ── POST /api/auth/refresh ─────────────────────────────────────────
    @PostMapping("/refresh")
    public ResponseEntity<?> refresh(@RequestBody Map<String, String> body) {
        String refreshToken = body.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest().body(Map.of("message", "Missing refreshToken."));
        }
        try {
            String email = jwtUtils.getEmailFromToken(refreshToken);
            if (jwtUtils.isTokenExpired(refreshToken)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(Map.of("message", "Refresh token expired. Please login again."));
            }
            String newAccess = jwtUtils.generateAccessToken(email);
            return ResponseEntity.ok(Map.of("accessToken", newAccess));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Invalid refresh token."));
        }
    }

    // ── GET /api/auth/me ───────────────────────────────────────────────
    @GetMapping("/me")
    public ResponseEntity<?> me(org.springframework.security.core.Authentication auth) {
        String email = auth.getName();
        User user = userRepository.findByEmail(email).orElseThrow();
        return ResponseEntity.ok(Map.of(
            "id",        user.getId(),
            "name",      user.getName(),
            "email",     user.getEmail(),
            "role",      user.getRole(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "createdAt", user.getCreatedAt()
        ));
    }

    // ── helpers ────────────────────────────────────────────────────────
    private Map<String, Object> buildTokenResponse(User user, String accessToken, String refreshToken) {
        return Map.of(
            "accessToken",  accessToken,
            "refreshToken", refreshToken,
            "user", Map.of(
                "id",    user.getId(),
                "name",  user.getName(),
                "email", user.getEmail(),
                "role",  user.getRole()
            )
        );
    }

    // ── DTOs ───────────────────────────────────────────────────────────
    public static class RegisterRequest {
        @NotBlank private String name;
        @Email @NotBlank private String email;
        @Size(min = 8) private String password;

        public String getName() { return name; }
        public void setName(String n) { this.name = n; }
        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
    }

    public static class LoginRequest {
        @Email @NotBlank private String email;
        @NotBlank private String password;

        public String getEmail() { return email; }
        public void setEmail(String e) { this.email = e; }
        public String getPassword() { return password; }
        public void setPassword(String p) { this.password = p; }
    }
}