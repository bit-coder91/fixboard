package com.fixboard.model;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "chore_requests")
public class ChoreRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, length = 50)
    private String category; // catalog, returns, sync, listings, pricing, shipping, other

    @Column(nullable = false)
    private Integer pain; // 1 to 5

    private Long fundingGoal = 0L;

    private Long fundingRaised = 0L;

    private Integer votes = 0;

    @Column(nullable = false, length = 50)
    private String status = "open"; // open, funded, in-progress, solved

    @Column(nullable = false, length = 100)
    private String author;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "chore_platforms", joinColumns = @JoinColumn(name = "chore_id"))
    @Column(name = "platform")
    private List<String> platforms = new ArrayList<>();

    @Column(nullable = false)
    private Long createdAt;

    private Integer backers = 0;

    @OneToMany(mappedBy = "choreRequest", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @OrderBy("createdAt DESC")
    private List<Comment> comments = new ArrayList<>();

    public ChoreRequest() {
        this.createdAt = Instant.now().toEpochMilli();
    }

    public ChoreRequest(String title, String description, String category, Integer pain, Long fundingGoal,
                        Long fundingRaised, Integer votes, String status, String author, List<String> platforms,
                        Long createdAt, Integer backers) {
        this.title = title;
        this.description = description;
        this.category = category;
        this.pain = pain;
        this.fundingGoal = fundingGoal != null ? fundingGoal : 0L;
        this.fundingRaised = fundingRaised != null ? fundingRaised : 0L;
        this.votes = votes != null ? votes : 0;
        this.status = status != null ? status : "open";
        this.author = author;
        if (platforms != null) {
            this.platforms = platforms;
        }
        this.createdAt = createdAt != null ? createdAt : Instant.now().toEpochMilli();
        this.backers = backers != null ? backers : 0;
    }

    public void addComment(Comment comment) {
        comments.add(comment);
        comment.setChoreRequest(this);
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Integer getPain() {
        return pain;
    }

    public void setPain(Integer pain) {
        this.pain = pain;
    }

    public Long getFundingGoal() {
        return fundingGoal;
    }

    public void setFundingGoal(Long fundingGoal) {
        this.fundingGoal = fundingGoal;
    }

    public Long getFundingRaised() {
        return fundingRaised;
    }

    public void setFundingRaised(Long fundingRaised) {
        this.fundingRaised = fundingRaised;
    }

    public Integer getVotes() {
        return votes;
    }

    public void setVotes(Integer votes) {
        this.votes = votes;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getAuthor() {
        return author;
    }

    public void setAuthor(String author) {
        this.author = author;
    }

    public List<String> getPlatforms() {
        return platforms;
    }

    public void setPlatforms(List<String> platforms) {
        this.platforms = platforms;
    }

    public Long getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Long createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getBackers() {
        return backers;
    }

    public void setBackers(Integer backers) {
        this.backers = backers;
    }

    public List<Comment> getComments() {
        return comments;
    }

    public void setComments(List<Comment> comments) {
        this.comments = comments;
    }
}
