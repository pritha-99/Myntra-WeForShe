import { getState } from '../../state/sessionStore';

/**
 * ConfirmReadonly — shows key/value pairs for user confirmation.
 * Works in two modes:
 *   1. Static: reads field values from entry.inputConfig.fields[].value
 *   2. Session: reads live answers from sessionStore when inputConfig.useSessionAnswers = true
 *
 * value = 'correct' | 'wrong'  (stored in session answers)
 */

import manifest from '../../data/manifest.sample.json';
const QUESTIONS = [...manifest].sort((a, b) => a.order - b.order);

const FIELD_LABELS = {
  phone:                    { en: 'Phone',              ta: 'தொலைபேசி',        hi: 'फोन' },
  email:                    { en: 'Email',              ta: 'மின்னஞ்சல்',       hi: 'ईमेल' },
  gstin:                    { en: 'GSTIN',              ta: 'GSTIN',            hi: 'GSTIN' },
  primary_contact_is_owner: { en: 'Primary Contact',   ta: 'முதன்மை தொடர்பு',  hi: 'प्राथमिक संपर्क' },
  b2_oms_choice:            { en: 'Order Management',  ta: 'ஆர்டர் நிர்வாகம்', hi: 'ऑर्डर प्रबंधन' },
  bank_account_holder:      { en: 'Account Holder',    ta: 'கணக்து வைத்திருப்பவர்', hi: 'खाताधारक' },
  bank_account_type:        { en: 'Account Type',      ta: 'கணக்கு வகை',      hi: 'खाता प्रकार' },
  brand_name:               { en: 'Brand Name',        ta: 'பிராண்ட் பெயர்',   hi: 'ब्रांड नाम' },
  nature_of_business:       { en: 'Business Type',     ta: 'வணிக வகை',        hi: 'व्यवसाय प्रकार' },
  category_type:            { en: 'Product Category',  ta: 'தயாரிப்பு வகை',   hi: 'उत्पाद श्रेणी' },
};

function getTabName(question, language) {
  let lastTabName = 'General';
  for (let q of QUESTIONS) {
    if (q.sidebarLabel) {
      lastTabName = q.sidebarLabel[language] || q.sidebarLabel.en;
    }
    if (q.id === question.id) break;
  }
  return lastTabName;
}

function formatValue(id, raw, language) {
  if (!raw) return '—';
  if (typeof raw === 'string') return raw;
  if (Array.isArray(raw)) return raw.join(', ') || '—';
  return String(raw);
}

export default function ConfirmReadonly({ entry, value, onChange, onSubmit, language, t }) {
  const config = entry.inputConfig || {};

  // Decide which fields to show
  let groups = [];
  if (config.useSessionAnswers && config.sessionFields) {
    const { answers } = getState();
    const tempGroups = {};
    config.sessionFields.forEach(id => {
      const q = QUESTIONS.find(x => x.id === id);
      const tabName = q ? getTabName(q, language) : 'General';
      const labelObj = FIELD_LABELS[id] || { en: id, ta: id, hi: id };
      const label = labelObj[language] || labelObj.en;
      const raw = answers[id];
      if (!tempGroups[tabName]) tempGroups[tabName] = [];
      tempGroups[tabName].push({ key: id, label, displayValue: formatValue(id, raw, language) });
    });
    for (const [title, fields] of Object.entries(tempGroups)) {
      groups.push({ title, fields });
    }
  } else {
    groups = [{
      title: null,
      fields: (config.fields || []).map(field => {
        const label = field.label
          ? (field.label[language] || field.label.en || field.key)
          : (field[language] || field.en || field.key || field);
        const key = field.key || field;
        return { key, label, displayValue: field.value || '—' };
      })
    }];
  }

  const hasAnyFields = groups.some(g => g.fields.length > 0);

  return (
    <div className="flex flex-col gap-5 w-full animate-slideUp">
      {/* Key/value display */}
      <div style={{
        background: 'var(--myntra-surface)',
        border: '2px solid var(--myntra-border)',
        borderRadius: 12,
        overflow: 'hidden',
      }}>
        {!hasAnyFields ? (
          <div style={{ padding: '20px 18px', color: 'var(--myntra-muted)', fontSize: '0.9rem', textAlign: 'center' }}>
            {language === 'ta' ? 'தகவல் இன்னும் நிரப்பப்படவில்லை.' :
             language === 'hi' ? 'जानकारी अभी भरी नहीं है।' :
             'No information has been entered yet.'}
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={group.title || gi}>
              {group.title && (
                <div style={{ padding: '10px 18px', background: 'var(--myntra-border)', fontWeight: 'bold', fontSize: '0.9rem', color: 'var(--myntra-text)' }}>
                  {group.title}
                </div>
              )}
              {group.fields.map((field, i) => (
                <div
                  key={field.key}
                  style={{
                    display: 'flex', padding: '14px 18px',
                    borderBottom: i < group.fields.length - 1 ? '1px solid var(--myntra-border)' : 'none',
                    alignItems: 'flex-start', gap: 12,
                  }}
                >
                  <span style={{ color: 'var(--myntra-muted)', fontSize: '0.85rem', flexShrink: 0, minWidth: 130 }}>
                    {field.label}
                  </span>
                  <span style={{
                    fontWeight: 600, fontSize: '0.95rem', wordBreak: 'break-all',
                    color: field.displayValue === '—' ? 'var(--myntra-muted)' : 'var(--myntra-text)',
                    fontStyle: field.displayValue === '—' ? 'italic' : 'normal',
                  }}>
                    {field.displayValue}
                  </span>
                </div>
              ))}
            </div>
          ))
        )}
      </div>

      {/* Confirm / Wrong tiles */}
      <div style={{ display: 'flex', gap: 10 }}>
        <button
          className={`tile-btn${value === 'correct' ? ' selected' : ''}`}
          onClick={() => { onChange('correct'); onSubmit('correct'); }}
          style={{ flex: 1, borderColor: value === 'correct' ? 'var(--myntra-success)' : 'var(--myntra-border)',
                   background: value === 'correct' ? 'rgba(0,196,140,0.18)' : 'var(--myntra-card)' }}
        >
          ✅ {t('confirmCorrect')}
        </button>
        <button
          className={`tile-btn${value === 'wrong' ? ' selected' : ''}`}
          onClick={() => { onChange('wrong'); onSubmit('wrong'); }}
          style={{ flex: 1, borderColor: value === 'wrong' ? 'var(--myntra-error)' : 'var(--myntra-border)',
                   background: value === 'wrong' ? 'rgba(255,82,82,0.18)' : 'var(--myntra-card)' }}
        >
          ❌ {t('confirmWrong')}
        </button>
      </div>
      {value === 'wrong' && (
        <p style={{ color: 'var(--myntra-muted)', fontSize: '0.85rem', textAlign: 'center' }}>
          {language === 'ta' ? 'இதை சரிசெய்ய support-ஐ தொடர்பு கொள்ளவும்.' :
           language === 'hi' ? 'इसे सुधारने के लिए सहायता से संपर्क करें।' :
           'Please contact support to correct this information.'}
        </p>
      )}
    </div>
  );
}
