import { useState, useEffect, useCallback } from 'react';
import { validateField, explainField } from '../api/client';
import { speak, cancel } from '../api/ttsProvider';
import {
  getState, setAnswer, setError, incrementFailedAttempts, resetFailedAttempts,
} from '../state/sessionStore';

import ProgressBar        from './ProgressBar';
import AudioPlayer        from './AudioPlayer';
import SupportCallButton  from './SupportCallButton';
import ErrorMessage       from './ErrorMessage';

import NumericTile        from './inputs/NumericTile';
import AlphanumericTile   from './inputs/AlphanumericTile';
import TileGroup          from './inputs/TileGroup';
import TileGroupMulti     from './inputs/TileGroupMulti';
import VoiceInput         from './inputs/VoiceInput';
import TextInput          from './inputs/TextInput';
import PhotoCapture       from './inputs/PhotoCapture';
import GuidedPassword     from './inputs/GuidedPassword';
import ConfirmReadonly    from './inputs/ConfirmReadonly';
import TimePicker         from './inputs/TimePicker';
import DeclarationAgree   from './inputs/DeclarationAgree';

const INPUT_COMPONENTS = {
  numeric_tile:       NumericTile,
  alphanumeric_tile:  AlphanumericTile,
  tile_group:         TileGroup,
  tile_group_multi:   TileGroupMulti,
  voice_input:        VoiceInput,
  text_input:         TextInput,
  photo_capture:      PhotoCapture,
  guided_password:    GuidedPassword,
  confirm_readonly:   ConfirmReadonly,
  time_picker:        TimePicker,
  declaration_agree:  DeclarationAgree,
};

// Localised fallback messages for non-validator required-field errors
const REQUIRED_MSG = {
  en: 'Please provide an answer before continuing.',
  ta: 'தொடர்வதற்கு முன் ஒரு பதில் வழங்கவும்.',
  hi: 'जारी रखने से पहले एक उत्तर दें।',
};

export default function QuestionScreen({ entry, currentIndex, total, language, t, onNext, declarationText, onGoTo }) {
  const [inputValue, setInputValue] = useState(() => {
    const s = getState();
    return s.answers[entry.id] || (entry.inputType === 'tile_group_multi' ? [] : '');
  });
  const [errorMsg, setErrorMsg]     = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [failCount, setFailCount]   = useState(() => {
    const s = getState();
    return s.failedAttempts[entry.id] || 0;
  });

  useEffect(() => {
    const s = getState();
    setInputValue(s.answers[entry.id] || (entry.inputType === 'tile_group_multi' ? [] : ''));
    setErrorMsg(null);
    setFailCount(s.failedAttempts[entry.id] || 0);
  }, [entry.id]);

  const questionText = entry.questionText
    ? (entry.questionText[language] || entry.questionText.en || '')
    : '';

  async function handleSubmit(overrideValue) {
    if (submitting) return;
    setSubmitting(true);
    setErrorMsg(null);

    try {
      const actualInput = typeof overrideValue === 'string' ? overrideValue : inputValue;
      const rawValue = Array.isArray(actualInput) ? actualInput.join(',') : actualInput;

      if (entry.validationType) {
        // Pass language so backend returns error in user's language
        const result = await validateField(entry.validationType, rawValue, language);
        if (!result.valid) {
          const count = incrementFailedAttempts(entry.id);
          setFailCount(count);
          setError(entry.id, result.message);
          setErrorMsg(result.message);
          // Speak the error in the user's language (#1)
          speak(result.message, language);
          setSubmitting(false);
          return;
        }
      } else if (entry.required !== false) {
        const isEmpty = Array.isArray(actualInput) ? actualInput.length === 0 : !rawValue || !rawValue.trim();
        if (isEmpty) {
          const count = incrementFailedAttempts(entry.id);
          setFailCount(count);
          const msg = REQUIRED_MSG[language] || REQUIRED_MSG.en;
          setErrorMsg(msg);
          speak(msg, language);
          setSubmitting(false);
          return;
        }
      }

      setAnswer(entry.id, actualInput);
      resetFailedAttempts(entry.id);
      onNext();
    } catch (err) {
      const msg = t('errorGeneric');
      setErrorMsg(msg);
      speak(msg, language);
    } finally {
      setSubmitting(false);
    }
  }

  const InputComponent = INPUT_COMPONENTS[entry.inputType];
  const showSupportProminently = failCount >= 2;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column',
      height: '100%', padding: '24px 28px 28px',
      gap: 20, position: 'relative',
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <ProgressBar current={currentIndex} total={total} />
        <div style={{ display: 'flex', gap: 8, marginLeft: 16, flexShrink: 0 }}>
          <SupportCallButton t={t} />
        </div>
      </div>

      {/* Question text + audio */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
        <AudioPlayer text={questionText} language={language} autoPlay />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, lineHeight: 1.5, flex: 1, paddingTop: 4 }}>
          {questionText}
        </h2>
      </div>

      {/* Input */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {InputComponent ? (
          <InputComponent
            entry={entry}
            value={inputValue}
            onChange={setInputValue}
            onSubmit={handleSubmit}
            language={language}
            t={t}
            declarationText={declarationText}
            onGoTo={onGoTo}
          />
        ) : (
          <p style={{ color: 'var(--myntra-error)' }}>Unknown inputType: {entry.inputType}</p>
        )}
      </div>

      {/* Error */}
      {errorMsg && (
        <ErrorMessage message={errorMsg} onRetry={() => { setErrorMsg(null); cancel(); }} />
      )}

      {/* Prominent support after 2+ failures */}
      {showSupportProminently && (
        <div style={{
          background: 'rgba(255,202,40,0.1)', border: '2px solid var(--myntra-warning)',
          borderRadius: 12, padding: '14px 18px',
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: '1.2rem' }}>⚠️</span>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--myntra-warning)', marginBottom: 8 }}>
              {language === 'ta' ? 'சிக்கல் உள்ளதா? ஒரு ஆதரவு முகவர் உதவ முடியும்.' :
               language === 'hi' ? 'परेशानी हो रही है? एक सहायता एजेंट मदद कर सकता है।' :
               'Having trouble? A support agent can help you.'}
            </p>
            <SupportCallButton t={t} />
          </div>
        </div>
      )}
    </div>
  );
}
