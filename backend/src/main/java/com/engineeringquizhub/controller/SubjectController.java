package com.engineeringquizhub.controller;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/subjects")
public class SubjectController {

    private final Firestore firestore;

    public SubjectController(Firestore firestore) {
        this.firestore = firestore;
    }

    @GetMapping
    public List<Map<String, Object>> getSubjects(
            @RequestParam String branch) throws Exception {

        String branchCode = branch.trim()
                .toUpperCase(Locale.ROOT);

        List<QueryDocumentSnapshot> documents = firestore
                .collection("subjects")
                .whereEqualTo("branchCode", branchCode)
                .get()
                .get()
                .getDocuments();

        List<Map<String, Object>> subjects = new ArrayList<>();

        for (QueryDocumentSnapshot document : documents) {

            if (Boolean.FALSE.equals(document.getBoolean("active"))) {
                continue;
            }

            String name = document.getString("name");

            if (name == null || name.isBlank()) {
                System.err.println(
                    "Skipping subject with missing name: "
                    + document.getId()
                );
                continue;
            }

            Map<String, Object> subject = new HashMap<>();

            subject.put("id", document.getId());
            subject.put("branchCode", branchCode);
            subject.put("name", name);

            subjects.add(subject);
        }

        subjects.sort(Comparator.comparing(
                subject -> String.valueOf(subject.get("name"))
        ));

        return subjects;
    }
}