package com.movieticket.movieticket.repository;

import com.movieticket.movieticket.entity.Transaction;
import com.movieticket.movieticket.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

    List<Transaction> findByUserOrderByCreatedAtDesc(User user);

    List<Transaction> findByUserAndTypeOrderByCreatedAtDesc(User user, Transaction.TransactionType type);

    @Query("SELECT t FROM Transaction t WHERE t.user = :user ORDER BY t.createdAt DESC")
    List<Transaction> findUserTransactions(User user);
}
