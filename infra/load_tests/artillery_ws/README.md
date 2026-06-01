Artillery WebSocket load test for Nyay-Setu backend

Overview

- Artillery script to simulate WebSocket clients and broadcast latency measurement.
- Designed for distributed runs to reach 10,000 concurrent connections.

Prerequisites

- Node.js (18+)
- Install Artillery:

```bash
npm install -g artillery artillery-engine-ws
```

Files

- `ws-test.yml` - Artillery scenario for WebSocket connect, send ping, measure RTT.

Running locally (single machine limitations)

- A single machine may not support 10k connections. Use distributed mode across multiple machines.

Distributed run (recommended)

1. Install Artillery on N machines.
2. Split target connections per machine, e.g., 5 machines x 2000 connections = 10,000.
3. On each machine run:

```bash
artillery run ws-test.yml -o report-$(hostname).json --overrides '{"config":{"phases":[{"duration":600,"arrivalRate":2000}]}}'
```

Measuring memory and latency

- Memory: use `jcmd PID GC.heap_info`, `top`, `htop`, or `docker stats` if containerized. For Java process, `jmap -heap PID` and `jstat -gc PID 1000` are useful.
- Latency: Artillery report contains RTT statistics; also capture server-side timestamps in messages for end-to-end latency.

Notes

- For JMeter WebSocket testing, see `ws-jmeter/` (not included). Artillery is lighter-weight and simpler for WebSocket floods.
