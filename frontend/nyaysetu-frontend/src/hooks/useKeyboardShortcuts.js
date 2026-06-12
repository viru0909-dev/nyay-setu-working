import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

export default function useKeyboardShortcuts({
  user,
  onOpenHelp,
  onCloseHelp,
}) {
  const navigate = useNavigate();
  const keyBuffer = useRef([]);

  useEffect(() => {
    const handler = (e) => {
      const active = document.activeElement;

      const isTyping =
        active &&
        (
          ["INPUT", "TEXTAREA", "SELECT"].includes(active.tagName) ||
          active.isContentEditable
        );

      if (isTyping) return;

      // Open shortcuts modal
      if (
        e.key === "?" ||
        (e.shiftKey && e.key === "/")
      ) {
        e.preventDefault();
        onOpenHelp();
        return;
      }

      // Close modal
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseHelp();
        keyBuffer.current = [];
        return;
      }

      const openAssistant = () => {
        if (!user?.role) {
          navigate("/");
          return;
        }

        switch (user.role) {
          case "LAWYER":
            navigate("/lawyer/ai-assistant");
            break;

          case "LITIGANT":
            navigate("/litigant/vakil-friend");
            break;

          default:
            navigate("/");
        }
      };

      // Quick assistant
      if (e.key === "/") {
        e.preventDefault();
        openAssistant();
        return;
      }

      keyBuffer.current.push(e.key.toLowerCase());

      if (keyBuffer.current.length > 2) {
        keyBuffer.current.shift();
      }

      const combo = keyBuffer.current.join("");

      if (combo === "gh") {
        navigate("/");
        keyBuffer.current = [];
      }

      if (combo === "gc") {
        openAssistant();
        keyBuffer.current = [];
      }
    };

    window.addEventListener("keydown", handler);

    return () => {
      window.removeEventListener("keydown", handler);
    };
  }, [navigate, user, onOpenHelp, onCloseHelp]);
}