package com.fixboard.service;

import com.fixboard.dto.*;
import com.fixboard.model.ChoreRequest;
import com.fixboard.model.Comment;
import com.fixboard.model.Pledge;
import com.fixboard.repository.ChoreRequestRepository;
import com.fixboard.repository.CommentRepository;
import com.fixboard.repository.PledgeRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChoreService {

    private final ChoreRequestRepository choreRepository;
    private final CommentRepository commentRepository;
    private final PledgeRepository pledgeRepository;

    public ChoreService(ChoreRequestRepository choreRepository,
                        CommentRepository commentRepository,
                        PledgeRepository pledgeRepository) {
        this.choreRepository = choreRepository;
        this.commentRepository = commentRepository;
        this.pledgeRepository = pledgeRepository;
    }

    @Transactional(readOnly = true)
    public List<ChoreRequest> getChores(String category, String status, String search, String sort) {
        List<ChoreRequest> list = choreRepository.searchChores(
                (category == null || category.equalsIgnoreCase("all")) ? null : category.toLowerCase(),
                (status == null || status.equalsIgnoreCase("all")) ? null : status.toLowerCase(),
                (search == null || search.trim().isEmpty()) ? null : search.trim().toLowerCase()
        );

        if (sort == null) {
            sort = "hot";
        }

        switch (sort.toLowerCase()) {
            case "newest":
                list.sort((a, b) -> Long.compare(b.getCreatedAt(), a.getCreatedAt()));
                break;
            case "most-voted":
                list.sort((a, b) -> Integer.compare(b.getVotes(), a.getVotes()));
                break;
            case "most-funded":
                list.sort((a, b) -> Long.compare(b.getFundingRaised(), a.getFundingRaised()));
                break;
            case "hot":
            default:
                long now = System.currentTimeMillis();
                list.sort((a, b) -> {
                    double scoreA = (a.getVotes() * 2.0) + (a.getFundingRaised() / 10.0) - ((now - a.getCreatedAt()) / 86400000.0);
                    double scoreB = (b.getVotes() * 2.0) + (b.getFundingRaised() / 10.0) - ((now - b.getCreatedAt()) / 86400000.0);
                    return Double.compare(scoreB, scoreA);
                });
                break;
        }

        return list;
    }

    @Transactional(readOnly = true)
    public Optional<ChoreRequest> getChoreById(Long id) {
        return choreRepository.findById(id);
    }

    public ChoreRequest createChore(CreateChoreDto dto) {
        ChoreRequest chore = new ChoreRequest();
        chore.setTitle(dto.getTitle());
        chore.setDescription(dto.getDescription());
        chore.setCategory(dto.getCategory().toLowerCase());
        chore.setPain(dto.getPain());
        chore.setFundingGoal(dto.getFundingGoal() != null ? dto.getFundingGoal() : 0L);
        chore.setFundingRaised(0L);
        chore.setVotes(1); // Auto upvote on creation
        chore.setStatus("open");
        chore.setAuthor(dto.getAuthor());
        chore.setBackers(0);
        chore.setCreatedAt(System.currentTimeMillis());

        if (dto.getPlatforms() != null) {
            chore.setPlatforms(dto.getPlatforms());
        }

        return choreRepository.save(chore);
    }

    public ChoreRequest vote(Long id, boolean unvote) {
        ChoreRequest chore = choreRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Chore request not found with id: " + id));

        if (unvote) {
            chore.setVotes(Math.max(0, chore.getVotes() - 1));
        } else {
            chore.setVotes(chore.getVotes() + 1);
        }

        return choreRepository.save(chore);
    }

    public ChoreRequest pledge(Long id, PledgeDto dto) {
        ChoreRequest chore = choreRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Chore request not found with id: " + id));

        Pledge pledge = new Pledge(id, dto.getBackerName(), dto.getAmount());
        pledgeRepository.save(pledge);

        chore.setFundingRaised(chore.getFundingRaised() + dto.getAmount());
        chore.setBackers(chore.getBackers() + 1);

        if (chore.getFundingGoal() > 0 && chore.getFundingRaised() >= chore.getFundingGoal()
                && "open".equalsIgnoreCase(chore.getStatus())) {
            chore.setStatus("funded");
        }

        return choreRepository.save(chore);
    }

    public Comment addComment(Long id, CommentDto dto) {
        ChoreRequest chore = choreRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Chore request not found with id: " + id));

        Comment comment = new Comment(dto.getAuthor(), dto.getText(), System.currentTimeMillis());
        chore.addComment(comment);
        choreRepository.save(chore);
        return comment;
    }

    @Transactional(readOnly = true)
    public List<ChoreRequest> getLeaderboard() {
        return choreRepository.findAllByOrderByVotesDesc().stream().limit(10).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StatsDto getStats() {
        List<ChoreRequest> all = choreRepository.findAll();
        long totalRequests = all.size();
        long totalVotes = all.stream().mapToLong(ChoreRequest::getVotes).sum();
        long totalFunded = all.stream().mapToLong(ChoreRequest::getFundingRaised).sum();
        long totalGoal = all.stream().mapToLong(ChoreRequest::getFundingGoal).sum();

        double avgPain = totalRequests > 0
                ? all.stream().mapToInt(ChoreRequest::getPain).average().orElse(0.0)
                : 0.0;

        Map<String, Long> categoryCounts = all.stream()
                .collect(Collectors.groupingBy(ChoreRequest::getCategory, Collectors.counting()));

        Map<String, Long> statusCounts = all.stream()
                .collect(Collectors.groupingBy(ChoreRequest::getStatus, Collectors.counting()));

        Map<Integer, Long> painCounts = all.stream()
                .collect(Collectors.groupingBy(ChoreRequest::getPain, Collectors.counting()));

        return new StatsDto(totalRequests, totalVotes, totalFunded, totalGoal,
                Math.round(avgPain * 10.0) / 10.0, categoryCounts, statusCounts, painCounts);
    }
}
