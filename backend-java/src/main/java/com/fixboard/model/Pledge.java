package com.fixboard.model;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "pledges")
public class Pledge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long choreId;

    @Column(nullable = false)
    private String backerName;

    @Column(nullable = false)
    private Long amount;

    @Column(nullable = false)
    private Long pledgedAt;

    public Pledge() {
        this.pledgedAt = Instant.now().toEpochMilli();
    }

    public Pledge(Long choreId, String backerName, Long amount) {
        this.choreId = choreId;
        this.backerName = backerName;
        this.amount = amount;
        this.pledgedAt = Instant.now().toEpochMilli();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getChoreId() {
        return choreId;
    }

    public void setChoreId(Long choreId) {
        this.choreId = choreId;
    }

    public String getBackerName() {
        return backerName;
    }

    public void setBackerName(String backerName) {
        this.backerName = backerName;
    }

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public Long getPledgedAt() {
        return pledgedAt;
    }

    public void setPledgedAt(Long pledgedAt) {
        this.pledgedAt = pledgedAt;
    }
}
