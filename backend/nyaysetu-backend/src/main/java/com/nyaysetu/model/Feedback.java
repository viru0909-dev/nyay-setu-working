package com.nyaysetu.model;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity @Table(name = "feedback")
public class Feedback {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    private String name;
    private String email;
    private String category;
    private Integer rating;
    @Column(columnDefinition = "TEXT") private String message;
    private LocalDateTime submittedAt;

    @PrePersist protected void onCreate() { submittedAt = LocalDateTime.now(); }

    public Long getId() { return id; }
    public String getName() { return name; } public void setName(String n) { this.name = n; }
    public String getEmail() { return email; } public void setEmail(String e) { this.email = e; }
    public String getCategory() { return category; } public void setCategory(String c) { this.category = c; }
    public Integer getRating() { return rating; } public void setRating(Integer r) { this.rating = r; }
    public String getMessage() { return message; } public void setMessage(String m) { this.message = m; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
}
