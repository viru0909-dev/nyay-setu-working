package com.nyaysetu.backend.filter;

import com.nyaysetu.backend.ledger.gateway.FabricGatewayService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Set;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Servlet filter that intercepts all GET (read/view) requests to evidence
 * endpoints and generates an immutable audit log entry via the Hyperledger
 * Fabric chaincode {@code grantAccessAudit()} hook.
 * <p>
 * This filter specifically targets users with {@code JUDGE} and {@code LAWYER}
 * roles, ensuring that every evidence view operation by these privileged
 * actors creates an unalterable trace in the distributed ledger.
 * <p>
 * The audit logging is performed asynchronously (fire-and-forget) via a
 * dedicated thread pool to avoid adding latency to the response.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class EvidenceReadAuditFilter extends OncePerRequestFilter {

    private final FabricGatewayService fabricGatewayService;

    /** Roles that trigger read audit logging */
    private static final Set<String> AUDITED_ROLES = Set.of(
            "ROLE_JUDGE", "ROLE_SUPER_JUDGE", "ROLE_LAWYER"
    );

    /** URL patterns that trigger audit logging */
    private static final Pattern EVIDENCE_PATH_PATTERN = Pattern.compile(
            "^/(evidence|api/v1/ledger/evidence)/([a-fA-F0-9-]+)(/.*)?$"
    );

    /** Dedicated thread pool for async audit logging (non-blocking) */
    private final ExecutorService auditExecutor = Executors.newFixedThreadPool(2, r -> {
        Thread t = new Thread(r, "evidence-read-audit");
        t.setDaemon(true);
        return t;
    });

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                     HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {

        // Only intercept GET requests (read/view operations)
        if (!"GET".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String path = request.getRequestURI();
        Matcher matcher = EVIDENCE_PATH_PATTERN.matcher(path);

        if (!matcher.matches()) {
            filterChain.doFilter(request, response);
            return;
        }

        // Extract evidence ID from the URL path
        String evidenceId = matcher.group(2);

        // Get current authenticated user
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            String username = auth.getName();
            String role = extractRole(auth);

            // Only audit privileged roles
            if (isAuditedRole(auth)) {
                String accessType = resolveAccessType(path);

                // Fire-and-forget: log audit asynchronously
                auditExecutor.submit(() -> {
                    try {
                        fabricGatewayService.logAccessAudit(
                                evidenceId, username, role, accessType
                        );
                        log.info("[ReadAudit] Logged {} access by {} ({}) on evidence {}",
                                accessType, username, role, evidenceId);
                    } catch (Exception e) {
                        log.error("[ReadAudit] Failed to log audit for evidence {} by {}",
                                evidenceId, username, e);
                    }
                });
            }
        }

        // Continue the filter chain — never block the response
        filterChain.doFilter(request, response);
    }

    /**
     * Only apply this filter to evidence-related paths.
     */
    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return !path.startsWith("/evidence") && !path.startsWith("/api/v1/ledger/evidence");
    }

    /**
     * Extract the primary role from the authentication object.
     */
    private String extractRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .filter(a -> a.startsWith("ROLE_"))
                .findFirst()
                .map(a -> a.replace("ROLE_", ""))
                .orElse("UNKNOWN");
    }

    /**
     * Check if the authentication has any of the audited roles.
     */
    private boolean isAuditedRole(Authentication auth) {
        return auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .anyMatch(AUDITED_ROLES::contains);
    }

    /**
     * Determine the access type based on the URL path.
     */
    private String resolveAccessType(String path) {
        if (path.contains("/verify")) return "VERIFY";
        if (path.contains("/certificate")) return "DOWNLOAD";
        if (path.contains("/custody-trail")) return "VIEW_CUSTODY";
        if (path.contains("/audit-log")) return "VIEW_AUDIT";
        return "READ";
    }
}
