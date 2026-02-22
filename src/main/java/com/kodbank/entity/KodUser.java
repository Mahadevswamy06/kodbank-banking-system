package com.kodbank.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "kod_user")
public class KodUser {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long uid;

    @Column(unique = true, nullable = false)
    private String username;

    private String fullname;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false)
    private BigDecimal balance = new BigDecimal("100000.00");

    private String phone;

    @Column(nullable = false)
    private String role = "CUSTOMER";

    public KodUser() {
    }

    public KodUser(String username, String fullname, String email, String password, String phone, String role) {
        this.username = username;
        this.fullname = fullname;
        this.email = email;
        this.password = password;
        this.phone = phone;
        this.role = role;
    }

    public Long getUid() {
        return uid;
    }

    public void setUid(Long uid) {
        this.uid = uid;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullname() {
        return fullname;
    }

    public void setFullname(String fullname) {
        this.fullname = fullname;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public BigDecimal getBalance() {
        return balance;
    }

    public void setBalance(BigDecimal balance) {
        this.balance = balance;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public static KodUserBuilder builder() {
        return new KodUserBuilder();
    }

    public static class KodUserBuilder {
        private String username;
        private String fullname;
        private String email;
        private String password;
        private String phone;
        private String role = "CUSTOMER";

        public KodUserBuilder username(String username) {
            this.username = username;
            return this;
        }

        public KodUserBuilder fullname(String fullname) {
            this.fullname = fullname;
            return this;
        }

        public KodUserBuilder email(String email) {
            this.email = email;
            return this;
        }

        public KodUserBuilder password(String password) {
            this.password = password;
            return this;
        }

        public KodUserBuilder phone(String phone) {
            this.phone = phone;
            return this;
        }

        public KodUserBuilder role(String role) {
            this.role = role;
            return this;
        }

        public KodUser build() {
            return new KodUser(username, fullname, email, password, phone, role);
        }
    }
}
