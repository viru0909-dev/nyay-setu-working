import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import LiveHearing from "../LiveHearing";
import * as judgeAPI from "../../../services/api.js";
import { BrowserRouter } from "react-router-dom";

// Mock the judgeAPI used by LiveHearing
vi.mock("../../../services/api.js", async () => {
  const actual = await vi.importActual("../../../services/api.js");
  return {
    ...actual,
    judgeAPI: {
      ...actual.judgeAPI,
      getTodaysHearings: vi.fn(),
    },
  };
});

describe("LiveHearing component", () => {
  const hearingId = "123e4567-e89b-12d3-a456-426614174000";
  const videoRoomId = "hearing-abc123def456";
  const caseId = "123e4567-e89b-12d3-a456-426614174001";

  const hearingData = {
    id: hearingId,
    caseEntity: {
      id: caseId,
      title: "Test Case",
    },
    scheduledDate: new Date(Date.now() + 5 * 60 * 1000).toISOString(), // 5 minutes from now
    durationMinutes: 30,
    videoRoomId: videoRoomId,
    status: "SCHEDULED",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the getTodaysHearings to return our hearing data
    judgeAPI.judgeAPI.getTodaysHearings.mockResolvedValue({
      data: [hearingData],
    });
  });

  test("displays hearing list and allows joining a hearing", async () => {
    render(
      <BrowserRouter>
        <LiveHearing />
      </BrowserRouter>,
    );

    // Wait for the hearings to load
    await act(async () => {
      return Promise.resolve();
    });

    // Should see the hearing in the list
    expect(screen.getByText(/Test Case/i)).toBeTruthy();

    // Get the join button for the hearing
    const joinButton = screen.getByRole("button", { name: /start session/i });
    expect(joinButton).toBeDefined();

    // Simulate clicking the join button
    fireEvent.click(joinButton);

    // Wait for the active hearing to be set
    await act(async () => {
      return Promise.resolve();
    });

    // Now we should see the video call view
    // Check that the iframe is present and has the correct src
    const iframe = screen.getByTitle(/NyaySetu Court Hearing/i);
    expect(iframe).toBeTruthy();

    // The iframe src should contain the videoRoomId
    expect(iframe.src).toContain(videoRoomId);

    // Also check that the fallback is not used
    expect(iframe.src).not.toContain(`nyaysetu-court-${hearingId}`);
  });

  test("falls back to default roomId when videoRoomId is missing", async () => {
    const hearingDataNoVideoRoomId = {
      ...hearingData,
      videoRoomId: null, // or undefined, but we'll set to null
    };

    judgeAPI.judgeAPI.getTodaysHearings.mockResolvedValue({
      data: [hearingDataNoVideoRoomId],
    });

    render(
      <BrowserRouter>
        <LiveHearing />
      </BrowserRouter>,
    );

    await act(async () => {
      return Promise.resolve();
    });

    const joinButton = screen.getByRole("button", { name: /start session/i });
    fireEvent.click(joinButton);

    await act(async () => {
      return Promise.resolve();
    });

    const iframe = screen.getByTitle(/NyaySetu Court Hearing/i);
    expect(iframe).toBeTruthy();

    // Now the src should contain the fallback: nyaysetu-court-{hearingId}
    expect(iframe.src).toContain(`nyaysetu-court-${hearingId}`);
    // And not contain the videoRoomId (which is null)
    expect(iframe.src).not.toContain("hearing-");
  });
});
