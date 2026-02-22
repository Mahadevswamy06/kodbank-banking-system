package com.kodbank.repository;

import com.kodbank.entity.UserToken;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface TokenRepository extends JpaRepository<UserToken, Long> {
    Optional<UserToken> findByToken(String token);
    void deleteByToken(String token);
}
