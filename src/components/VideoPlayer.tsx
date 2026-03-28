import { useRef, useEffect, useCallback } from 'react'
import YouTube, { YouTubePlayer, YouTubeEvent } from 'react-youtube'

interface Props {
  videoId: string
  onTimeUpdate: (time: number) => void
  seekTo: (ref: { seek: (t: number) => void }) => void
}

export default function VideoPlayer({ videoId, onTimeUpdate, seekTo }: Props) {
  const playerRef = useRef<YouTubePlayer | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const startPolling = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      if (playerRef.current) {
        const t = playerRef.current.getCurrentTime()
        onTimeUpdate(t)
      }
    }, 250)
  }, [onTimeUpdate])

  useEffect(() => {
    seekTo({
      seek: (t: number) => {
        playerRef.current?.seekTo(t, true)
        playerRef.current?.playVideo()
      },
    })
  }, [seekTo])

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  function onReady(e: YouTubeEvent) {
    playerRef.current = e.target
  }

  function onPlay() {
    startPolling()
  }

  function onPause() {
    if (intervalRef.current) clearInterval(intervalRef.current)
  }

  return (
    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-lg">
      <YouTube
        videoId={videoId}
        onReady={onReady}
        onPlay={onPlay}
        onPause={onPause}
        opts={{
          width: '100%',
          height: '100%',
          playerVars: { autoplay: 0, modestbranding: 1, rel: 0 },
        }}
        className="w-full h-full"
        iframeClassName="w-full h-full"
      />
    </div>
  )
}
