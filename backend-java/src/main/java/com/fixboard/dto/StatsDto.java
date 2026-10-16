package com.fixboard.dto;

import java.util.Map;

public class StatsDto {
    private long totalRequests;
    private long totalVotes;
    private long totalFunded;
    private long totalGoal;
    private double avgPain;
    private Map<String, Long> categoryCounts;
    private Map<String, Long> statusCounts;
    private Map<Integer, Long> painCounts;

    public StatsDto() {}

    public StatsDto(long totalRequests, long totalVotes, long totalFunded, long totalGoal, double avgPain,
                    Map<String, Long> categoryCounts, Map<String, Long> statusCounts, Map<Integer, Long> painCounts) {
        this.totalRequests = totalRequests;
        this.totalVotes = totalVotes;
        this.totalFunded = totalFunded;
        this.totalGoal = totalGoal;
        this.avgPain = avgPain;
        this.categoryCounts = categoryCounts;
        this.statusCounts = statusCounts;
        this.painCounts = painCounts;
    }

    public long getTotalRequests() {
        return totalRequests;
    }

    public void setTotalRequests(long totalRequests) {
        this.totalRequests = totalRequests;
    }

    public long getTotalVotes() {
        return totalVotes;
    }

    public void setTotalVotes(long totalVotes) {
        this.totalVotes = totalVotes;
    }

    public long getTotalFunded() {
        return totalFunded;
    }

    public void setTotalFunded(long totalFunded) {
        this.totalFunded = totalFunded;
    }

    public long getTotalGoal() {
        return totalGoal;
    }

    public void setTotalGoal(long totalGoal) {
        this.totalGoal = totalGoal;
    }

    public double getAvgPain() {
        return avgPain;
    }

    public void setAvgPain(double avgPain) {
        this.avgPain = avgPain;
    }

    public Map<String, Long> getCategoryCounts() {
        return categoryCounts;
    }

    public void setCategoryCounts(Map<String, Long> categoryCounts) {
        this.categoryCounts = categoryCounts;
    }

    public Map<String, Long> getStatusCounts() {
        return statusCounts;
    }

    public void setStatusCounts(Map<String, Long> statusCounts) {
        this.statusCounts = statusCounts;
    }

    public Map<Integer, Long> getPainCounts() {
        return painCounts;
    }

    public void setPainCounts(Map<Integer, Long> painCounts) {
        this.painCounts = painCounts;
    }
}
