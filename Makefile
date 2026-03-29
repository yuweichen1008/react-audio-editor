.PHONY: setup dev

# First-time setup: install deps + create SQLite DB
# Install yt-dlp separately for better caption support: brew install yt-dlp
setup:
	npm install && npx prisma generate && npx prisma db push

# Start the app
dev:
	npm run dev
