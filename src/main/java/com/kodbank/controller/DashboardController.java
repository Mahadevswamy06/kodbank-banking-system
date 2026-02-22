package com.kodbank.controller;

import com.kodbank.dto.TransferRequest;
import com.kodbank.entity.KodUser;
import com.kodbank.entity.Transaction;
import com.kodbank.repository.UserRepository;
import com.kodbank.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping("/debug/users")
    public ResponseEntity<?> listUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }

    @GetMapping("/balance")
    public ResponseEntity<?> getBalance(Authentication authentication) {
        if (authentication == null) {
            System.out.println("DEBUG: Authentication is null");
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String username = authentication.getName();
        System.out.println("DEBUG: Fetching balance for user: " + username);
        KodUser user = userService.findByUsername(username).orElse(null);
        if (user == null) {
            System.out.println("DEBUG: User not found: " + username);
            return ResponseEntity.status(404).body("User not found");
        }

        Map<String, Object> response = new HashMap<>();
        response.put("username", user.getUsername());
        response.put("balance", user.getBalance());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/userinfo")
    public ResponseEntity<?> getUserInfo(Authentication authentication) {
        if (authentication == null) {
            System.out.println("DEBUG: Authentication is null (userinfo)");
            return ResponseEntity.status(401).body("Not authenticated");
        }
        String username = authentication.getName();
        System.out.println("DEBUG: Fetching userinfo for user: " + username);
        KodUser user = userService.findByUsername(username).orElse(null);
        if (user == null) {
            System.out.println("DEBUG: User not found (userinfo): " + username);
            return ResponseEntity.status(404).body("User not found");
        }
        return ResponseEntity.ok(user);
    }

    @PostMapping("/transfer")
    public ResponseEntity<?> transfer(Authentication authentication, @RequestBody TransferRequest request) {
        if (authentication == null)
            return ResponseEntity.status(401).body("Not authenticated");

        try {
            userService.transfer(authentication.getName(), request.getReceiverUsername(), request.getAmount(),
                    request.getDescription());
            return ResponseEntity.ok("Transfer successful");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/history")
    public ResponseEntity<?> getHistory(Authentication authentication) {
        if (authentication == null)
            return ResponseEntity.status(401).body("Not authenticated");

        List<Transaction> transactions = userService.getTransactionHistory(authentication.getName());

        // Map to simplified DTO or Map to avoid circular references/extra data
        List<Map<String, Object>> result = transactions.stream().map(t -> {
            Map<String, Object> map = new HashMap<>();
            map.put("id", t.getId());
            map.put("sender", t.getSender().getUsername());
            map.put("receiver", t.getReceiver().getUsername());
            map.put("amount", t.getAmount());
            map.put("timestamp", t.getTimestamp());
            map.put("description", t.getDescription());
            map.put("type", t.getSender().getUsername().equals(authentication.getName()) ? "DEBIT" : "CREDIT");
            return map;
        }).collect(Collectors.toList());

        return ResponseEntity.ok(result);
    }
}
