import { useState } from 'react';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

function Selector({ label, hour, setHour, min, setMin, period, setPeriod }) {
  const selectStyle = {
    padding: '8px 12px',
    borderRadius: 8,
    border: '1.5px solid var(--myntra-border)',
    background: 'var(--myntra-surface)',
    color: 'var(--myntra-text)',
    fontSize: '0.9rem',
    outline: 'none',
    cursor: 'pointer',
  };

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ textAlign: 'center', color: 'var(--myntra-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{label}</p>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        <select value={hour || ''} onChange={(e) => setHour(e.target.value)} style={selectStyle}>
          <option value="" disabled>HH</option>
          {HOURS.map((h) => <option key={h} value={h}>{h}</option>)}
        </select>
        <span style={{ alignSelf: 'center', fontWeight: 'bold' }}>:</span>
        <select value={min || ''} onChange={(e) => setMin(e.target.value)} style={selectStyle}>
          <option value="" disabled>MM</option>
          {MINUTES.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={period || ''} onChange={(e) => setPeriod(e.target.value)} style={{...selectStyle, marginLeft: 4}}>
          <option value="" disabled>AM/PM</option>
          {['AM','PM'].map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
    </div>
  );
}

export default function TimePicker({ entry, value, onChange, onSubmit, t }) {
  const [startH, setStartH] = useState(null);
  const [startM, setStartM] = useState(null);
  const [startP, setStartP] = useState(null);
  const [endH,   setEndH]   = useState(null);
  const [endM,   setEndM]   = useState(null);
  const [endP,   setEndP]   = useState(null);

  const isComplete = startH && startM && startP && endH && endM && endP;
  const builtValue = isComplete ? `${startH}:${startM} ${startP} – ${endH}:${endM} ${endP}` : '';

  return (
    <div className="flex flex-col gap-5 w-full animate-slideUp">
      <div className="display-box" style={{ fontSize: '1.1rem', minHeight: '3.5rem' }}>{builtValue}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Selector label="Opens" hour={startH} setHour={setStartH} min={startM} setMin={setStartM} period={startP} setPeriod={setStartP} />
        <div style={{ width: 1, background: 'var(--myntra-border)' }} />
        <Selector label="Closes" hour={endH} setHour={setEndH} min={endM} setMin={setEndM} period={endP} setPeriod={setEndP} />
      </div>
      <button 
        className="tile-btn primary" 
        disabled={!isComplete}
        onClick={() => { onChange(builtValue); onSubmit(); }}
      >
        {t('next')}
      </button>
    </div>
  );
}
