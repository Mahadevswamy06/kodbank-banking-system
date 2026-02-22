package com.kodbank.repository;

import com.kodbank.entity.KodUser;
import com.kodbank.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    @Query("SELECT t FROM Transaction t WHERE t.sender = :user OR t.receiver = :user ORDER BY t.timestamp DESC")
    List<Transaction> findByUser(@Param("user") KodUser user);
}
