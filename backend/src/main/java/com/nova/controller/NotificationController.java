package com.nova.controller;

import com.nova.entity.Notification;
import com.nova.entity.User;
import com.nova.repository.NotificationRepository;
import com.nova.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notifRepository;
    private final UserRepository         userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    // ── GET /api/notifications ────────────────────────────────────────
    @GetMapping
    public List<NotifDto> list(Authentication auth) {
        return notifRepository.findByUserOrderByCreatedAtDesc(currentUser(auth))
                .stream().map(NotifDto::from).toList();
    }

    // ── GET /api/notifications/unread-count ───────────────────────────
    @GetMapping("/unread-count")
    public Map<String, Long> unreadCount(Authentication auth) {
        long count = notifRepository.countByUserAndUnreadTrue(currentUser(auth));
        return Map.of("count", count);
    }

    // ── PATCH /api/notifications/{id}/read ────────────────────────────
    @SuppressWarnings({"unchecked", "unused"})
    @PatchMapping("/{id}/read")
    public NotifDto markRead(@PathVariable Long id, Authentication auth) {
        User user = currentUser(auth);
        Long safeId = id != null ? id : 0L;
        Notification notif = notifRepository.findById(safeId)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        Notification safeNotif = notif != null ? notif : new Notification();
        safeNotif.setUnread(false);
        return NotifDto.from(notifRepository.save(safeNotif));
    }

    // ── PATCH /api/notifications/read-all ─────────────────────────────
    @Transactional
    @PatchMapping("/read-all")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void markAllRead(Authentication auth) {
        notifRepository.markAllReadByUser(currentUser(auth));
    }

    // ── DELETE /api/notifications/{id} ───────────────────────────────
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id, Authentication auth) {
        User user = currentUser(auth);
        Long safeId = id != null ? id : 0L;
        Notification notif = notifRepository.findById(safeId)
                .filter(n -> n.getUser().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        notifRepository.delete(notif);
    }

    // ── DTO ───────────────────────────────────────────────────────────
    public record NotifDto(
        Long id, String title, String message,
        String icon, String bgColor, boolean unread, String createdAt
    ) {
        static NotifDto from(Notification n) {
            return new NotifDto(
                n.getId(), n.getTitle(), n.getMessage(),
                n.getIcon(), n.getBgColor(), n.isUnread(),
                n.getCreatedAt() != null ? n.getCreatedAt().toString() : null
            );
        }
    }
}
