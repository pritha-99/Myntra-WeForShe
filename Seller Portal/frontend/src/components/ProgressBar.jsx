/**
 * ProgressBar — shows current section out of total sections.
 * Props: current (0-indexed question index), total (total questions), currentSection (0-indexed), totalSections
 */
export default function ProgressBar({ current, total, currentSection, totalSections }) {
  // If section info is provided, use it; otherwise fall back to question-based progress
  const useSection = (currentSection !== undefined && totalSections !== undefined);
  const displayCurrent = useSection ? currentSection + 1 : current + 1;
  const displayTotal = useSection ? totalSections : total;
  const pct = total > 0 ? ((current + 1) / total) * 100 : 0;

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginBottom: 8, fontSize: '0.78rem', color: 'var(--myntra-muted)',
      }}>
        <span>Section {displayCurrent} of {displayTotal}</span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div style={{
        height: 6, background: 'var(--myntra-border)', borderRadius: 4, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'linear-gradient(90deg, var(--myntra-pink) 0%, #ff7eb3 100%)',
          borderRadius: 4,
          transition: 'width 0.4s cubic-bezier(0.4,0,0.2,1)',
        }} />
      </div>
    </div>
  );
}
