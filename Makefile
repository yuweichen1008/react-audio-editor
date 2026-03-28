.PHONY: setup dev

# First-time setup: install deps + create SQLite DB
setup:
	npm install && npx prisma generate && npx prisma db push

# Start the app
dev:
	npm run dev
