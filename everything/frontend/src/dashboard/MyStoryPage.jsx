import { useOutletContext } from 'react-router-dom';

/**
 * My Story Page - Coming Soon
 * 
 * This page will allow sellers to add optional story content (slides + images)
 * that will appear in the Made Across India customer experience.
 * 
 * For now, this is a placeholder. Real sellers will use mock story data.
 */
export default function MyStoryPage() {
  const { t } = useOutletContext();

  return (
    <div
      style={{
        maxWidth: 960,
        margin: '0 auto',
        padding: 40,
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          textAlign: 'center',
          maxWidth: 560,
        }}
      >
        {/* Icon */}
        <div
          style={{
            fontSize: '5rem',
            marginBottom: 24,
            opacity: 0.8,
          }}
        >
          📖
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            color: 'var(--myntra-text)',
            marginBottom: 16,
            letterSpacing: '-0.02em',
          }}
        >
          {t('myStoryTitle') || 'My Story'}
        </h1>

        {/* Description */}
        <p
          style={{
            fontSize: '1rem',
            lineHeight: 1.6,
            color: 'var(--myntra-muted)',
            marginBottom: 32,
          }}
        >
          {t('myStoryComingSoon') || 
            'Share your craft journey with customers on Made Across India. Add story slides, photos, and your unique narrative — coming soon!'}
        </p>

        {/* Feature list */}
        <div
          style={{
            background: 'var(--myntra-surface)',
            border: '1px solid var(--myntra-border)',
            borderRadius: 16,
            padding: 32,
            textAlign: 'left',
          }}
        >
          <h3
            style={{
              fontSize: '1rem',
              fontWeight: 700,
              color: 'var(--myntra-text)',
              marginBottom: 20,
            }}
          >
            What's Coming
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <FeatureItem
              emoji="📸"
              title="Visual Storytelling"
              description="Upload photos that showcase your craft, workspace, and creative process"
            />
            <FeatureItem
              emoji="✍️"
              title="Craft Narrative"
              description="Share your journey, techniques, and what makes your work unique"
            />
            <FeatureItem
              emoji="🗺️"
              title="Appear on the Map"
              description="Your story will be featured on Made Across India for customers to discover"
            />
            <FeatureItem
              emoji="🎙️"
              title="Voice Input Support"
              description="Tell your story in your own language with voice-to-text support"
            />
          </div>
        </div>

        {/* Status badge */}
        <div
          style={{
            marginTop: 32,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            background: 'rgba(255, 193, 7, 0.15)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: 24,
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#FFC107',
          }}
        >
          <span>⏱️</span>
          <span>Coming in the next update</span>
        </div>

        {/* Note */}
        <p
          style={{
            fontSize: '0.875rem',
            color: 'var(--myntra-muted)',
            marginTop: 24,
            fontStyle: 'italic',
          }}
        >
          Note: For now, mock story data will be used when your products appear on Made Across India
        </p>
      </div>
    </div>
  );
}

function FeatureItem({ emoji, title, description }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div
        style={{
          fontSize: '1.5rem',
          flexShrink: 0,
        }}
      >
        {emoji}
      </div>
      <div>
        <div
          style={{
            fontSize: '0.9rem',
            fontWeight: 600,
            color: 'var(--myntra-text)',
            marginBottom: 4,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: '0.85rem',
            color: 'var(--myntra-muted)',
            lineHeight: 1.4,
          }}
        >
          {description}
        </div>
      </div>
    </div>
  );
}
