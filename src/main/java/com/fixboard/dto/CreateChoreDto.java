package com.fixboard.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.util.List;

public class CreateChoreDto {

    @NotBlank(message = "Title is required")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Category is required")
    private String category;

    @NotNull(message = "Pain level is required")
    @Min(1)
    @Max(5)
    private Integer pain;

    private Long fundingGoal;

    @NotBlank(message = "Author name is required")
    private String author;

    private List<String> platforms;

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
}
