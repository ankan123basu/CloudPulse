package com.cloudpulse;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.DisplayName;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Unit tests for CloudPulse Task Orchestration Engine.
 * Tests core logic (overlap detection, priority, status) without MongoDB.
 */
class TaskControllerTest {

    @Test
    @DisplayName("Task creation sets default status to SCHEDULED")
    void testTaskDefaultStatus() {
        Task task = new Task("Backup", "DB Backup", "ops",
            "SERVER-01", LocalDateTime.now(), LocalDateTime.now().plusHours(1), Priority.HIGH);
        assertEquals(TaskStatus.SCHEDULED, task.getStatus());
        assertNotNull(task.getCreatedAt());
    }

    @Test
    @DisplayName("Overlapping tasks on same resource are detected")
    void testOverlapDetection() {
        LocalDateTime now = LocalDateTime.now();
        Task t1 = new Task("Task A", "", "", "SERVER-01", now, now.plusHours(2), Priority.HIGH);
        Task t2 = new Task("Task B", "", "", "SERVER-01", now.plusHours(1), now.plusHours(3), Priority.LOW);

        assertTrue(t1.overlaps(t2), "Tasks with overlapping time windows should be detected");
    }

    @Test
    @DisplayName("Non-overlapping tasks are not flagged")
    void testNoOverlap() {
        LocalDateTime now = LocalDateTime.now();
        Task t1 = new Task("Task A", "", "", "SERVER-01", now, now.plusHours(1), Priority.HIGH);
        Task t2 = new Task("Task B", "", "", "SERVER-01", now.plusHours(2), now.plusHours(3), Priority.LOW);

        assertFalse(t1.overlaps(t2), "Non-overlapping tasks should not be detected as conflicts");
    }

    @Test
    @DisplayName("Priority enum has correct ordering")
    void testPriorityOrdering() {
        assertTrue(Priority.HIGH.ordinal() < Priority.MEDIUM.ordinal());
        assertTrue(Priority.MEDIUM.ordinal() < Priority.LOW.ordinal());
    }

    @Test
    @DisplayName("Task status lifecycle is valid")
    void testStatusLifecycle() {
        Task task = new Task("Test", "", "", "SERVER-01",
            LocalDateTime.now(), LocalDateTime.now().plusHours(1), Priority.MEDIUM);

        assertEquals(TaskStatus.SCHEDULED, task.getStatus());

        task.setStatus(TaskStatus.CONFLICT);
        assertEquals(TaskStatus.CONFLICT, task.getStatus());

        task.setStatus(TaskStatus.RESOLVED);
        assertEquals(TaskStatus.RESOLVED, task.getStatus());

        task.setStatus(TaskStatus.DONE);
        assertEquals(TaskStatus.DONE, task.getStatus());
    }
}
