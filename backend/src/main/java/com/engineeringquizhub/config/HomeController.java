package com.engineeringquizhub.config;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
            "application", "EngineeringQuizHub",
            "status", "running",
            "message", "Backend API is running successfully"
        );
    }
}
