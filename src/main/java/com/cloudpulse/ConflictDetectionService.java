package com.cloudpulse;

import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.List;

/**
 * Scans MongoDB for scheduling conflicts.
 * Detects TWO types of conflicts:
 *   1. RESOURCE CONFLICT — same resource, overlapping time
 *   2. ASSIGNEE CONFLICT — same person, overlapping time (can't do 2 things at once)
 */
@Service
public class ConflictDetectionService {

    private final TaskRepository taskRepository;

    public ConflictDetectionService(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    /**
     * Detects conflicts for a given task against all other active tasks.
     * Checks both resource overlap AND assignee overlap.
     */
    public List<Task> detectConflicts(Task newTask) {
        List<Task> conflicts = new ArrayList<>();
        List<Task> allTasks = taskRepository.findAll();

        for (Task existing : allTasks) {
            if (existing.getId().equals(newTask.getId())) continue;
            if (existing.getStatus() == TaskStatus.DONE) continue;
            if (existing.getStatus() == TaskStatus.RESOLVED) continue;

            if (newTask.overlaps(existing)) {
                // Check resource conflict
                boolean sameResource = newTask.getResourceTag() != null
                    && newTask.getResourceTag().equals(existing.getResourceTag());

                // Check assignee conflict (same person can't do 2 tasks at once)
                boolean sameAssignee = newTask.getAssignee() != null
                    && !newTask.getAssignee().isEmpty()
                    && newTask.getAssignee().equalsIgnoreCase(existing.getAssignee());

                if (sameResource || sameAssignee) {
                    conflicts.add(existing);
                }
            }
        }
        return conflicts;
    }

    /**
     * Marks all conflicting tasks including the new one as CONFLICT status.
     * Returns count of conflicts found.
     */
    public int flagConflicts(Task newTask) {
        List<Task> conflicts = detectConflicts(newTask);
        if (!conflicts.isEmpty()) {
            newTask.setStatus(TaskStatus.CONFLICT);
            taskRepository.save(newTask);
            for (Task c : conflicts) {
                if (c.getStatus() == TaskStatus.SCHEDULED) {
                    c.setStatus(TaskStatus.CONFLICT);
                    taskRepository.save(c);
                }
            }
        }
        return conflicts.size();
    }
}
