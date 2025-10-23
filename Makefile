.PHONY: run

run:
	@echo "Installing dependencies..."
	yarn install
	@echo "Setting up database..."
	cd server && npx prisma generate
	cd server && npx prisma db push
	@echo "Starting development server..."
	yarn dev