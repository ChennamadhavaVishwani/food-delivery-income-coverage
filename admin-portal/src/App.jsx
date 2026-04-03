import React, { useState } from 'react';

function AdminPortal() {
  const [claims, setClaims] = useState([
    { id: 'CLM-1001', worker: 'Rajesh K.', zone: 'Bangalore', fraudScore: 12, status: 'Approved' }
  ]);

  const triggerEvent = async (type) => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ zone_id: 'Bangalore', type: type })
      });

      const data = await response.json();
      if (data.claim) {
        setClaims(prev => [
          ...prev,
          {
            id: data.claim.id,
            worker: 'Demo Worker',
            zone: data.claim.zone_id,
            fraudScore: data.claim.fraud_score,
            status: data.claim.status
          }
        ]);
        alert(`${type} event triggered! Claim processed.`);
      }
    } catch (err) {
      alert("Error connecting to backend API on port 5000.");
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f0f2f5', minHeight: '100vh' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '40px' }}>
        <h1>Operations Dashboard</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={() => triggerEvent('Rain')} style={btnStyle('#007bff')}>Trigger Synthetic Rain</button>
          <button onClick={() => triggerEvent('AQI')} style={btnStyle('#6c757d')}>Trigger AQI Smog</button>
        </div>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '30px' }}>
        <div style={statCard}><h3>Active Policies</h3><p style={bigText}>1,240</p></div>
        <div style={statCard}><h3>Weekly Payouts</h3><p style={bigText}>₹45,300</p></div>
        <div style={statCard}><h3>Avg Fraud Score</h3><p style={bigText}>14.2</p></div>
      </div>

      <table style={{ width: '100%', backgroundColor: '#fff', borderRadius: '8px', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ textAlign: 'left', borderBottom: '2px solid #eee' }}>
            <th style={pad}>Claim ID</th><th style={pad}>Worker</th><th style={pad}>Zone</th><th style={pad}>Fraud Score</th><th style={pad}>Status</th>
          </tr>
        </thead>
        <tbody>
          {claims.map(c => (
            <tr key={c.id} style={{ borderBottom: '1px solid #eee' }}>
              <td style={pad}>{c.id}</td><td style={pad}>{c.worker}</td><td style={pad}>{c.zone}</td>
              <td style={pad}><span style={{ color: c.fraudScore > 50 ? 'red' : 'green', fontWeight: 'bold' }}>{c.fraudScore}</span></td>
              <td style={pad}>{c.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const btnStyle = (bg) => ({ backgroundColor: bg, color: '#fff', border: 'none', padding: '10px 20px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' });
const statCard = { backgroundColor: '#fff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' };
const bigText = { fontSize: '24px', fontWeight: 'bold', margin: '10px 0 0 0' };
const pad = { padding: '15px' };

export default AdminPortal;