package com.engineeringquizhub.controller;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/quizzes")
public class QuizController {

    private final Firestore firestore;

    public QuizController(Firestore firestore) {
        this.firestore = firestore;
    }

    @GetMapping("/questions")
    public ResponseEntity<?> getQuestions(
            @RequestParam String branch,
            @RequestParam String subjectId,
            @RequestParam String difficulty
    ) throws Exception {

        branch = branch.trim().toUpperCase(java.util.Locale.ROOT);
        subjectId = subjectId.trim().toUpperCase(java.util.Locale.ROOT);
        difficulty = difficulty.trim().toUpperCase(java.util.Locale.ROOT);

        if (!List.of("EASY", "MEDIUM", "HARD").contains(difficulty)) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid difficulty"));
        }

        if (!branch.matches("[A-Z0-9_]+")
                || !subjectId.matches("[A-Z0-9_]+")
                || !subjectId.startsWith(branch + "_")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("error", "Invalid branch or subject"));
        }

        List<Map<String, Object>> questions = new ArrayList<>();

        var documents = firestore.collection("questions")
                .whereEqualTo("subjectId", subjectId)
                .get()
                .get()
                .getDocuments();

        for (DocumentSnapshot document : documents) {

            String questionBranch = document.getString("branchCode");
            String questionDifficulty = document.getString("difficulty");

            if (!branch.equals(questionBranch)
                    || !difficulty.equals(questionDifficulty)
                    || Boolean.FALSE.equals(document.getBoolean("active"))) {
                continue;
            }

            questions.add(Map.of(
                    "id", document.getId(),
                    "questionText", document.getString("questionText"),
                    "difficulty", questionDifficulty,
                    "options", document.get("options")
            ));
        }

        return ResponseEntity.ok(questions);
    }
}