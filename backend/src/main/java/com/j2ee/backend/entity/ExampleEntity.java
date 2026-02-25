package com.j2ee.backend.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.Data;

@Entity
@Data
public class ExampleEntity {
    @Id
    private Long id;
    private String name;
}