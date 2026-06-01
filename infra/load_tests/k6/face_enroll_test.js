import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "1m", target: 50 },
    { duration: "3m", target: 200 },
    { duration: "2m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

// load base64 fixtures in init stage to avoid GoError (open only in init)
const IMG1 = open("./fixtures/face1.b64");
const IMG2 = open("./fixtures/face2.b64");

// configuration from environment
const API_BASE = __ENV.API_BASE || "http://localhost:8080";
const ENDPOINT = `${API_BASE}/api/FaceEnrollRequest`;
const AUTH_TOKEN = __ENV.AUTH_TOKEN || "";

export function setup() {
  // quick validation to avoid long runs against an unresolved host
  if (
    API_BASE.includes("staging-or-local") ||
    API_BASE.includes("example.com")
  ) {
    throw new Error(
      `API_BASE is set to an unresolved placeholder (${API_BASE}). Set API_BASE to a reachable URL before running.`,
    );
  }

  return { images: [IMG1, IMG2] };
}

export default function (data) {
  const imgs = data.images;
  const payload = JSON.stringify({
    userId: `test-user-${Math.floor(Math.random() * 10000)}`,
    imageBase64: imgs[Math.floor(Math.random() * imgs.length)],
    metadata: {
      device: "k6-load-tester",
      timestamp: new Date().toISOString(),
    },
  });

  const params = {
    headers: {
      "Content-Type": "application/json",
      ...(AUTH_TOKEN ? { Authorization: `Bearer ${AUTH_TOKEN}` } : {}),
    },
    timeout: "120s",
  };

  const res = http.post(ENDPOINT, payload, params);

  check(res, {
    "status is 2xx": (r) => r.status >= 200 && r.status < 300,
    "response has success true": (r) => {
      try {
        const j = r.json();
        return (
          j &&
          (j.success === true ||
            j.status === "ok" ||
            j.code === 0 ||
            j.error === undefined)
        );
      } catch (e) {
        return false;
      }
    },
  });

  sleep(1);
}
