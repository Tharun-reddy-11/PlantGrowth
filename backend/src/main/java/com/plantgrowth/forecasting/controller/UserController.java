package com.plantgrowth.forecasting.controller;

import com.plantgrowth.forecasting.dto.Contracts.UserView;
import com.plantgrowth.forecasting.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository users;
    private final String guestEmail;

    UserController(UserRepository users, @Value("${app.guest-email:guest@verdant.local}") String guestEmail) {
        this.users = users;
        this.guestEmail = guestEmail.toLowerCase();
    }

    @GetMapping("/me")
    UserView me(@AuthenticationPrincipal Long id) {
        // The guest identity is JWT-only. It is never written to MySQL.
        if (id != null && id == 0L) return new UserView(0L, "Guest explorer", guestEmail, "GUEST");
        var user = users.findById(id).orElseThrow(() -> new IllegalArgumentException("User session is no longer valid"));
        return new UserView(user.getId(), user.getFullName(), user.getEmail(), user.getRole().name());
    }
}
