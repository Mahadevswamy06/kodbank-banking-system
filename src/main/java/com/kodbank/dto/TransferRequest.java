package com.kodbank.dto;

import java.math.BigDecimal;

public class TransferRequest {
    private String receiverUsername;
    private BigDecimal amount;
    private String description;

    public TransferRequest() {
    }

    public TransferRequest(String receiverUsername, BigDecimal amount, String description) {
        this.receiverUsername = receiverUsername;
        this.amount = amount;
        this.description = description;
    }

    public String getReceiverUsername() {
        return receiverUsername;
    }

    public void setReceiverUsername(String receiverUsername) {
        this.receiverUsername = receiverUsername;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
