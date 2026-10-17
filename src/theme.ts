export const colors = {
  bg: '#FFF9F0',
  surface: '#FFFFFF',
  text: '#2B2B3A',
  muted: '#76768A',
  primary: '#5B5BD6',
  primaryText: '#FFFFFF',
  border: '#EDE6DA',
  success: '#2F9E44',
  danger: '#E03131',
  kind: {
    story: '#F59F00',
    video: '#1C7ED6',
    song: '#D6336C',
  },
} as const

export const kindLabel = { story: 'Story', video: 'Video', song: 'Song' } as const
export const kindEmoji = { story: '📖', video: '🎬', song: '🎵' } as const
