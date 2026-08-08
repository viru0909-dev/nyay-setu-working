package com.nyaysetu.dto;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class FeedbackRequest {
    private String name;
    @Email(message = "Invalid email format") private String email;
    @NotBlank(message = "Category is required") private String category;
    private Integer rating;
    @NotBlank(message = "Feedback message is required") @Size(max = 2000) private String message;

    public String getName() { return name; } public void setName(String n) { this.name = n; }
    public String getEmail() { return email; } public void setEmail(String e) { this.email = e; }
    public String getCategory() { return category; } public void setCategory(String c) { this.category = c; }
    public Integer getRating() { return rating; } public void setRating(Integer r) { this.rating = r; }
    public String getMessage() { return message; } public void setMessage(String m) { this.message = m; }
}
