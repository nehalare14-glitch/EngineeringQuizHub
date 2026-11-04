package com.engineeringquizhub.controller;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/quizzes")
public class QuizSubmissionController {

    private final Firestore firestore;

    public QuizSubmissionController(Firestore firestore) {
        this.firestore = firestore;
    }

    public record Answer(
            @NotBlank String questionId,
            @NotBlank String selectedOption
    ) {}

    public record Submission(
            @NotBlank String branch,
            @NotBlank String subjectId,
            @NotBlank String difficulty,
            @NotEmpty @Size(max = 100) List<@Valid Answer> answers
    ) {}

    @PostMapping("/submit")
    public ResponseEntity<?> submit(
            @Valid @RequestBody Submission submission,
            HttpServletRequest request
    ) throws Exception {

        Object uidAttribute = request.getAttribute("uid");

        if (!(uidAttribute instanceof String uid) || uid.isBlank()) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication required"));
        }

        String branch = submission.branch().trim()
                .toUpperCase(Locale.ROOT);
        String subjectId = submission.subjectId().trim()
                .toUpperCase(Locale.ROOT);
        String difficulty = submission.difficulty().trim()
                .toUpperCase(Locale.ROOT);

        if (!List.of("EASY", "MEDIUM", "HARD").contains(difficulty)
                || !branch.matches("[A-Z0-9_]+")
                || !subjectId.matches("[A-Z0-9_]+")
                || !subjectId.startsWith(branch + "_")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid quiz selection"));
        }

        Set<String> seen = new HashSet<>();
        int correct = 0;
        List<Map<String, Object>> review = new ArrayList<>();

        for (Answer answer : submission.answers()) {
            String questionId = answer.questionId().trim();
            String selected = answer.selectedOption().trim()
                    .toUpperCase(Locale.ROOT);

            if (!seen.add(questionId)
                    || !List.of("A", "B", "C", "D").contains(selected)) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid or duplicate answer"));
            }

            DocumentSnapshot question = firestore
                    .collection("questions")
                    .document(questionId)
                    .get()
                    .get();

            if (!question.exists()
                    || !branch.equals(question.getString("branchCode"))
                    || !subjectId.equals(question.getString("subjectId"))
                    || !difficulty.equals(question.getString("difficulty"))
                    || Boolean.FALSE.equals(question.getBoolean("active"))) {
                return ResponseEntity.badRequest()
                        .body(Map.of("error", "Invalid question in submission"));
            }

            String correctOption = question.getString("correctOption");
            if (correctOption == null || !List.of("A", "B", "C", "D").contains(correctOption)) {
                return ResponseEntity.status(500)
                        .body(Map.of("error", "Question answer key is missing"));
            }

            boolean isCorrect = selected.equals(correctOption);
            if (isCorrect) correct++;

            Map<String, Object> item = new LinkedHashMap<>();
            item.put("questionId", questionId);
            item.put("questionText", Objects.toString(question.getString("questionText"), ""));
            Object options = question.get("options");
            item.put("options", options instanceof Map ? options : Map.of());
            item.put("selectedOption", selected);
            item.put("correctOption", correctOption);
            item.put("isCorrect", isCorrect);
            item.put("explanation", Objects.toString(question.getString("explanation"), ""));
            review.add(item);
        }

        int total = submission.answers().size();
        double percentage = Math.round(correct * 10000.0 / total) / 100.0;

        Map<String, Object> result = new HashMap<>();
        result.put("uid", uid);
        result.put("branch", branch);
        result.put("subjectId", subjectId);
        result.put("difficulty", difficulty);
        result.put("correctAnswers", correct);
        result.put("totalQuestions", total);
        result.put("percentage", percentage);
        result.put("review", review);
        result.put("submittedAt", Instant.now().toString());

        var saved = firestore.collection("quizResults")
                .add(result).get();

        return ResponseEntity.ok(Map.of(
                "resultId", saved.getId(),
                "correctAnswers", correct,
                "totalQuestions", total,
                "percentage", percentage,
                "review", review
        ));
    }
}
