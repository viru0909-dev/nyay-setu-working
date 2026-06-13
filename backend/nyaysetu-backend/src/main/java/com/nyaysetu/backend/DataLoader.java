package com.nyaysetu.backend;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.context.annotation.Profile;
@Slf4j
@Component
@Profile("!prod")
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {
        // Update passwords if users exist, create if they don't
        updateOrCreate("admin@nyay.com", "Admin", "admin123", Role.ADMIN);
        updateOrCreate("judge@nyay.com", "Judge X", "password", Role.JUDGE);
        updateOrCreate("lawyer@nyay.com", "Lawyer Y", "password", Role.LAWYER);
        updateOrCreate("litigant@nyay.com", "Litigant Z", "password", Role.LITIGANT);
        updateOrCreate("client@nyay.com", "Client User", "password", Role.LITIGANT);
        updateOrCreate("tech@nyay.com", "Tech Admin", "tech123", Role.TECH_ADMIN);
        updateOrCreate("police@nyay.com", "Officer P", "password", Role.POLICE);
    }

    private void updateOrCreate(String email, String name, String pass, Role role) {
        var optionalUser = userRepository.findByEmail(email);

        if (optionalUser.isPresent()) {
            User user = optionalUser.get();

            // DO NOT overwrite password if already set
            if (user.getPassword() == null || user.getPassword().isBlank()) {
                user.setPassword(encoder.encode(pass));
                userRepository.save(user);
                log.debug("Password initialized for existing user: {}", email);
            } else {
                log.debug("User exists, not modifying password: {}", email);
            }

        } else {
            User u = User.builder()
                    .email(email)
                    .name(name)
                    .password(encoder.encode(pass))
                    .role(role)
                    .build();

            userRepository.save(u);
            log.info("New user created: {}", email);
        }
    }
}