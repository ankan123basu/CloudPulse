package com.cloudpulse;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

/**
 * REST Controller — Task Orchestration API.
 * All data persisted in MongoDB via TaskRepository.
 *
 * Endpoints:
 *   GET    /api/tasks              — list all tasks
 *   GET    /api/tasks/{id}         — get single task
 *   POST   /api/tasks              — create task (auto-detects conflicts)
 *   PUT    /api/tasks/{id}         — update task status
 *   DELETE /api/tasks/{id}         — delete task
 *   GET    /api/tasks/conflicts    — list conflicting tasks
 *   POST   /api/tasks/resolve/{id} — auto-resolve a conflict
 *   GET    /api/tasks/stats        — platform statistics
 */
@RestController
@RequestMapping("/api/tasks")
public class TaskController {

    private final TaskRepository taskRepository;
    private final ConflictDetectionService conflictService;
    private final ConflictResolutionEngine resolutionEngine;
    private final MetricsService metricsService;

    public TaskController(TaskRepository taskRepository,
                          ConflictDetectionService conflictService,
                          ConflictResolutionEngine resolutionEngine,
                          MetricsService metricsService) {
        this.taskRepository = taskRepository;
        this.conflictService = conflictService;
        this.resolutionEngine = resolutionEngine;
        this.metricsService = metricsService;
    }

    // ─── GET ALL TASKS ───
    @GetMapping
    public List<Task> getAll() {
        return taskRepository.findAll();
    }

    // ─── GET SINGLE TASK ───
    @GetMapping("/{id}")
    public ResponseEntity<Task> getById(@PathVariable String id) {
        return taskRepository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // ─── CREATE TASK (with conflict detection) ───
    @PostMapping
    public Map<String, Object> create(@RequestBody Task task) {
        task.setStatus(TaskStatus.SCHEDULED);
        Task saved = taskRepository.save(task);
        metricsService.incrementTasksCreated();

        // Run conflict detection
        int conflicts = conflictService.flagConflicts(saved);
        if (conflicts > 0) {
            metricsService.incrementConflictsDetected();
        }

        // Update active tasks gauge
        metricsService.setActiveTasks(
            taskRepository.countByStatus(TaskStatus.SCHEDULED) +
            taskRepository.countByStatus(TaskStatus.CONFLICT) +
            taskRepository.countByStatus(TaskStatus.RESOLVED) +
            taskRepository.countByStatus(TaskStatus.RUNNING)
        );

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("id", saved.getId());
        response.put("title", saved.getTitle());
        response.put("status", saved.getStatus());
        response.put("conflictsDetected", conflicts);
        response.put("message", conflicts > 0
            ? "⚠️ Task created with " + conflicts + " conflict(s). Use /resolve/" + saved.getId() + " to auto-resolve."
            : "✅ Task scheduled — no conflicts.");
        return response;
    }

    // ─── UPDATE TASK (status change) ───
    @PutMapping("/{id}")
    public ResponseEntity<Task> update(@PathVariable String id, @RequestBody Map<String, String> body) {
        return taskRepository.findById(id).map(task -> {
            if (body.containsKey("status")) {
                task.setStatus(TaskStatus.valueOf(body.get("status")));
            }
            if (body.containsKey("title")) task.setTitle(body.get("title"));
            if (body.containsKey("assignee")) task.setAssignee(body.get("assignee"));
            taskRepository.save(task);

            metricsService.setActiveTasks(
                taskRepository.countByStatus(TaskStatus.SCHEDULED) +
                taskRepository.countByStatus(TaskStatus.CONFLICT) +
                taskRepository.countByStatus(TaskStatus.RESOLVED) +
                taskRepository.countByStatus(TaskStatus.RUNNING)
            );
            return ResponseEntity.ok(task);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── DELETE TASK ───
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (taskRepository.existsById(id)) {
            taskRepository.deleteById(id);
            metricsService.setActiveTasks(
                taskRepository.countByStatus(TaskStatus.SCHEDULED) +
                taskRepository.countByStatus(TaskStatus.CONFLICT) +
                taskRepository.countByStatus(TaskStatus.RESOLVED) +
                taskRepository.countByStatus(TaskStatus.RUNNING)
            );
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }

    // ─── GET CONFLICTS ───
    @GetMapping("/conflicts")
    public List<Task> getConflicts() {
        return taskRepository.findByStatus(TaskStatus.CONFLICT);
    }

    // ─── AUTO-RESOLVE CONFLICT ───
    @PostMapping("/resolve/{id}")
    public ResponseEntity<Task> resolve(@PathVariable String id) {
        return taskRepository.findById(id).map(task -> {
            Task resolved = resolutionEngine.resolve(task);
            metricsService.incrementConflictsResolved();
            metricsService.setActiveTasks(
                taskRepository.countByStatus(TaskStatus.SCHEDULED) +
                taskRepository.countByStatus(TaskStatus.CONFLICT) +
                taskRepository.countByStatus(TaskStatus.RESOLVED) +
                taskRepository.countByStatus(TaskStatus.RUNNING)
            );
            return ResponseEntity.ok(resolved);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ─── PLATFORM STATISTICS ───
    @GetMapping("/stats")
    public Map<String, Object> stats() {
        Map<String, Object> s = new LinkedHashMap<>();
        s.put("totalTasks", taskRepository.count());
        s.put("scheduledTasks", taskRepository.countByStatus(TaskStatus.SCHEDULED));
        s.put("conflictingTasks", taskRepository.countByStatus(TaskStatus.CONFLICT));
        s.put("resolvedTasks", taskRepository.countByStatus(TaskStatus.RESOLVED));
        s.put("completedTasks", taskRepository.countByStatus(TaskStatus.DONE));
        s.put("activeTasks", taskRepository.countByStatus(TaskStatus.SCHEDULED) +
                             taskRepository.countByStatus(TaskStatus.CONFLICT) +
                             taskRepository.countByStatus(TaskStatus.RESOLVED) +
                             taskRepository.countByStatus(TaskStatus.RUNNING));
        s.put("database", "MongoDB");
        s.put("persistence", "real-time");
        return s;
    }
}
