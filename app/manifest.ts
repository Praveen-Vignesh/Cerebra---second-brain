import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: 'Cerebra — your second brain for studying',
		short_name: 'Cerebra',
		description:
			'Capture rich notes, organize them, and turn them into AI flashcards and study guides with spaced review.',
		start_url: '/',
		display: 'standalone',
		background_color: '#F8F6F3',
		theme_color: '#B84A0E',
		icons: [
			{
				src: '/icon',
				sizes: '32x32',
				type: 'image/png',
			},
		],
	}
}
