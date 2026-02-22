package com.kodbank.service;

import com.kodbank.entity.KodUser;
import com.kodbank.entity.Transaction;
import com.kodbank.entity.UserToken;
import com.kodbank.repository.TokenRepository;
import com.kodbank.repository.TransactionRepository;
import com.kodbank.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TokenRepository tokenRepository;

    @Autowired
    private TransactionRepository transactionRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public KodUser registerUser(KodUser user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public Optional<KodUser> findByUsername(String username) {
        return userRepository.findByUsername(username);
    }

    @Transactional
    public void saveToken(String token, KodUser user, long expirationMillis) {
        UserToken userToken = UserToken.builder()
                .token(token)
                .user(user)
                .expiry(LocalDateTime.now().plusNanos(expirationMillis * 1000000))
                .build();
        tokenRepository.save(userToken);
    }

    @Transactional
    public void transfer(String senderUsername, String receiverUsername, BigDecimal amount, String description) {
        KodUser sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        KodUser receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        if (sender.getBalance().compareTo(amount) < 0) {
            throw new RuntimeException("Insufficient balance");
        }

        sender.setBalance(sender.getBalance().subtract(amount));
        receiver.setBalance(receiver.getBalance().add(amount));

        userRepository.save(sender);
        userRepository.save(receiver);

        Transaction transaction = Transaction.builder()
                .sender(sender)
                .receiver(receiver)
                .amount(amount)
                .timestamp(LocalDateTime.now())
                .description(description)
                .build();

        transactionRepository.save(transaction);
    }

    public List<Transaction> getTransactionHistory(String username) {
        KodUser user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return transactionRepository.findByUser(user);
    }
}
