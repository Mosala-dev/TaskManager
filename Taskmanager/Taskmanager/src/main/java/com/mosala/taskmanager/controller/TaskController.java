package com.mosala.taskmanager.controller;

import com.mosala.taskmanager.dto.TaskRequest;
import com.mosala.taskmanager.dto.TaskResponse;
import com.mosala.taskmanager.service.TaskService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskService taskService;

    public TaskController(TaskService taskService) {
        this.taskService = taskService;
    }

    private String currentUserEmail(Authentication authentication) {
        // JwtAuthFilter sets the authenticated principal's username to the user's email
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<TaskResponse> createTask(
            Authentication authentication,
            @Valid @RequestBody TaskRequest request) {

        TaskResponse response = taskService.createTask(currentUserEmail(authentication), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<TaskResponse>> getTasks(Authentication authentication) {
        List<TaskResponse> tasks = taskService.getTasksForUser(currentUserEmail(authentication));
        return ResponseEntity.ok(tasks);
    }

    @PutMapping("/{id}")
    public ResponseEntity<TaskResponse> updateTask(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody TaskRequest request) {

        TaskResponse response = taskService.updateTask(currentUserEmail(authentication), id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTask(
            Authentication authentication,
            @PathVariable Long id) {

        taskService.deleteTask(currentUserEmail(authentication), id);
        return ResponseEntity.noContent().build();
    }
}
