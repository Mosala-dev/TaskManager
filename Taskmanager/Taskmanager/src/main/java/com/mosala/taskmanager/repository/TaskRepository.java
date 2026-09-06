package com.mosala.taskmanager.repository;

import com.mosala.taskmanager.model.Task;
import com.mosala.taskmanager.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByOwnerOrderByCreatedAtDesc(User owner);
    Optional<Task> findByIdAndOwner(Long id, User owner);
}
