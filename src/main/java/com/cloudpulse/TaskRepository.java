package com.cloudpulse;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

/**
 * MongoDB repository for Task documents.
 * Spring Data auto-generates CRUD + custom query implementations.
 */
public interface TaskRepository extends MongoRepository<Task, String> {

    List<Task> findByResourceTag(String resourceTag);

    List<Task> findByStatus(TaskStatus status);

    List<Task> findByAssignee(String assignee);

    long countByStatus(TaskStatus status);
}
