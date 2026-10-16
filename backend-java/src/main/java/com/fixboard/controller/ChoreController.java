package com.fixboard.controller;

import com.fixboard.dto.*;
import com.fixboard.model.ChoreRequest;
import com.fixboard.model.Comment;
import com.fixboard.service.ChoreService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/chores")
@CrossOrigin(origins = "*")
public class ChoreController {

    private final ChoreService choreService;

    public ChoreController(ChoreService choreService) {
        this.choreService = choreService;
    }

    @GetMapping
    public ResponseEntity<List<ChoreRequest>> getChores(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false, defaultValue = "hot") String sort) {
        return ResponseEntity.ok(choreService.getChores(category, status, search, sort));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ChoreRequest> getChoreById(@PathVariable Long id) {
        return choreService.getChoreById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<ChoreRequest> createChore(@Valid @RequestBody CreateChoreDto dto) {
        ChoreRequest created = choreService.createChore(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PostMapping("/{id}/vote")
    public ResponseEntity<ChoreRequest> vote(
            @PathVariable Long id,
            @RequestParam(required = false, defaultValue = "false") boolean unvote) {
        return ResponseEntity.ok(choreService.vote(id, unvote));
    }

    @PostMapping("/{id}/pledge")
    public ResponseEntity<ChoreRequest> pledge(
            @PathVariable Long id,
            @Valid @RequestBody PledgeDto dto) {
        return ResponseEntity.ok(choreService.pledge(id, dto));
    }

    @PostMapping("/{id}/comments")
    public ResponseEntity<Comment> addComment(
            @PathVariable Long id,
            @Valid @RequestBody CommentDto dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(choreService.addComment(id, dto));
    }

    @GetMapping("/leaderboard")
    public ResponseEntity<List<ChoreRequest>> getLeaderboard() {
        return ResponseEntity.ok(choreService.getLeaderboard());
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsDto> getStats() {
        return ResponseEntity.ok(choreService.getStats());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}
