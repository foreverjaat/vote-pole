import React from 'react';
export default function Spinner() {
  return (
    <div className="loading-screen">
      <div className="spinner" />
      <p style={{ color: 'var(--text2)', fontSize: 14 }}>Loading...</p>
    </div>
  );
}
