import type { NextApiRequest, NextApiResponse } from 'next'
import { execFile } from 'child_process'
import { promisify } from 'util'
import os from 'os'
import path from 'path'
import fs from 'fs/promises'
import { createReadStream } from 'fs'
import OpenAI from 'openai'

const execFileAsync = promisify(execFile)

// Whisper API limit is 25 MB
const MAX_BYTES = 24 * 1024 * 1024

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') return res.status(405).end()

  const { videoId } = req.body
  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'videoId is required' })
  }

  if (!process.env.OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OPENAI_API_KEY is not set in .env.local' })
  }

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'whisper-'))
  const audioPath = path.join(tmpDir, `${videoId}.mp3`)

  try {
    // Download audio-only stream via yt-dlp (capped at ~24 MB)
    await execFileAsync('yt-dlp', [
      '--extract-audio',
      '--audio-format', 'mp3',
      '--audio-quality', '5',       // ~128 kbps — good enough for speech
      '--max-filesize', `${MAX_BYTES}`,
      '--no-playlist',
      '-o', audioPath,
      `https://www.youtube.com/watch?v=${videoId}`,
    ])

    const stat = await fs.stat(audioPath)
    if (stat.size > MAX_BYTES) {
      return res.status(413).json({
        error: 'Audio file is too large for Whisper (>24 MB). Try a shorter video.',
      })
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const response = await openai.audio.transcriptions.create({
      file: createReadStream(audioPath) as any,
      model: 'whisper-1',
      response_format: 'verbose_json',
      timestamp_granularities: ['segment'],
    })

    const lines = (response.segments ?? []).map((seg: any) => ({
      text: seg.text.trim(),
      offset: Math.round(seg.start * 1000),
      duration: Math.round((seg.end - seg.start) * 1000),
    }))

    res.status(200).json({ lines, source: 'whisper' })
  } catch (err: any) {
    const msg = err?.message || 'Transcription failed'
    if (err.code === 'ENOENT') {
      return res.status(500).json({ error: 'yt-dlp is not installed. Run: brew install yt-dlp' })
    }
    res.status(500).json({ error: msg })
  } finally {
    await fs.rm(tmpDir, { recursive: true, force: true })
  }
}

// Disable body size limit — yt-dlp writes to disk, but keep consistent with other routes
export const config = { api: { bodyParser: true } }
