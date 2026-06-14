import { ImageResponse } from 'next/og'

// Branded share card used for OpenGraph / Twitter previews.
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          padding: '80px',
          background: '#F8F6F3',
          color: '#1A1714',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 40 }}>
          <div
            style={{
              width: 72,
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#B84A0E',
              color: '#FFFFFF',
              fontSize: 44,
              fontWeight: 700,
              borderRadius: 16,
            }}
          >
            C
          </div>
          <div style={{ fontSize: 44, fontWeight: 700 }}>Cerebra</div>
        </div>
        <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 900 }}>
          Your second brain for studying.
        </div>
        <div style={{ fontSize: 30, color: '#6b6259', marginTop: 28, maxWidth: 900 }}>
          Capture rich notes, organize them, and turn them into AI flashcards and study guides.
        </div>
      </div>
    ),
    size,
  )
}
