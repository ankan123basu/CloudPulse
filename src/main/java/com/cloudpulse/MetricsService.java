package com.cloudpulse;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.Gauge;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Service;

import java.util.concurrent.atomic.AtomicInteger;

/**
 * Custom Prometheus business metrics for CloudPulse.
 * These metrics are scraped by Prometheus and visualized in Grafana,
 * providing real business insights beyond JVM health.
 */
@Service
public class MetricsService {

    private final Counter tasksCreatedCounter;
    private final Counter conflictsDetectedCounter;
    private final Counter conflictsResolvedCounter;
    private final AtomicInteger activeTasksGauge = new AtomicInteger(0);

    public MetricsService(MeterRegistry registry) {
        this.tasksCreatedCounter = Counter.builder("cloudpulse_tasks_created_total")
                .description("Total number of tasks created")
                .tag("application", "cloudpulse")
                .register(registry);

        this.conflictsDetectedCounter = Counter.builder("cloudpulse_conflicts_detected_total")
                .description("Total scheduling conflicts detected")
                .tag("application", "cloudpulse")
                .register(registry);

        this.conflictsResolvedCounter = Counter.builder("cloudpulse_conflicts_resolved_total")
                .description("Total conflicts automatically resolved")
                .tag("application", "cloudpulse")
                .register(registry);

        Gauge.builder("cloudpulse_active_tasks", activeTasksGauge, AtomicInteger::get)
                .description("Current number of active (non-DONE) tasks")
                .tag("application", "cloudpulse")
                .register(registry);
    }

    public void incrementTasksCreated() { tasksCreatedCounter.increment(); }
    public void incrementConflictsDetected() { conflictsDetectedCounter.increment(); }
    public void incrementConflictsResolved() { conflictsResolvedCounter.increment(); }
    public void setActiveTasks(long count) { activeTasksGauge.set((int) count); }
}
