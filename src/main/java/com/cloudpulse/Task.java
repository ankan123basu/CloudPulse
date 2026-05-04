package com.cloudpulse;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

/**
 * Task entity stored in MongoDB.
 * Each task is bound to a resource and has a time window, priority, and lifecycle status.
 */
@Document(collection = "tasks")
public class Task {

    @Id
    private String id;
    private String title;
    private String description;
    private String assignee;
    private String resourceTag;       // e.g., "SERVER-01", "DB-CLUSTER"
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private Priority priority;
    private TaskStatus status;
    private LocalDateTime createdAt;
    private String resolvedNote;      // explanation if auto-resolved

    public Task() {
        this.status = TaskStatus.SCHEDULED;
        this.createdAt = LocalDateTime.now();
    }

    public Task(String title, String description, String assignee,
                String resourceTag, LocalDateTime startTime, LocalDateTime endTime,
                Priority priority) {
        this.title = title;
        this.description = description;
        this.assignee = assignee;
        this.resourceTag = resourceTag;
        this.startTime = startTime;
        this.endTime = endTime;
        this.priority = priority;
        this.status = TaskStatus.SCHEDULED;
        this.createdAt = LocalDateTime.now();
    }

    /**
     * Checks if this task's time window overlaps with another task.
     */
    public boolean overlaps(Task other) {
        if (this.startTime == null || this.endTime == null ||
            other.startTime == null || other.endTime == null) {
            return false;
        }
        return this.startTime.isBefore(other.endTime) && this.endTime.isAfter(other.startTime);
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getAssignee() { return assignee; }
    public void setAssignee(String assignee) { this.assignee = assignee; }

    public String getResourceTag() { return resourceTag; }
    public void setResourceTag(String resourceTag) { this.resourceTag = resourceTag; }

    public LocalDateTime getStartTime() { return startTime; }
    public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }

    public LocalDateTime getEndTime() { return endTime; }
    public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }

    public Priority getPriority() { return priority; }
    public void setPriority(Priority priority) { this.priority = priority; }

    public TaskStatus getStatus() { return status; }
    public void setStatus(TaskStatus status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public String getResolvedNote() { return resolvedNote; }
    public void setResolvedNote(String resolvedNote) { this.resolvedNote = resolvedNote; }
}
