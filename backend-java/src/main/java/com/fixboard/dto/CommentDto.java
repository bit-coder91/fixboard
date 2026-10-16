package com.fixboard.dto;

import jakarta.validation.constraints.NotBlank;

public class CommentDto {

    @NotBlank(message = "Author name is required")
    private String author;

    @NotBlank(message = "Comment text is required")
    private String text;

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
}
