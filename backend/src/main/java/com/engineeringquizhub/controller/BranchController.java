package com.engineeringquizhub.controller;

import com.google.cloud.firestore.Firestore;
import com.google.cloud.firestore.QueryDocumentSnapshot;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final Firestore firestore;

    public BranchController(Firestore firestore) {
        this.firestore = firestore;
    }

    @GetMapping
    public List<Map<String, Object>> getBranches() throws Exception {

        List<QueryDocumentSnapshot> documents =
                firestore.collection("branches")
                        .get()
                        .get()
                        .getDocuments();

        List<Map<String, Object>> branches = new ArrayList<>();

        for (QueryDocumentSnapshot document : documents) {

            if (Boolean.FALSE.equals(document.getBoolean("active"))) {
                continue;
            }

            Map<String, Object> branch = new HashMap<>();

            branch.put("id", document.getId());
            branch.put("code", document.getString("code"));
            branch.put("name", document.getString("name"));

            branches.add(branch);
        }

        branches.sort(
                Comparator.comparing(
                        branch -> String.valueOf(branch.get("code"))
                )
        );

        return branches;
    }
}