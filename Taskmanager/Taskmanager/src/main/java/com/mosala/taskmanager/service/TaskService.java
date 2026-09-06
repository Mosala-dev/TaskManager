package com.mosala.taskmanager.service;

import com.mosala.taskmanager.dto.TaskRequest;
import com.mosala.taskmanager.dto.TaskResponse;
import com.mosala.taskmanager.exception.ResourceNotFoundException;
import com.mosala.taskmanager.model.Task;
import com.mosala.taskmanager.model.TaskStatus;
import com.mosala.taskmanager.model.User;
import com.mosala.taskmanager.repository.TaskRepository;
import com.mosala.taskmanager.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    public TaskService(TaskRepository taskRepository, UserRepository userRepository) {
        this.taskRepository = taskRepository;
        this.userRepository = userRepository;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    public TaskResponse createTask(String userEmail, TaskRequest request) {
        User owner = getUserByEmail(userEmail);

        Task task = new Task();
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(request.getStatus() != null ? request.getStatus() : TaskStatus.TODO);
        task.setOwner(owner);

        Task saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public List<TaskResponse> getTasksForUser(String userEmail) {
        User owner = getUserByEmail(userEmail);

        return taskRepository.findByOwnerOrderByCreatedAtDesc(owner)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public TaskResponse updateTask(String userEmail, Long taskId, TaskRequest request) {
        User owner = getUserByEmail(userEmail);

        Task task = taskRepository.findByIdAndOwner(taskId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        if (request.getStatus() != null) {
            task.setStatus(request.getStatus());
        }

        Task updated = taskRepository.save(task);
        return toResponse(updated);
    }

    public void deleteTask(String userEmail, Long taskId) {
        User owner = getUserByEmail(userEmail);

        Task task = taskRepository.findByIdAndOwner(taskId, owner)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));

        taskRepository.delete(task);
    }

    private TaskResponse toResponse(Task task) {
        return new TaskResponse(
                task.getId(),
                task.getTitle(),
                task.getDescription(),
                task.getStatus(),
                task.getCreatedAt(),
                task.getUpdatedAt()
        );
    }
}
