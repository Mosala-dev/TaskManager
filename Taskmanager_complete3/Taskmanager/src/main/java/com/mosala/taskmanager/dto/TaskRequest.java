package com.mosala.taskmanager.dto;

import com.mosala.taskmanager.model.TaskStatus;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TaskRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    private TaskStatus status;
}
