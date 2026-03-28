import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth'
import { PrismaClient } from '@prisma/client'
import authOptions from '../../lib/auth'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { videoId } = req.query
    if (!videoId || typeof videoId !== 'string') {
      return res.status(400).json({ error: 'videoId is required' })
    }
    const corrections = await prisma.correction.findMany({
      where: { videoId },
      orderBy: { startTime: 'asc' },
    })
    return res.status(200).json(corrections)
  }

  if (req.method === 'POST') {
    const session = await getServerSession(req, res, authOptions)
    if (!session?.user?.name) return res.status(401).json({ error: 'Login required' })

    const { videoId, startTime, original, text } = req.body
    if (!videoId || startTime == null || !text) {
      return res.status(400).json({ error: 'Missing required fields' })
    }
    const correction = await prisma.correction.create({
      data: {
        videoId,
        startTime: Number(startTime),
        original: original ?? '',
        text,
        author: session.user.name,
      },
    })
    return res.status(201).json(correction)
  }

  res.status(405).end()
}
