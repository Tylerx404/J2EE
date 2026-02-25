package com.j2ee.backend.repository;

import com.j2ee.backend.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByIsDefaultTrue();

    List<Category> findByUserIdOrIsDefaultTrue(Long userId);
}