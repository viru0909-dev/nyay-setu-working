const { io } = require("socket.io-client");

const SERVER_URL = process.env.SIGNALING_SERVER_URL || "http://localhost:3001";
const dummyJwt = "dummy.jwt.token";

function connectClient() {
  return io(SERVER_URL, {
    transports: ["websocket"],
    forceNew: true,
    timeout: 3000,
    auth: { token: dummyJwt },
  });
}

describe("WebRTC signaling relay (Judge <-> Lawyer)", () => {
  const roomId = "hearing-room-1";

  test("forwards SDP offer and ICE candidates from Judge to Lawyer", (done) => {
    const judge = connectClient();
    const lawyer = connectClient();

    const offerSDP = "v=0\no=- 0 0 IN IP4 127.0.0.1\ns=offer\n";
    const iceCandidate = {
      candidate: "candidate1 1 udp 2122252543 192.0.2.1 54400 typ host",
      sdpMid: "0",
      sdpMLineIndex: 0,
    };

    let lawyerId;
    let gotOffer = false;
    let gotIce = false;

    const timeout = setTimeout(() => {
      cleanup();
      done(new Error("Timed out waiting for forwarded offer + ICE"));
    }, 5000);

    function cleanup() {
      clearTimeout(timeout);
      judge.removeAllListeners();
      lawyer.removeAllListeners();
      judge.disconnect();
      lawyer.disconnect();
    }

    const maybeDone = () => {
      if (gotOffer && gotIce) {
        cleanup();
        done();
      }
    };

    lawyer.on("connect", () => {
      lawyer.emit("join-room", roomId, 2, "Lawyer");
      lawyerId = lawyer.id;

      // Ensure listener is attached before judge sends signals.
      // (join-room doesn't affect signaling, but this prevents race in CI)

      lawyer.on("signal", (payload) => {
        try {
          expect(payload).toHaveProperty("signal");
          const sig = payload.signal;

          if (sig && sig.type === "offer") {
            expect(sig.sdp).toBe(offerSDP);
            gotOffer = true;
          } else {
            expect(sig).toEqual(iceCandidate);
            gotIce = true;
          }
          maybeDone();
        } catch (e) {
          cleanup();
          done(e);
        }
      });
    });

    judge.on("connect", () => {
      judge.emit("join-room", roomId, 1, "Judge");

      setTimeout(() => {
        judge.emit("signal", {
          to: lawyerId,
          signal: { type: "offer", sdp: offerSDP },
          userName: "Judge",
        });

        judge.emit("signal", {
          to: lawyerId,
          signal: iceCandidate,
          userName: "Judge",
        });
      }, 150);
    });
  });

  test("forwards SDP answer and ICE candidates from Lawyer to Judge", (done) => {
    const judge = connectClient();
    const lawyer = connectClient();

    const answerSDP = "v=0\no=- 0 0 IN IP4 127.0.0.1\ns=answer\n";
    const iceCandidate = {
      candidate: "candidate2 1 udp 2122252543 192.0.2.2 54401 typ host",
      sdpMid: "0",
      sdpMLineIndex: 0,
    };

    let judgeId;
    let gotAnswer = false;
    let gotIce = false;

    const timeout = setTimeout(() => {
      cleanup();
      done(new Error("Timed out waiting for forwarded answer + ICE"));
    }, 5000);

    function cleanup() {
      clearTimeout(timeout);
      judge.removeAllListeners();
      lawyer.removeAllListeners();
      judge.disconnect();
      lawyer.disconnect();
    }

    const maybeDone = () => {
      if (gotAnswer && gotIce) {
        cleanup();
        done();
      }
    };

    judge.on("connect", () => {
      judgeId = judge.id;
      judge.emit("join-room", roomId, 1, "Judge");

      judge.on("signal", (payload) => {
        try {
          expect(payload).toHaveProperty("signal");
          const sig = payload.signal;

          if (sig && sig.type === "answer") {
            expect(sig.sdp).toBe(answerSDP);
            gotAnswer = true;
          } else {
            expect(sig).toEqual(iceCandidate);
            gotIce = true;
          }
          maybeDone();
        } catch (e) {
          cleanup();
          done(e);
        }
      });
    });

    lawyer.on("connect", () => {
      lawyer.emit("join-room", roomId, 2, "Lawyer");

      setTimeout(() => {
        lawyer.emit("signal", {
          to: judgeId,
          signal: { type: "answer", sdp: answerSDP },
          userName: "Lawyer",
        });

        lawyer.emit("signal", {
          to: judgeId,
          signal: iceCandidate,
          userName: "Lawyer",
        });
      }, 150);
    });
  });
});
