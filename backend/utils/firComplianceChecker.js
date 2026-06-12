/**
 * FIR Regulatory Compliance Checker
 * Bharatiya Nagarik Suraksha Sanhita (BNSS) Section 193
 * - Offense < 10 years punishment     → 60 days to file charge sheet
 * - Offense punishable by death/life/>=10 years → 90 days
 */

function getDeadlineDays(isSevereOffense) {
  return isSevereOffense ? 90 : 60;
}

function getDaysElapsed(firDate) {
  const registered = new Date(firDate);
  const today = new Date();
  return Math.floor((today - registered) / (1000 * 60 * 60 * 24));
}

function checkFIRCompliance(fir) {
  const { registrationDate, isSevereOffense, firNumber = "N/A" } = fir;
  const daysElapsed = getDaysElapsed(registrationDate);
  const deadlineDays = getDeadlineDays(isSevereOffense);
  const daysRemaining = deadlineDays - daysElapsed;

  let status, alert;

  if (daysElapsed > deadlineDays) {
    status = "OVERDUE";
    alert = `OVERDUE: FIR ${firNumber} exceeded ${deadlineDays}-day limit by ${Math.abs(daysRemaining)} day(s). Action required under BNSS Section 193.`;
  } else if (daysRemaining <= 7) {
    status = "CRITICAL";
    alert = `CRITICAL: FIR ${firNumber} — only ${daysRemaining} day(s) left (${deadlineDays}-day limit, BNSS Section 193).`;
  } else if (daysRemaining <= 15) {
    status = "WARNING";
    alert = `WARNING: FIR ${firNumber} — ${daysRemaining} day(s) remaining (${deadlineDays}-day limit, BNSS Section 193).`;
  } else {
    status = "COMPLIANT";
    alert = `COMPLIANT: FIR ${firNumber} — ${daysRemaining} day(s) remaining within ${deadlineDays}-day limit.`;
  }

  return { firNumber, registrationDate, isSevereOffense, daysElapsed, deadlineDays, daysRemaining, status, alert };
}

function batchCheckCompliance(firs) {
  const urgencyOrder = { OVERDUE: 0, CRITICAL: 1, WARNING: 2, COMPLIANT: 3 };
  return firs
    .map(checkFIRCompliance)
    .sort((a, b) => urgencyOrder[a.status] - urgencyOrder[b.status]);
}

module.exports = { checkFIRCompliance, batchCheckCompliance, getDeadlineDays, getDaysElapsed };
