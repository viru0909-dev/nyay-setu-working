package com.nyaysetu.backend;

import com.nyaysetu.backend.entity.Role;
import com.nyaysetu.backend.entity.User;
import com.nyaysetu.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder encoder;

    @Override
    public void run(String... args) throws Exception {

        createIfMissing("admin@nyay.com", "Admin", "admin123", Role.ADMIN);
        createIfMissing("judge@nyay.com", "Judge X", "password", Role.JUDGE);
        createIfMissing("lawyer@nyay.com", "Lawyer Y", "password", Role.LAWYER);
        createIfMissing("litigant@nyay.com", "Litigant Z", "password", Role.LITIGANT);
        createIfMissing("client@nyay.com", "Client User", "password", Role.LITIGANT);
        createIfMissing("tech@nyay.com", "Tech Admin", "tech123", Role.TECH_ADMIN);
        createIfMissing("police@nyay.com", "Officer P", "password", Role.POLICE);
    }

    private void createIfMissing(String email, String name, String pass, Role role) {
        if (userRepository.findByEmail(email).isEmpty()) {
            User u = User.builder()
                    .email(email)
                    .name(name)
                    .password(encoder.encode(pass))
                    .role(role)
                    .build();
            userRepository.save(u);

            System.out.println("Created user: " + email + " | role = " + role);
        }
    }
}