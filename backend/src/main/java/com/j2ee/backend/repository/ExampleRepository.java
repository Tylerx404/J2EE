package com.j2ee.backend.repository;

import com.j2ee.backend.entity.ExampleEntity;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExampleRepository extends JpaRepository<ExampleEntity, Long> {
}