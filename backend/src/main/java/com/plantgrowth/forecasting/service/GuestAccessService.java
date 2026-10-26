package com.plantgrowth.forecasting.service;

import com.plantgrowth.forecasting.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

/** Keeps the shared guest account genuinely read-only on the server. */
@Service
public class GuestAccessService {
    private final UserRepository users;
    private final String guestEmail;

    public GuestAccessService(UserRepository users, @Value("${app.guest-email:guest@verdant.local}") String guestEmail) {
        this.users = users;
        this.guestEmail = guestEmail.toLowerCase();
    }

    public void requireWritable(Long userId) {
        if (userId != null && userId == 0L) {
            throw new AccessDeniedException("Guest access is read-only. Register or log in to change data.");
        }
        if (users.findById(userId).map(user -> guestEmail.equalsIgnoreCase(user.getEmail())).orElse(false)) {
            throw new AccessDeniedException("Guest access is read-only. Register or log in to change data.");
        }
    }
}
