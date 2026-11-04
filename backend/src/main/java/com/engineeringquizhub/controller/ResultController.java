package com.engineeringquizhub.controller;

import com.google.cloud.firestore.DocumentSnapshot;
import com.google.cloud.firestore.Firestore;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/results")
public class ResultController {

    private final Firestore firestore;

    public ResultController(Firestore firestore) {
        this.firestore = firestore;
    }

    @GetMapping("/me")
    public ResponseEntity<?> getMyResults(
            HttpServletRequest request) throws Exception {

        Object uidAttribute = request.getAttribute("uid");

        if (!(uidAttribute instanceof String uid) || uid.isBlank()) {
            return ResponseEntity.status(401)
                    .body(Map.of("error", "Authentication required"));
        }

        List<Map<String, Object>> results = new ArrayList<>();

        var documents = firestore.collection("quizResults")
                .whereEqualTo("uid", uid)
                .get()
                .get()
                .getDocuments();

        for (DocumentSnapshot document : documents) {

            Map<String, Object> result =
                    new HashMap<>(document.getData());

            result.put("resultId", document.getId());

            results.add(result);
        }

        results.sort(
                Comparator.comparing(
                        result -> String.valueOf(
                                result.getOrDefault("submittedAt", "")
                        ),
                        Comparator.reverseOrder()
                )
        );

        return ResponseEntity.ok(results);
    }
}