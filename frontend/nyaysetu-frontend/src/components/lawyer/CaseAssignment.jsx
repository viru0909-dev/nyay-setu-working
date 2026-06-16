import { useState } from 'react';

const CaseAssignment = () => {
  const [caseId, setCaseId] = useState('');
  const [tags, setTags] = useState('');
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [assigned, setAssigned] = useState(null);

  const findMatches = async () => {
    setLoading(true);
    setMatches([]);
    try {
      const requiredTags = tags.split(',').map(t => t.trim()).filter(Boolean);
      const res = await fetch(`/api/cases/${caseId}/match-lawyers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requiredTags }),
      });
      const data = await res.json();
      setMatches(data);
    } catch (err) {
      // Mock data for preview
      setMatches([
        { lawyerProfileId: 1, name: 'Aditi Sharma', city: 'Delhi', expertiseTags: ['Criminal'], rating: 4.8, experienceYears: 12, activeCaseCount: 3, matchScore: 91.50 },
        { lawyerProfileId: 2, name: 'Ravi Menon', city: 'Mumbai', expertiseTags: ['Civil'], rating: 4.5, experienceYears: 8, activeCaseCount: 5, matchScore: 78.25 },
        { lawyerProfileId: 3, name: 'Priya Nair', city: 'Hyderabad', expertiseTags: ['Corporate'], rating: 4.9, experienceYears: 15, activeCaseCount: 2, matchScore: 65.00 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (lawyer) => {
    setAssigned(lawyer.name);
    alert(`Assigned ${lawyer.name} to case ${caseId || 'PREVIEW-001'}`);
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h2 style={{ marginBottom: '1rem' }}>Case Assignment — Lawyer Matching</h2>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#444' }}>Case ID</label>
          <input
            placeholder="e.g. abc-123"
            value={caseId}
            onChange={e => setCaseId(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', width: '200px' }}
          />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: '13px', marginBottom: '4px', color: '#444' }}>Required Expertise (comma-separated)</label>
          <input
            placeholder="e.g. Criminal, Family"
            value={tags}
            onChange={e => setTags(e.target.value)}
            style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ccc', fontSize: '14px', width: '280px' }}
          />
        </div>
        <button
          onClick={findMatches}
          style={{ padding: '0.5rem 1.5rem', background: '#1a56db', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '14px', height: '38px' }}
        >
          Find Matches
        </button>
      </div>

      {loading && <p>Matching lawyers...</p>}

      {matches.length > 0 && (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '14px' }}>
          <thead>
            <tr style={{ background: '#f1f5f9' }}>
              <th style={th}>Rank</th>
              <th style={th}>Name</th>
              <th style={th}>City</th>
              <th style={th}>Expertise</th>
              <th style={th}>Rating</th>
              <th style={th}>Exp (yrs)</th>
              <th style={th}>Active Cases</th>
              <th style={th}>Match Score</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((m, i) => (
              <tr key={m.lawyerProfileId} style={{ borderBottom: '1px solid #e2e8f0', background: assigned === m.name ? '#f0fff4' : '#fff' }}>
                <td style={td}>#{i + 1}</td>
                <td style={td}><strong>{m.name}</strong></td>
                <td style={td}>{m.city}</td>
                <td style={td}>{m.expertiseTags?.join(', ')}</td>
                <td style={td}>⭐ {m.rating}</td>
                <td style={td}>{m.experienceYears}</td>
                <td style={td}>{m.activeCaseCount}</td>
                <td style={td}>
                  <span style={{ color: m.matchScore >= 80 ? '#16a34a' : m.matchScore >= 50 ? '#d97706' : '#dc2626', fontWeight: 'bold' }}>
                    {m.matchScore}%
                  </span>
                </td>
                <td style={td}>
                  <button
                    onClick={() => handleAssign(m)}
                    style={{ padding: '4px 12px', background: '#16a34a', color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '13px' }}
                  >
                    Assign
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {!loading && matches.length === 0 && <p style={{ color: '#888' }}>Enter a case ID and expertise tags, then click Find Matches.</p>}
    </div>
  );
};

const th = { padding: '10px 12px', textAlign: 'left', fontWeight: '600', color: '#374151' };
const td = { padding: '10px 12px', color: '#374151' };

export default CaseAssignment;