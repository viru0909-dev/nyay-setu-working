import { useState } from "react";

const CourtFeeCalculator = () => {
  const [caseType, setCaseType] = useState("Civil");
  const [claimValue, setClaimValue] = useState("");
  const [fee, setFee] = useState(null);

  const calculateFee = () => {
    let percentage = 0;

    switch (caseType) {
      case "Civil":
        percentage = 0.05;
        break;
      case "Family":
        percentage = 0.03;
        break;
      case "Property":
        percentage = 0.07;
        break;
      default:
        percentage = 0.05;
    }

    const calculatedFee = claimValue * percentage;
    setFee(calculatedFee);
  };

  return (
    <div
      style={{
        maxWidth: "420px",
        margin: "40px auto",
        padding: "24px",
        borderRadius: "16px",
        background: "#ffffff",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <h2 style={{ marginBottom: "20px", textAlign: "center" }}>
        Court Fee Calculator
      </h2>

      <label>Case Type</label>
      <select
        value={caseType}
        onChange={(e) => setCaseType(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "8px",
          marginBottom: "20px",
        }}
      >
        <option>Civil</option>
        <option>Family</option>
        <option>Property</option>
      </select>

      <label>Claim Value (₹)</label>
      <input
        type="number"
        placeholder="Enter dispute amount"
        value={claimValue}
        onChange={(e) => setClaimValue(e.target.value)}
        style={{
          width: "100%",
          padding: "10px",
          marginTop: "8px",
          marginBottom: "20px",
        }}
      />

      <button
        onClick={calculateFee}
        style={{
          width: "100%",
          padding: "12px",
          border: "none",
          borderRadius: "8px",
          background: "#2563eb",
          color: "#fff",
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Calculate Fee
      </button>

      {fee !== null && (
        <div
          style={{
            marginTop: "20px",
            padding: "16px",
            borderRadius: "10px",
            background: "#f3f4f6",
            textAlign: "center",
            fontWeight: "bold",
          }}
        >
          Estimated Court Fee: ₹{fee}
        </div>
      )}
    </div>
  );
};

export default CourtFeeCalculator;