package com.example;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.*;

@SpringBootApplication
@RestController
public class Application {

    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }

    @GetMapping("/")
    public String home() {
        return "Hello! Backend is running!";
    }

    @GetMapping("/api/status")
    public Status getStatus() {
        return new Status("success", "Backend is working!");
    }

    static class Status {
        public String status;
        public String message;

        public Status(String status, String message) {
            this.status = status;
            this.message = message;
        }
    }
}
