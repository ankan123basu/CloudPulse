package com.cloudpulse;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

/**
 * Runs on application startup.
 * Database starts empty — users create all tasks via the UI.
 */
@Component
public class DataInitializer implements CommandLineRunner {

    private final TaskRepository taskRepository;

    public DataInitializer(TaskRepository taskRepository) {
        this.taskRepository = taskRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("🚀 CloudPulse started — MongoDB connected.");
        System.out.println("📋 Current tasks in database: " + taskRepository.count());
        System.out.println("🌐 UI available at http://localhost:8080");
        System.out.println("📊 API available at http://localhost:8080/api/tasks");
    }
}
