import { createElement } from 'react'
import { Platform, StyleSheet, View } from 'react-native'
import { useVideoPlayer, VideoView } from 'expo-video'
import { WebView } from 'react-native-webview'

export function youtubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/))([\w-]{11})/)
  return match ? match[1] : null
}

function YouTubeEmbed({ id }: { id: string }) {
  const src = `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1&playsinline=1`
  if (Platform.OS === 'web') {
    return createElement('iframe', {
      src,
      style: { border: 0, width: '100%', height: '100%' },
      allow: 'autoplay; encrypted-media; picture-in-picture',
      allowFullScreen: true,
    })
  }
  return <WebView source={{ uri: src }} allowsFullscreenVideo allowsInlineMediaPlayback style={{ flex: 1 }} />
}

function HostedVideo({ url }: { url: string }) {
  const player = useVideoPlayer(url)
  return <VideoView player={player} style={StyleSheet.absoluteFill} nativeControls contentFit="contain" />
}

/** Plays a lesson's media: YouTube links in an embed, uploaded files with the native player. */
export function LessonMedia({ url }: { url: string }) {
  const id = youtubeId(url)
  return <View style={styles.frame}>{id ? <YouTubeEmbed id={id} /> : <HostedVideo url={url} />}</View>
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 16,
    overflow: 'hidden',
  },
})
