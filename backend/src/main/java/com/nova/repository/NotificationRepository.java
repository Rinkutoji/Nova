package com.nova.repository;

import com.nova.entity.Notification;
import com.nova.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserOrderByCreatedAtDesc(User user);
    long countByUserAndUnreadTrue(User user);

    @Modifying
    @Query("UPDATE Notification n SET n.unread = false WHERE n.user = :user")
    void markAllReadByUser(User user);
}
