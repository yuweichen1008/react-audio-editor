import type { NextPage } from 'next'
import Head from 'next/head'
import dynamic from 'next/dynamic'
import { useState, useCallback, useRef } from 'react'
import { useSession, signIn, signOut } from 'next-auth/react'
import TranscriptList, { TranscriptLine } from '../components/TranscriptList'

const VideoPlayer = dynamic(() => import('../components/VideoPlayer'), { ssr: false })

function parseVideoId(input: string): string | null {
  try {
    const url = new URL(input)
    if (url.hostname === 'youtu.be') return url.pathname.slice(1)
    return url.searchParams.get('v')
  } catch {
    return /^[a-zA-Z0-9_-]{11}$/.test(input) ? input : null
  }
}

const Home: NextPage = () => {
  const { data: session } = useSession()
  const [urlInput, setUrlInput] = useState('')
  const [videoId, setVideoId] = useState<string | null>(null)
  const [transcript, setTranscript] = useState<TranscriptLine[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [errorHint, setErrorHint] = useState<string | null>(null)
  const [transcriptSource, setTranscriptSource] = useState<string | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const seekRef = useRef<{ seek: (t: number) => void } | null>(null)

  async function handleLoad() {
    const id = parseVideoId(urlInput.trim())
    if (!id) { setError('Could not parse a YouTube video ID from that URL.'); return }
    setError(null)
    setErrorHint(null)
    setTranscriptSource(null)
    setLoading(true)
    setTranscript([])
    setVideoId(id)
    try {
      const res = await fetch(`/api/transcript?videoId=${id}`)
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Failed to fetch transcript')
        setErrorHint(data.hint || null)
        return
      }
      setTranscript(data.lines)
      setTranscriptSource(data.source)
    } catch (e: any) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  function exportSrt() {
    if (!transcript.length) return
    const pad = (n: number, d = 2) => String(n).padStart(d, '0')
    const toSrtTime = (ms: number) => {
      const h = Math.floor(ms / 3600000)
      const m = Math.floor((ms % 3600000) / 60000)
      const s = Math.floor((ms % 60000) / 1000)
      const f = ms % 1000
      return `${pad(h)}:${pad(m)}:${pad(s)},${pad(f, 3)}`
    }
    const srt = transcript
      .map((line, i) => [
        i + 1,
        `${toSrtTime(line.offset)} --> ${toSrtTime(line.offset + line.duration)}`,
        line.text,
        '',
      ].join('\n'))
      .join('\n')
    const blob = new Blob([srt], { type: 'text/plain' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = `${videoId}.srt`
    a.click()
    URL.revokeObjectURL(a.href)
  }

  const handleSeek = useCallback((seconds: number) => {
    seekRef.current?.seek(seconds)
  }, [])

  const handleSeekRef = useCallback((ref: { seek: (t: number) => void }) => {
    seekRef.current = ref
  }, [])

  return (
    <div className="h-screen bg-[#0a0a0a] text-white flex flex-col overflow-hidden">
      <Head>
        <title>Subtitle Annotator</title>
      </Head>

      {/* Header */}
      <header className="shrink-0 flex items-center justify-between px-6 py-3 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <span className="text-[#1db954] text-xl">▶</span>
          <span className="font-semibold tracking-tight text-sm">Subtitle Annotator</span>
        </div>

        {session ? (
          <div className="flex items-center gap-3">
            {session.user?.image && (
              <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" />
            )}
            <span className="text-sm text-white/60 hidden sm:block">{session.user?.name}</span>
            <button
              onClick={() => signOut()}
              className="text-xs text-white/40 hover:text-white/70 transition-colors"
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            onClick={() => signIn('github')}
            className="flex items-center gap-2 text-xs font-medium bg-white/10 hover:bg-white/15 border border-white/10 px-4 py-2 rounded-full transition-colors"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Login with GitHub
          </button>
        )}
      </header>

      {/* URL bar */}
      <div className="shrink-0 px-6 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex gap-2 max-w-3xl">
          <div className="flex-1 flex items-center gap-2 bg-white/5 border border-white/8 rounded-lg px-4 focus-within:border-[#1db954]/50 transition-colors">
            <svg className="w-4 h-4 text-white/30 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
            <input
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLoad()}
              placeholder="Paste a YouTube URL or video ID…"
              className="flex-1 bg-transparent py-2.5 text-sm placeholder-white/25 focus:outline-none"
            />
          </div>
          <button
            onClick={handleLoad}
            disabled={loading}
            className="shrink-0 bg-[#1db954] hover:bg-[#1ed760] disabled:opacity-40 text-black font-bold px-5 py-2.5 rounded-lg text-sm transition-colors"
          >
            {loading ? '…' : 'Load'}
          </button>
        </div>
        {error && (
          <div className="mt-2">
            <p className="text-xs text-red-400">{error}</p>
            {errorHint && <p className="text-xs text-white/30 mt-0.5">{errorHint}</p>}
          </div>
        )}
        {!session && !error && (
          <p className="mt-1.5 text-xs text-white/25">
            Login with GitHub to add notes and corrections.
          </p>
        )}
      </div>

      {/* Main */}
      {videoId ? (
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

          {/* Left: video */}
          <div className="lg:w-[52%] shrink-0 flex flex-col p-4 lg:p-5 gap-4">
            <VideoPlayer
              videoId={videoId}
              onTimeUpdate={setCurrentTime}
              seekTo={handleSeekRef}
            />
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-white/5 my-4" />

          {/* Right: transcript */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="shrink-0 px-5 py-3 flex items-center justify-between border-b border-white/5">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold tracking-widest uppercase text-white/30">
                  Transcript
                </span>
                {transcriptSource && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-white/25">
                    via {transcriptSource}
                  </span>
                )}
              </div>
              {transcript.length > 0 && (
                <button
                  onClick={exportSrt}
                  className="text-[11px] text-white/30 hover:text-[#1db954] transition-colors flex items-center gap-1"
                >
                  ↓ Export SRT
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3">
              {transcript.length > 0 ? (
                <TranscriptList
                  lines={transcript}
                  currentTime={currentTime}
                  videoId={videoId}
                  onSeek={handleSeek}
                />
              ) : loading ? (
                <div className="flex items-center justify-center h-full gap-2 text-white/30 text-sm">
                  <span className="animate-spin">⟳</span> Fetching transcript…
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-white/25 text-sm">
                  No transcript available for this video.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
          <span className="text-5xl opacity-20">▶</span>
          <p className="text-white/30 text-sm max-w-xs">
            Paste a YouTube URL above to load the video and its captions.
          </p>
        </div>
      )}
    </div>
  )
}

export default Home
