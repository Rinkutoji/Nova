package com.nova.repository;

import com.nova.entity.Project;
import com.nova.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {
    List<Project> findByOwnerOrderByCreatedAtDesc(User owner);
    long countByOwnerAndStatus(User owner, Project.Status status);
}
