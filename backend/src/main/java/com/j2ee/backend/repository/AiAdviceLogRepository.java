package com.j2ee.backend.repository;

import com.j2ee.backend.entity.AiAdviceLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AiAdviceLogRepository extends JpaRepository<AiAdviceLog, Long> {
    List<AiAdviceLog> findByUserIdOrderByGeneratedAtDesc(Long userId);

    List<AiAdviceLog> findByUserIdAndPeriodOrderByGeneratedAtDesc(Long userId, String period);
}