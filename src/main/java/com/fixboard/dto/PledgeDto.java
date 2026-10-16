package com.fixboard.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class PledgeDto {

    @NotNull(message = "Amount is required")
    @Min(value = 1, message = "Pledge amount must be at least $1")
    private Long amount;

    @NotBlank(message = "Backer name is required")
    private String backerName;

    public Long getAmount() {
        return amount;
    }

    public void setAmount(Long amount) {
        this.amount = amount;
    }

    public String getBackerName() {
        return backerName;
    }

    public void setBackerName(String backerName) {
        this.backerName = backerName;
    }
}
