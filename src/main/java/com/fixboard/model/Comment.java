package com.fixboard.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String author;

    @Column(nullable = false, length = 1000)
    private String text;

    @Column(nullable = false)
    private Long createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "chore_id")
    @JsonIgnore
    private ChoreRequest choreRequest;

    public Comment() {
        this.createdAt = Instant.now().toEpochMilli();
    }

    public Comment(String author, String text, Long createdAt) {
        this.author = author;
        this.text = text;
        this.createdAt = createdAt != null ? createdAt : Instant.now().toEpochMilli();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public String getText() {
        return text;
    }

    public void setText(String text) {
        this.text = text;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public ChoreRequest getChoreRequest() {
        return choreRequest;
    }

    public void setChoreRequest(ChoreRequest choreRequest) {
        this.choreRequest = choreRequest;
    }
}
