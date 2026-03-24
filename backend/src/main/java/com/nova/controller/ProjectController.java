package com.nova.controller;

import com.nova.entity.Project;
import com.nova.entity.User;
import com.nova.repository.ProjectRepository;
import com.nova.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
public class ProjectController {

    private final ProjectRepository projectRepository;
    private final UserRepository    userRepository;

    private User currentUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
    }

    // ── GET /api/projects ─────────────────────────────────────────────
    @GetMapping
    public List<ProjectDto> listProjects(Authentication auth) {
        User user = currentUser(auth);
        return projectRepository.findByOwnerOrderByCreatedAtDesc(user)
                .stream().map(ProjectDto::from).toList();
    }

    // ── POST /api/projects ────────────────────────────────────────────
    @SuppressWarnings("null")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDto createProject(@Valid @RequestBody ProjectRequest req, Authentication auth) {
        User user = currentUser(auth);
        Project project = Project.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .status(req.getStatus() != null ? req.getStatus() : Project.Status.ACTIVE)
                .progress(req.getProgress() != null ? req.getProgress() : 0)
                .color(req.getColor() != null ? req.getColor() : "#6ee7b7")
                .dueDate(req.getDueDate())
                .owner(user)
                .build();
        Project saved = projectRepository.save(project);
        return ProjectDto.from(saved != null ? saved : project);
    }

    // ── PUT /api/projects/{id} ────────────────────────────────────────
    @PutMapping("/{id}")
    public ProjectDto updateProject(@PathVariable Long id,
                                    @Valid @RequestBody ProjectRequest req,
                                    Authentication auth) {
        User user    = currentUser(auth);
        Long safeId  = id != null ? id : 0L;
        Project proj = projectRepository.findById(safeId)
                .filter(p -> p.getOwner().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        proj.setTitle(req.getTitle());
        proj.setDescription(req.getDescription());
        if (req.getStatus()   != null) proj.setStatus(req.getStatus());
        if (req.getProgress() != null) proj.setProgress(req.getProgress());
        if (req.getColor()    != null) proj.setColor(req.getColor());
        proj.setDueDate(req.getDueDate());

        Project updated = projectRepository.save(proj);
        return ProjectDto.from(updated != null ? updated : proj);
    }

    // ── PATCH /api/projects/{id}/status ───────────────────────────────
    @PatchMapping("/{id}/status")
    public ProjectDto patchStatus(@PathVariable Long id,
                                  @RequestBody Map<String, String> body,
                                  Authentication auth) {
        User user    = currentUser(auth);
        Long safeId2 = id != null ? id : 0L;
        Project proj = projectRepository.findById(safeId2)
                .filter(p -> p.getOwner().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));

        Project.Status newStatus = Project.Status.valueOf(body.get("status").toUpperCase());
        proj.setStatus(newStatus);
        Project patched = projectRepository.save(proj);
        return ProjectDto.from(patched != null ? patched : proj);
    }

    // ── DELETE /api/projects/{id} ─────────────────────────────────────
    @SuppressWarnings({"unchecked", "unused"})
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProject(@PathVariable Long id, Authentication auth) {
        User user    = currentUser(auth);
        Long safeId3 = id != null ? id : 0L;
        Project proj = projectRepository.findById(safeId3)
                .filter(p -> p.getOwner().getId().equals(user.getId()))
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND));
        projectRepository.delete(proj);
    }

    // ── DTO ───────────────────────────────────────────────────────────
    public record ProjectDto(
        Long id, String title, String description,
        Project.Status status, int progress,
        String color, LocalDate dueDate,
        String createdAt
    ) {
        static ProjectDto from(Project p) {
            return new ProjectDto(
                p.getId(), p.getTitle(), p.getDescription(),
                p.getStatus(), p.getProgress(),
                p.getColor(), p.getDueDate(),
                p.getCreatedAt() != null ? p.getCreatedAt().toString() : null
            );
        }
    }

    public static class ProjectRequest {
        @NotBlank private String title;
        private String description;
        private Project.Status status;
        @Min(0) @Max(100) private Integer progress;
        private String color;
        private LocalDate dueDate;

        public String getTitle() { return title; }
        public void setTitle(String t) { this.title = t; }
        public String getDescription() { return description; }
        public void setDescription(String d) { this.description = d; }
        public Project.Status getStatus() { return status; }
        public void setStatus(Project.Status s) { this.status = s; }
        public Integer getProgress() { return progress; }
        public void setProgress(Integer p) { this.progress = p; }
        public String getColor() { return color; }
        public void setColor(String c) { this.color = c; }
        public LocalDate getDueDate() { return dueDate; }
        public void setDueDate(LocalDate d) { this.dueDate = d; }
    }
}
