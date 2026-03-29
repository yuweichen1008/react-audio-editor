# YouTube Subtitle Annotator

Watch any YouTube video alongside its auto-synced captions — Spotify lyrics style. Click any line to seek the video, log in with GitHub to add corrections or comments, and export the result as an SRT file.

For videos with no captions, Whisper AI can transcribe the audio on demand.

---

## Stack

| Layer | Tech |
|---|---|
| Framework | Next.js 14 (pages router + API routes) |
| UI | TailwindCSS — dark Spotify-style |
| Captions | `youtube-transcript` → `yt-dlp` fallback → Whisper AI |
| Auth | NextAuth.js — GitHub OAuth |
| Database | Prisma + SQLite (local) |

---

## Setup

### 1. Dependencies

```bash
make setup
```

### 2. yt-dlp — recommended

Enables caption fetching for videos that YouTube's public API misses. Without it, many videos will return "no captions found".

```bash
brew install yt-dlp      # macOS
pip install yt-dlp       # any platform
```

### 3. Environment variables

```bash
cp .env.local.example .env.local
```

| Variable | Required | Description |
|---|---|---|
| `GITHUB_ID` | Yes | GitHub OAuth App client ID |
| `GITHUB_SECRET` | Yes | GitHub OAuth App secret |
| `NEXTAUTH_SECRET` | Yes | Any random string |
| `NEXTAUTH_URL` | Yes | `http://localhost:3000` |
| `OPENAI_API_KEY` | Optional | Enables Whisper AI transcription |

Create a GitHub OAuth App at [github.com/settings/developers](https://github.com/settings/developers).
Set the callback URL to: `http://localhost:3000/api/auth/callback/github`

> **Port note:** The app is pinned to port 3000. If something else is using it:
> `lsof -ti:3000 | xargs kill -9`

### 4. Run

```bash
make dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## How caption fetching works

```
Load video URL
    │
    ├─ 1. youtube-transcript (no dependencies)
    │         └─ success → display transcript
    │
    ├─ 2. yt-dlp (install separately)
    │         └─ success → display transcript  [via yt-dlp]
    │
    └─ 3. No captions found
              └─ "Transcribe with Whisper AI" button
                        └─ yt-dlp downloads audio → OpenAI Whisper API
                                  └─ timestamped transcript  [via whisper]
```

Whisper costs ~$0.006 / minute of audio (~6¢ for a 10-minute video).

---

## Features

- [x] YouTube embed with playback sync
- [x] Spotify-style transcript — active line highlights and auto-scrolls
- [x] Click any line to seek the video to that timestamp
- [x] GitHub login via NextAuth
- [x] Inline corrections and comments saved to local SQLite
- [x] Export transcript as `.srt` file
- [x] yt-dlp fallback for videos without public captions
- [x] Whisper AI transcription for videos with no captions at all

---

## Future ideas

- **Language picker** — fetch captions in a specific language (`yt-dlp` supports any)
- **Search transcript** — filter lines as you type
- **Export with corrections merged** — SRT that folds in user edits
- **Manual SRT upload** — annotate a subtitle file you already have
- **Local Whisper** — use [whisper.cpp](https://github.com/ggerganov/whisper.cpp) instead of the OpenAI API (free, offline)
- **Deploy to Vercel** — swap SQLite → Postgres, push, done
- **Shareable links** — anyone with the URL sees the video and its community corrections
