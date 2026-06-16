const { checkFIRCompliance, batchCheckCompliance } = require("./firComplianceChecker");

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

describe("FIR Compliance Checker - BNSS Section 193", () => {
  test("COMPLIANT for non-severe offense within 60 days", () => {
    const result = checkFIRCompliance({ firNumber: "FIR001", registrationDate: daysAgo(30), isSevereOffense: false });
    expect(result.status).toBe("COMPLIANT");
    expect(result.deadlineDays).toBe(60);
  });

  test("OVERDUE for non-severe offense past 60 days", () => {
    const result = checkFIRCompliance({ firNumber: "FIR002", registrationDate: daysAgo(65), isSevereOffense: false });
    expect(result.status).toBe("OVERDUE");
  });

  test("COMPLIANT for severe offense within 90 days", () => {
    const result = checkFIRCompliance({ firNumber: "FIR003", registrationDate: daysAgo(50), isSevereOffense: true });
    expect(result.status).toBe("COMPLIANT");
    expect(result.deadlineDays).toBe(90);
  });

  test("OVERDUE for severe offense past 90 days", () => {
    const result = checkFIRCompliance({ firNumber: "FIR004", registrationDate: daysAgo(95), isSevereOffense: true });
    expect(result.status).toBe("OVERDUE");
  });

  test("CRITICAL when 5 days remain", () => {
    const result = checkFIRCompliance({ firNumber: "FIR005", registrationDate: daysAgo(55), isSevereOffense: false });
    expect(result.status).toBe("CRITICAL");
  });

  test("batchCheckCompliance sorts by urgency", () => {
    const firs = [
      { firNumber: "A", registrationDate: daysAgo(20), isSevereOffense: false },
      { firNumber: "B", registrationDate: daysAgo(65), isSevereOffense: false },
      { firNumber: "C", registrationDate: daysAgo(55), isSevereOffense: false },
    ];
    const results = batchCheckCompliance(firs);
    expect(results[0].status).toBe("OVERDUE");
  });
});
