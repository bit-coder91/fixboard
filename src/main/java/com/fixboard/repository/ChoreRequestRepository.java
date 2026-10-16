package com.fixboard.repository;

import com.fixboard.model.ChoreRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChoreRequestRepository extends JpaRepository<ChoreRequest, Long> {

    List<ChoreRequest> findAllByOrderByVotesDesc();

    List<ChoreRequest> findAllByOrderByCreatedAtDesc();

    List<ChoreRequest> findAllByOrderByFundingRaisedDesc();

    @Query("SELECT c FROM ChoreRequest c WHERE " +
           "(:category IS NULL OR :category = 'all' OR c.category = :category) AND " +
           "(:status IS NULL OR :status = 'all' OR c.status = :status) AND " +
           "(:search IS NULL OR LOWER(c.title) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.description) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           " LOWER(c.author) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<ChoreRequest> searchChores(@Param("category") String category,
                                    @Param("status") String status,
                                    @Param("search") String search);
}
