const ioClient = require("socket.io-client");

// Adjust the URL/port to match the signaling server in development
const SIGNALING_URL = process.env.SIGNALING_URL || "http://localhost:3001";

// increase default timeout for integration tests
jest.setTimeout(20000);

let server;

beforeAll(() => {
  // start server programmatically for tests
  const createServer = require("../server");
  const started = createServer(3001);
  server = started;
});

afterAll((done) => {
  // attempt to close server if it exposes close
  if (server && server.close) {
    server.close(done);
  } else if (server && server.httpServer && server.httpServer.close) {
    server.httpServer.close(done);
  } else {
    // give sockets time to disconnect
    setTimeout(done, 200);
  }
});

test("forwards signal messages (SDP/ICE) between peers", (done) => {
  const opts = {
    transports: ["websocket"],
    forceNew: true,
    reconnection: false,
  };

  const alice = ioClient.connect(SIGNALING_URL, opts);
  const bob = ioClient.connect(SIGNALING_URL, opts);

  let aliceId;
  let bobId;

  // wait for both to connect
  alice.on("connect", () => {
    aliceId = alice.id;
    if (bob.connected) startFlow();
  });

  bob.on("connect", () => {
    bobId = bob.id;
    if (alice.connected) startFlow();
  });

  function startFlow() {
    // Alice will send a 'signal' targeted at Bob
    const sdpOffer = { type: "offer", sdp: "fake-sdp-offer" };

    // Bob listens for incoming 'signal' events
    bob.on("signal", (payload) => {
      try {
        expect(payload).toBeDefined();
        expect(payload.signal).toBeDefined();
        expect(payload.signal.type).toBe("offer");
        expect(payload.from).toBe(aliceId);
        cleanup();
        done();
      } catch (err) {
        cleanup();
        done(err);
      }
    });

    // Send signal from Alice to Bob
    // The signaling server implementation expects a `to` field with destination socket id
    alice.emit("signal", { to: bobId, signal: sdpOffer });
  }

  function cleanup() {
    if (alice.connected) alice.disconnect();
    if (bob.connected) bob.disconnect();
  }
});
