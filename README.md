# PIXELPOST

This project has two apps:

- `Backend` runs the API on `http://localhost:3000`
- `Frontend` runs the Vite app, usually on `http://localhost:5173`

## Install

If dependencies are not already installed:

```bash
npm install --prefix Backend
npm install --prefix Frontend
```

## Environment

Create these files before using authentication:

```bash
cp Backend/.env.example Backend/.env
cp Frontend/.env.example Frontend/.env
```

Required auth variables:

- `Backend/.env`: `AUTH_SECRET`

## Run

Start both apps from the project root:

```bash
npm run dev
```

Or start them separately:

```bash
npm run dev:backend
npm run dev:frontend
```

## Notes

- The frontend is hardcoded to call `http://localhost:3000`
- The backend uses variables from `Backend/.env`
