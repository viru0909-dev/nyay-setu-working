package com.nyaysetu.backend;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.entity.LawyerProfile;
import com.nyaysetu.backend.entity.ConsultationSlot;
import com.nyaysetu.backend.repository.UserRepository;
import com.nyaysetu.backend.repository.LawyerProfileRepository;
import com.nyaysetu.backend.repository.ConsultationSlotRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;
    private final LawyerProfileRepository lawyerProfileRepository;
    private final ConsultationSlotRepository consultationSlotRepository;

    @Override
    public void run(String... args) throws Exception {
        // Update passwords if users exist, create if they don't
        updateOrCreate("admin@nyay.com", "Admin", "admin123", Role.ADMIN);
        updateOrCreate("judge@nyay.com", "Judge X", "password", Role.JUDGE);
        updateOrCreate("litigant@nyay.com", "Litigant Z", "password", Role.LITIGANT);
        updateOrCreate("client@nyay.com", "Client User", "password", Role.LITIGANT);
        updateOrCreate("tech@nyay.com", "Tech Admin", "tech123", Role.TECH_ADMIN);
        updateOrCreate("police@nyay.com", "Officer P", "password", Role.POLICE);

        // Create lawyers and profiles
        User rKumar = updateOrCreate("lawyer@nyay.com", "Adv. Rajesh Kumar", "password", Role.LAWYER);
        seedLawyerProfile(rKumar, "Criminal Law & Civil Litigation specialist with 8+ years of court experience.", 8, 1500.0, List.of("Criminal Law", "Civil Law"), 4.8, 120);

        User pSharma = updateOrCreate("priya@nyay.com", "Adv. Priya Sharma", "password", Role.LAWYER);
        seedLawyerProfile(pSharma, "Family law advisor helping clients navigate divorce, custody, and property disputes.", 5, 1200.0, List.of("Family Law"), 4.6, 85);

        User sMehta = updateOrCreate("suresh@nyay.com", "Adv. Suresh Mehta", "password", Role.LAWYER);
        seedLawyerProfile(sMehta, "Corporate compliance expert advising startups and enterprises on legal contracts and intellectual property.", 12, 2500.0, List.of("Corporate Law"), 4.9, 200);
    }

    private User updateOrCreate(String email, String name, String pass, Role role) {
        var optionalUser = userRepository.findByEmail(email);
        User user;
        if (optionalUser.isPresent()) {
            // User exists - UPDATE password
            user = optionalUser.get();
            user.setPassword(encoder.encode(pass));
            user = userRepository.save(user);
            log.info("User already exists, password updated: {}", email);
        } else {
            // User doesn't exist - CREATE
            user = User.builder()
                    .email(email)
                    .name(name)
                    .password(encoder.encode(pass))
                    .role(role)
                    .build();
            user = userRepository.save(user);
            log.info("New user created: {}", email);
        }
        return user;
    }

    private void seedLawyerProfile(User user, String bio, int experience, double rate, List<String> specializations, double rating, int totalRatings) {
        var optionalProfile = lawyerProfileRepository.findByUserId(user.getId());
        if (optionalProfile.isEmpty()) {
            LawyerProfile profile = LawyerProfile.builder()
                    .user(user)
                    .bio(bio)
                    .yearsOfExperience(experience)
                    .hourlyRate(rate)
                    .specializations(specializations)
                    .averageRating(rating)
                    .totalRatings(totalRatings)
                    .verified(true)
                    .active(true)
                    .profileImageUrl("https://api.dicebear.com/7.x/adventurer/svg?seed=" + user.getName().replace(" ", ""))
                    .build();
            profile = lawyerProfileRepository.save(profile);
            log.info("Seeded lawyer profile for: {}", user.getEmail());

            // Seed some availability slots for the next 7 days
            LocalDateTime now = LocalDateTime.now().withMinute(0).withSecond(0).withNano(0);
            for (int i = 1; i <= 7; i++) {
                // Seed 2 slots per day: 10:00 AM and 2:00 PM
                LocalDateTime slot1 = now.plusDays(i).withHour(10);
                LocalDateTime slot2 = now.plusDays(i).withHour(14);

                consultationSlotRepository.save(ConsultationSlot.builder()
                        .lawyer(profile)
                        .startTime(slot1)
                        .endTime(slot1.plusHours(1))
                        .status(ConsultationSlot.SlotStatus.AVAILABLE)
                        .createdAt(System.currentTimeMillis())
                        .updatedAt(System.currentTimeMillis())
                        .build());

                consultationSlotRepository.save(ConsultationSlot.builder()
                        .lawyer(profile)
                        .startTime(slot2)
                        .endTime(slot2.plusHours(1))
                        .status(ConsultationSlot.SlotStatus.AVAILABLE)
                        .createdAt(System.currentTimeMillis())
                        .updatedAt(System.currentTimeMillis())
                        .build());
            }
        }
    }
}