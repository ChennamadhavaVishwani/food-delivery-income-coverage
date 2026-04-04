import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  const [data, setData] = useState({
    active_disruptions: [],
    recent_claims: [],
    worker_locations: []
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('http://localhost:8000/admin/dashboard');
        if (!response.ok) throw new Error("Network response was not ok");
        const result = await response.json();
        
        if (result.error) {
           setError(result.error);
        } else {
           setData(result);
           setError(null);
        }
      } catch (err) {
        console.log("Fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard">
      <header className="header">
        <h1>🛡️ GigShield Insurer Command Center</h1>
        <div className="live-indicator">
          <div className="pulse"></div>
          {error ? "SYSTEM OFFLINE" : "LIVE LINK ACTIVE"}
        </div>
      </header>
      
      {error && (
         <div className="card" style={{borderColor: 'var(--neon-red)', marginBottom: '30px'}}>
            <h2 style={{color: 'var(--neon-red)'}}>Backend Disconnected</h2>
            <p>Make sure your FastAPI server is running on port 8000. Firebase Status: {error}</p>
         </div>
      )}

      <div className="grid">
        {/* Left Column */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '30px'}}>
          <div className="card">
             <h2>Active Disruption Zones</h2>
             <div className="zone-list">
               {data.active_disruptions.length === 0 && <p className="zone-stats">No zones tracked.</p>}
               {data.active_disruptions.map(zone => (
                 <div key={zone.id} className={`zone-item ${mockRisk(zone.id) > 10 ? 'alert' : ''}`}>
                    <div>
                      <div className="zone-name">{zone.city} ({zone.id})</div>
                      <div className="zone-stats">Lat: {zone.lat} | Lng: {zone.lon}</div>
                    </div>
                    <div style={{fontWeight: 'bold', color: mockRisk(zone.id) > 10 ? 'var(--neon-red)' : 'var(--neon-blue)'}}>
                      {mockRisk(zone.id) > 10 ? 'WEATHER ALERT' : 'MONITORING'}
                    </div>
                 </div>
               ))}
             </div>
          </div>

          <div className="card">
            <h2>Live Worker Telemetry</h2>
            <div className="map-container">
               <div className="radar"></div>
               {/* Plotting points randomly for the cool visual map effect since we don't have a real map canvas */}
               {data.worker_locations.slice(0, 10).map((loc, i) => (
                  <div 
                    key={i} 
                    className="worker-dot" 
                    title={`Worker: ${loc.worker_id}`}
                    style={{
                      left: `${30 + (Math.random() * 40)}%`, 
                      top: `${30 + (Math.random() * 40)}%`
                    }} 
                  />
               ))}
               <div style={{position: 'absolute', bottom: 15, left: 20, color: 'var(--text-muted)', fontSize: 12}}>
                  {data.worker_locations.length} workers geofenced
               </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="card">
          <h2>Real-Time Claims & Fraud Analytics</h2>
          {data.recent_claims.length === 0 ? (
            <p style={{color: 'var(--text-muted)'}}>No claims processed yet.</p>
          ) : (
            <div style={{overflowX: 'auto'}}>
              <table>
                <thead>
                  <tr>
                    <th>Worker ID</th>
                    <th>Event</th>
                    <th>Status</th>
                    <th>Autoencoder Score</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_claims.map((claim, idx) => (
                    <tr key={claim.id || idx}>
                      <td style={{fontWeight: 'bold'}}>{claim.worker_id}</td>
                      <td style={{color: 'var(--neon-blue)'}}>{claim.event_id?.split('-')[0]}</td>
                      <td>
                        <span className={`badge ${claim.status?.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </td>
                      <td>
                        <span className={`fraud-score ${claim.fraud_score > 0.6 ? 'fraud-risk-high' : 'fraud-risk-low'}`}>
                          {claim.fraud_score?.toFixed(3)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Just a quick visual mock function for the UI design to have an alert state
function mockRisk(zoneId) {
  if(zoneId.includes("CHENNAI")) return 15; // Force alert for aesthetic demo
  return 5;
}

export default App;