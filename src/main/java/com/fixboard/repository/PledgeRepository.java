package com.fixboard.repository;

import com.fixboard.model.Pledge;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PledgeRepository extends JpaRepository<Pledge, Long> {
    List<Pledge> findByChoreIdOrderByPledgedAtDesc(Long choreId);
}
