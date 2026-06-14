import { ImageResponse } from 'next/og'

// Favicon — the "C" mark matching the sidebar logo.
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#B84A0E',
          color: '#FFFFFF',
          fontSize: 22,
          fontWeight: 700,
          borderRadius: 7,
        }}
      >
        C
      </div>
    ),
    size,
  )
}
