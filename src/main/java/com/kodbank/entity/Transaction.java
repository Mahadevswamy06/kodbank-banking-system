package com.kodbank.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "sender_uid", nullable = false)
    private KodUser sender;

    @ManyToOne
    @JoinColumn(name = "receiver_uid", nullable = false)
    private KodUser receiver;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    private String description;

    public Transaction() {
    }

    public Transaction(KodUser sender, KodUser receiver, BigDecimal amount, LocalDateTime timestamp,
            String description) {
        this.sender = sender;
        this.receiver = receiver;
        this.amount = amount;
        this.timestamp = timestamp;
        this.description = description;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public KodUser getSender() {
        return sender;
    }

    public void setSender(KodUser sender) {
        this.sender = sender;
    }

    public KodUser getReceiver() {
        return receiver;
    }

    public void setReceiver(KodUser receiver) {
        this.receiver = receiver;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public static TransactionBuilder builder() {
        return new TransactionBuilder();
    }

    public static class TransactionBuilder {
        private KodUser sender;
        private KodUser receiver;
        private BigDecimal amount;
        private LocalDateTime timestamp;
        private String description;

        public TransactionBuilder sender(KodUser sender) {
            this.sender = sender;
            return this;
        }

        public TransactionBuilder receiver(KodUser receiver) {
            this.receiver = receiver;
            return this;
        }

        public TransactionBuilder amount(BigDecimal amount) {
            this.amount = amount;
            return this;
        }

        public TransactionBuilder timestamp(LocalDateTime timestamp) {
            this.timestamp = timestamp;
            return this;
        }

        public TransactionBuilder description(String description) {
            this.description = description;
            return this;
        }

        public Transaction build() {
            return new Transaction(sender, receiver, amount, timestamp, description);
        }
    }
}
