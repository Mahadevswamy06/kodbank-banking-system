package com.kodbank.repository;

import com.kodbank.entity.KodUser;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface UserRepository extends JpaRepository<KodUser, Long> {
    Optional<KodUser> findByUsername(String username);
}
