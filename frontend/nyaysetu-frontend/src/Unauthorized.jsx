import React from "react";
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", padding: "3rem" }}>
      <h1>Unauthorized</h1>
      <p>You don't have permission to access this page.</p>

      <button
        onClick={() => navigate("/")}
        style={{
          marginTop: "1rem",
          padding: "10px 20px",
          cursor: "pointer"
        }}
      >
        Go Home
      </button>
    </div>
  );
};

export default Unauthorized;