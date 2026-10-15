# React 18 & Vanilla AJAX Projects for Laravel API (Full CRUD)

This folder contains a Vite + React frontend that connects to the Laravel REST API.

## Project Structure
```
vanilla-ajax-laravel/
├── index.html               # Vite HTML entry point
├── src/                     # Strictly typed React components and application code
├── package.json             # Development, type-check, and build scripts
├── tsconfig.json            # Strict TypeScript configuration
└── README.md                # Documentation and instructions
```

## Files Overview
- React 18 components use TypeScript and TSX with strict compiler checks.
- `npm run typecheck` checks the frontend types without emitting files.
- The UI supports full CRUD operations against the Laravel REST endpoints.

## How to Run
1. Start the Laravel backend API:
   ```bash
   cd laravel-api
   php artisan serve --host=127.0.0.1 --port=8000
   ```
2. Install frontend dependencies and start Vite:
   ```bash
   cd vanilla-ajax-laravel
   npm install
   npm run dev
   ```
3. Open `http://localhost:5500` in your browser. Run `npm run typecheck` to check types or `npm run build` to produce a production build.
