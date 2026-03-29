import type { NextApiRequest, NextApiResponse } from 'next'
import { YoutubeTranscript } from 'youtube-transcript'
import { execFile } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'

const execFileAsync = promisify(execFile)

interface TranscriptLine {
  text: string
  offset: number   // ms
  duration: number // ms
}

// Parse SRT format into our transcript shape
function parseSrt(srt: string): TranscriptLine[] {
  const blocks = srt.trim().split(/\n\n+/)
  const lines: TranscriptLine[] = []

  for (const block of blocks) {
    const parts = block.split('\n')
    if (parts.length < 3) continue

    const timeLine = parts[1]
    const match = timeLine.match(
      /(\d{2}):(\d{2}):(\d{2})[.,](\d{3})\s*-->\s*(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/
    )
    if (!match) continue

    const toMs = (h: string, m: string, s: string, ms: string) =>
      (parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s)) * 1000 + parseInt(ms)

    const start = toMs(match[1], match[2], match[3], match[4])
    const end   = toMs(match[5], match[6], match[7], match[8])

    const text = parts
      .slice(2)
      .join(' ')
      .replace(/<[^>]+>/g, '')    // strip HTML tags (e.g. <c>)
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .trim()

    if (text) lines.push({ text, offset: start, duration: end - start })
  }

  return lines
}

async function fetchWithYtDlp(videoId: string): Promise<TranscriptLine[]> {
  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'yt-'))
  const outTemplate = path.join(tmpDir, '%(id)s')

  try {
    await execFileAsync('yt-dlp', [
      '--write-auto-sub',
      '--write-sub',
      '--sub-lang', 'en',
      '--sub-format', 'srt',
      '--skip-download',
      '--no-playlist',
      '-o', outTemplate,
      `https://www.youtube.com/watch?v=${videoId}`,
    ])

    // Find the downloaded .srt file
    const files = await fs.readdir(tmpDir)
    const srtFile = files.find(f => f.endsWith('.srt'))
    if (!srtFile) throw new Error('yt-dlp ran but no SRT file was produced')

    const content = await fs.readFile(path.join(tmpDir, srtFile), 'utf-8')
    return parseSrt(content)
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { videoId } = req.query
  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'videoId is required' })
  }

  // 1. Try youtube-transcript (no dependencies, works for most videos)
  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)
    return res.status(200).json({ lines: transcript, source: 'youtube' })
  } catch {}

  // 2. Fallback: yt-dlp (handles more videos, must be installed)
  try {
    const lines = await fetchWithYtDlp(videoId)
    return res.status(200).json({ lines, source: 'yt-dlp' })
  } catch (err: any) {
    const ytDlpMissing = err.code === 'ENOENT'
    return res.status(404).json({
      error: 'No captions found for this video.',
      hint: ytDlpMissing
        ? 'Install yt-dlp for better caption support: brew install yt-dlp'
        : 'This video has no captions available. Consider Whisper AI transcription.',
    })
  }
}
