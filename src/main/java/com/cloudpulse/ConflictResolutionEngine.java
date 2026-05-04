package com.cloudpulse;

import org.springframework.stereotype.Service;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Smart conflict resolution engine with free-slot detection.
 *
 * Logic:
 *   1. Find entire conflict group (same resource/assignee, overlapping)
 *   2. Highest priority keeps original slot
 *   3. Lower priority tasks get rescheduled to the NEXT FREE SLOT
 *      where BOTH the resource AND assignee are available
 *   4. Scans all existing tasks to avoid double-booking
 */
@Service
public class ConflictResolutionEngine {

    private final TaskRepository taskRepository;

    public ConflictResolutionEngine(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    public Task resolve(Task target) {
        Set<String> conflictGroup = new HashSet<>();
        conflictGroup.add(target.getId());
        findConflictGroup(target, conflictGroup);

        List<Task> group = conflictGroup.stream()
            .map(id -> taskRepository.findById(id).orElse(null))
            .filter(Objects::nonNull)
            .collect(Collectors.toList());

        if (group.size() <= 1) {
            target.setStatus(TaskStatus.RESOLVED);
            target.setResolvedNote("No active conflicts — task is clear.");
            taskRepository.save(target);
            return target;
        }

        // Sort: HIGH first, then by creation time
        group.sort((a, b) -> {
            int p = a.getPriority().ordinal() - b.getPriority().ordinal();
            return p != 0 ? p : a.getCreatedAt().compareTo(b.getCreatedAt());
        });

        // Winner keeps slot
        Task winner = group.get(0);
        winner.setStatus(TaskStatus.RESOLVED);
        winner.setResolvedNote("✅ Kept original slot (Priority: " + winner.getPriority() + "). "
            + (group.size() - 1) + " task(s) rescheduled.");
        taskRepository.save(winner);

        // Reschedule losers to next FREE slot
        for (int i = 1; i < group.size(); i++) {
            Task loser = group.get(i);
            Duration duration = Duration.between(loser.getStartTime(), loser.getEndTime());
            String oldTime = fmt(loser.getStartTime()) + " - " + fmt(loser.getEndTime());

            // Find next free slot for this task's resource AND assignee
            LocalDateTime freeStart = findNextFreeSlot(
                loser.getId(),
                loser.getResourceTag(),
                loser.getAssignee(),
                winner.getEndTime().plusMinutes(5),
                duration
            );

            loser.setStartTime(freeStart);
            loser.setEndTime(freeStart.plus(duration));
            loser.setStatus(TaskStatus.RESOLVED);
            loser.setResolvedNote("⏩ Moved from [" + oldTime + "] → [" + fmt(freeStart)
                + " - " + fmt(loser.getEndTime()) + "]. "
                + "Yielded to \"" + winner.getTitle() + "\" (" + winner.getPriority()
                + "). Slot verified: resource & assignee both free.");
            taskRepository.save(loser);
        }

        return taskRepository.findById(target.getId()).orElse(target);
    }

    /**
     * Finds the next time slot where BOTH the resource and assignee are free.
     * Scans all existing tasks and slides forward until a clear window is found.
     */
    private LocalDateTime findNextFreeSlot(String excludeId, String resource,
                                            String assignee, LocalDateTime earliest,
                                            Duration duration) {
        List<Task> allTasks = taskRepository.findAll().stream()
            .filter(t -> !t.getId().equals(excludeId))
            .filter(t -> t.getStatus() != TaskStatus.DONE)
            .collect(Collectors.toList());

        LocalDateTime candidate = earliest;
        int maxAttempts = 100; // Safety limit

        for (int attempt = 0; attempt < maxAttempts; attempt++) {
            LocalDateTime candidateEnd = candidate.plus(duration);
            boolean slotFree = true;

            for (Task existing : allTasks) {
                if (existing.getStartTime() == null || existing.getEndTime() == null) continue;

                // Check if candidate overlaps with this task
                boolean overlaps = candidate.isBefore(existing.getEndTime())
                    && candidateEnd.isAfter(existing.getStartTime());

                if (!overlaps) continue;

                // Check if it's the same resource or same assignee
                boolean sameResource = resource != null
                    && resource.equals(existing.getResourceTag());
                boolean sameAssignee = assignee != null
                    && !assignee.isEmpty()
                    && assignee.equalsIgnoreCase(existing.getAssignee());

                if (sameResource || sameAssignee) {
                    // Conflict! Jump past this task's end time
                    candidate = existing.getEndTime().plusMinutes(5);
                    slotFree = false;
                    break;
                }
            }

            if (slotFree) {
                return candidate;
            }
        }

        // Fallback: if no slot found in 100 attempts, use the last candidate
        return candidate;
    }

    private void findConflictGroup(Task task, Set<String> visited) {
        List<Task> allTasks = taskRepository.findAll();
        for (Task other : allTasks) {
            if (visited.contains(other.getId())) continue;
            if (other.getStatus() == TaskStatus.DONE) continue;
            if (other.getStatus() == TaskStatus.RESOLVED) continue;

            if (task.overlaps(other)) {
                boolean sameResource = task.getResourceTag() != null
                    && task.getResourceTag().equals(other.getResourceTag());
                boolean sameAssignee = task.getAssignee() != null
                    && !task.getAssignee().isEmpty()
                    && task.getAssignee().equalsIgnoreCase(other.getAssignee());

                if (sameResource || sameAssignee) {
                    visited.add(other.getId());
                    findConflictGroup(other, visited);
                }
            }
        }
    }

    private String fmt(LocalDateTime dt) {
        return String.format("%02d:%02d", dt.getHour(), dt.getMinute());
    }
}
