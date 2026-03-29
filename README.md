# YouTube Subtitle Annotator

Paste a YouTube URL, watch the video, and follow along with auto-synced captions (Spotify-style). Log in with GitHub to add corrections or comments to any line.

## Stack

- **Next.js 14** — pages router, API routes
- **TailwindCSS** — dark Spotify-style UI
- **youtube-transcript** + **yt-dlp** — caption fetching with automatic fallback
- **NextAuth.js** — GitHub OAuth login
- **Prisma + SQLite** — stores corrections locally

## Setup

### 1. Install dependencies and create the database

```bash
make setup
```

### 1b. Install yt-dlp (optional but recommended)

`yt-dlp` is used as a fallback when YouTube's caption API doesn't return results. Without it, many videos will show "No transcript available".

```bash
brew install yt-dlp   # macOS
# or: pip install yt-dlp
```

### 2. Configure environment variables

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your GitHub OAuth credentials.
Create an OAuth App at [github.com/settings/developers](https://github.com/settings/developers) with the callback URL:
```
http://localhost:3000/api/auth/callback/github
```

### 3. Run

```bash
make dev
```

Open [http://localhost:3000](http://localhost:3000).

## Usage

1. Paste any YouTube URL or video ID into the input bar and click **Load**
2. The transcript appears alongside the video, highlighting the current line as it plays
3. Click any line to jump the video to that timestamp
4. Log in with GitHub to add corrections or comments — they're saved locally and shown inline

## Status

- [x] YouTube video embed with playback sync
- [x] Auto-generated caption display (Spotify-style)
- [x] Click-to-seek on any transcript line
- [x] GitHub login (NextAuth)
- [x] Inline corrections/comments saved to SQLite
- [x] Export transcript as SRT file
- [x] yt-dlp fallback for videos without public captions
- [ ] Whisper AI transcription for videos with no captions at all
- [ ] Support for multiple languages / manual SRT upload
