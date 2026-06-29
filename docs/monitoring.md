# Monitoring

Nyay Setu exposes Spring Boot Actuator metrics for Prometheus at:

```text
http://localhost:8080/actuator/prometheus
```

The monitoring stack is intentionally separate from the main application compose file so it can be started only when needed.

## Start The Stack

Start the app services first:

```bash
docker compose up -d db backend-spring
```

Then start Prometheus and Grafana on the same Docker network:

```bash
docker compose -f docker-compose.monitoring.yml up -d
```

Prometheus is available at `http://localhost:9090`.
Grafana is available at `http://localhost:3001`.

Default Grafana credentials are `admin` / `admin`. Override them with:

```bash
GRAFANA_ADMIN_USER=admin GRAFANA_ADMIN_PASSWORD=strong-password docker compose -f docker-compose.monitoring.yml up -d
```

## What Is Provisioned

- Prometheus scrapes `spring-service:8080/actuator/prometheus`.
- Grafana auto-loads the Prometheus datasource.
- Grafana auto-loads the `NyaySetu Backend Monitoring` dashboard with request rate, p95 latency, JVM heap usage, and scrape health panels.

## Troubleshooting

If Prometheus shows the backend target as down, confirm the main stack is running and the `app-network` Docker network exists:

```bash
docker compose ps
docker network ls | grep app-network
```
