import { useEffect, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'

export interface TranscriptLine {
  text: string
  offset: number   // milliseconds
  duration: number // milliseconds
}

export interface Correction {
  id: number
  startTime: number
  text: string
  author: string
}

interface Props {
  lines: TranscriptLine[]
  currentTime: number // seconds
  videoId: string
  onSeek: (seconds: number) => void
}

function fmt(ms: number) {
  const s = Math.floor(ms / 1000)
  const m = Math.floor(s / 60)
  return `${m}:${(s % 60).toString().padStart(2, '0')}`
}

export default function TranscriptList({ lines, currentTime, videoId, onSeek }: Props) {
  const { data: session } = useSession()
  const [corrections, setCorrections] = useState<Correction[]>([])
  const [editing, setEditing] = useState<number | null>(null)
  const [draft, setDraft] = useState('')
  const activeRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!videoId) return
    fetch(`/api/corrections?videoId=${videoId}`)
      .then(r => r.json())
      .then(data => Array.isArray(data) && setCorrections(data))
  }, [videoId])

  const currentMs = currentTime * 1000
  const activeIndex = lines.reduce((best, line, i) => (line.offset <= currentMs ? i : best), -1)

  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'center', behavior: 'smooth' })
  }, [activeIndex])

  async function saveCorrection(line: TranscriptLine) {
    if (!draft.trim()) return
    const res = await fetch('/api/corrections', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoId,
        startTime: line.offset / 1000,
        original: line.text,
        text: draft.trim(),
      }),
    })
    if (res.ok) {
      const saved = await res.json()
      setCorrections(prev => [...prev, saved])
    }
    setEditing(null)
    setDraft('')
  }

  return (
    <div className="flex flex-col pb-12">
      {lines.map((line, i) => {
        const dist = Math.abs(i - activeIndex)
        const isActive = i === activeIndex
        const isNear = dist === 1
        const lineCorrections = corrections.filter(
          c => Math.abs(c.startTime - line.offset / 1000) < 0.5
        )

        // Spotify-style: active = white+big, near = lighter, far = dim
        const textColor = isActive
          ? 'text-white'
          : isNear
          ? 'text-white/50'
          : 'text-white/25'
        const textSize = isActive ? 'text-base font-semibold' : 'text-sm font-normal'

        return (
          <div
            key={line.offset}
            ref={isActive ? activeRef : null}
            onClick={() => onSeek(line.offset / 1000)}
            className="group px-2 py-1.5 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
          >
            <div className="flex items-start gap-3">
              <span className="text-[11px] font-mono text-white/20 mt-0.5 w-9 shrink-0 text-right">
                {fmt(line.offset)}
              </span>

              <div className="flex-1 min-w-0">
                <p className={`leading-snug transition-all duration-300 ${textColor} ${textSize}`}>
                  {line.text}
                </p>

                {/* Corrections */}
                {lineCorrections.length > 0 && (
                  <div className="mt-1.5 flex flex-col gap-1">
                    {lineCorrections.map(c => (
                      <div
                        key={c.id}
                        onClick={e => e.stopPropagation()}
                        className="flex items-start gap-1.5 text-[11px] text-[#1db954]/80"
                      >
                        <span className="shrink-0 font-semibold">{c.author}:</span>
                        <span>{c.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Edit form */}
                {editing === line.offset ? (
                  <div
                    onClick={e => e.stopPropagation()}
                    className="mt-2 flex flex-col gap-1.5"
                  >
                    <textarea
                      autoFocus
                      value={draft}
                      onChange={e => setDraft(e.target.value)}
                      placeholder="Add a note or correction…"
                      rows={2}
                      className="w-full text-xs bg-white/5 border border-white/10 rounded-md px-3 py-2 text-white placeholder-white/25 resize-none focus:outline-none focus:border-[#1db954]/50"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => saveCorrection(line)}
                        className="text-xs bg-[#1db954] hover:bg-[#1ed760] text-black font-semibold px-3 py-1 rounded-md transition-colors"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setEditing(null); setDraft('') }}
                        className="text-xs text-white/30 hover:text-white/60 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : session ? (
                  <button
                    onClick={e => { e.stopPropagation(); setEditing(line.offset); setDraft('') }}
                    className="mt-1 text-[11px] text-[#1db954]/0 group-hover:text-[#1db954]/60 hover:!text-[#1db954] transition-colors"
                  >
                    + Add note
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
