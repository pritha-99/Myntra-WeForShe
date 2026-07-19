import { useState } from 'react';

const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = ['00', '15', '30', '45'];

function Selector({ label, hour, setHour, min, setMin, period, setPeriod }) {
  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <p style={{ textAlign: 'center', color: 'var(--myntra-muted)', fontSize: '0.8rem', fontWeight: 600 }}>{label}</p>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, justifyContent: 'center' }}>
        {HOURS.map((h) => (
          <button key={h} onClick={() => setHour(h)} style={{
            width: 38, height: 38, borderRadius: 8,
            border: `2px solid ${hour === h ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
            background: hour === h ? 'rgba(255,63,108,0.2)' : 'var(--myntra-card)',
            color: 'var(--myntra-text)', fontSize: '0.85rem', cursor: 'pointer',
          }}>{h}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 5, justifyContent: 'center' }}>
        {MINUTES.map((m) => (
          <button key={m} onClick={() => setMin(m)} style={{
            width: 44, height: 34, borderRadius: 8,
            border: `2px solid ${min === m ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
            background: min === m ? 'rgba(255,63,108,0.2)' : 'var(--myntra-card)',
            color: 'var(--myntra-text)', fontSize: '0.8rem', cursor: 'pointer',
          }}>:{m}</button>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {['AM','PM'].map((p) => (
          <button key={p} onClick={() => setPeriod(p)} style={{
            flex: 1, height: 36, borderRadius: 8,
            border: `2px solid ${period === p ? 'var(--myntra-pink)' : 'var(--myntra-border)'}`,
            background: period === p ? 'rgba(255,63,108,0.2)' : 'var(--myntra-card)',
            color: 'var(--myntra-text)', fontSize: '0.85rem', cursor: 'pointer',
          }}>{p}</button>
        ))}
      </div>
    </div>
  );
}

export default function TimePicker({ entry, value, onChange, onSubmit, t }) {
  const [startH, setStartH] = useState('09');
  const [startM, setStartM] = useState('00');
  const [startP, setStartP] = useState('AM');
  const [endH,   setEndH]   = useState('06');
  const [endM,   setEndM]   = useState('00');
  const [endP,   setEndP]   = useState('PM');

  const builtValue = `${startH}:${startM} ${startP} – ${endH}:${endM} ${endP}`;

  return (
    <div className="flex flex-col gap-5 w-full animate-slideUp">
      <div className="display-box" style={{ fontSize: '1.1rem' }}>{builtValue}</div>
      <div style={{ display: 'flex', gap: 12 }}>
        <Selector label="Opens" hour={startH} setHour={setStartH} min={startM} setMin={setStartM} period={startP} setPeriod={setStartP} />
        <div style={{ width: 1, background: 'var(--myntra-border)' }} />
        <Selector label="Closes" hour={endH} setHour={setEndH} min={endM} setMin={setEndM} period={endP} setPeriod={setEndP} />
      </div>
      <button className="tile-btn primary" onClick={() => { onChange(builtValue); onSubmit(); }}>
        {t('next')}
      </button>
    </div>
  );
}
