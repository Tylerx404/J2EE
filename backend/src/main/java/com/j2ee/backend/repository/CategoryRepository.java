package com.j2ee.backend.repository;

import com.j2ee.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsDefaultTrue();

    List<Category> findByUserIdOrIsDefaultTrue(Long userId);

    List<Category> findByUserId(Long userId);

    Optional<Category> findFirstByUserIdAndSourceLocalId(Long userId, String sourceLocalId);
}
