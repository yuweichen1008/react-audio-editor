import type { NextApiRequest, NextApiResponse } from 'next'
import { YoutubeTranscript } from 'youtube-transcript'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') return res.status(405).end()

  const { videoId } = req.query
  if (!videoId || typeof videoId !== 'string') {
    return res.status(400).json({ error: 'videoId is required' })
  }

  try {
    const transcript = await YoutubeTranscript.fetchTranscript(videoId)
    res.status(200).json(transcript)
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch transcript' })
  }
}
