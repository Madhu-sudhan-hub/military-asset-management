import React from 'react';
import './Home.css';

function Home() {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Military Asset Management System</h1>
        <h2>Secure Asset Tracking and Logistics Management</h2>
        <div className="phase-badge">Phase 1 - Project Foundation</div>
      </header>
      
      <section className="home-content">
        <p>
          Welcome to the MAMS portal. The system is currently in its foundation phase. 
          Future updates will include full asset tracking, logistics management, transfers, 
          and strict role-based access control.
        </p>
      </section>
    </div>
  );
}

export default Home;
