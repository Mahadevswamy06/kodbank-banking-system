package com.kodbank.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_token")
public class UserToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long tid;

    @Column(columnDefinition = "TEXT")
    private String token;

    @ManyToOne
    @JoinColumn(name = "uid", nullable = false)
    private KodUser user;

    private LocalDateTime expiry;

    public UserToken() {
    }

    public UserToken(String token, KodUser user, LocalDateTime expiry) {
        this.token = token;
        this.user = user;
        this.expiry = expiry;
    }

    public Long getTid() {
        return tid;
    }

    public void setTid(Long tid) {
        this.tid = tid;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public KodUser getUser() {
        return user;
    }

    public void setUser(KodUser user) {
        this.user = user;
    }

    public LocalDateTime getExpiry() {
        return expiry;
    }

    public void setExpiry(LocalDateTime expiry) {
        this.expiry = expiry;
    }

    public static UserTokenBuilder builder() {
        return new UserTokenBuilder();
    }

    public static class UserTokenBuilder {
        private String token;
        private KodUser user;
        private LocalDateTime expiry;

        public UserTokenBuilder token(String token) {
            this.token = token;
            return this;
        }

        public UserTokenBuilder user(KodUser user) {
            this.user = user;
            return this;
        }

        public UserTokenBuilder expiry(LocalDateTime expiry) {
            this.expiry = expiry;
            return this;
        }

        public UserToken build() {
            return new UserToken(token, user, expiry);
        }
    }
}
