# React 18 & Vanilla AJAX Projects for Laravel API (Full CRUD)

This folder contains two versions of the client-side front-end that connect to the Laravel RESTful API backend.

## Project Structure
```
vanilla-ajax-laravel/
├── index.html               # React 18 Application (Declarative UI, React Hooks, JSX, Bootstrap 5)
├── index.vanilla.html.bak   # Original Vanilla JS backup (Imperative DOM manipulation & Fetch API)
└── README.md                # Documentation & instructions
```

## Files Overview
1. **`index.html` (Active - React 18 Framework)**:
   - Uses **React 18** and **Babel** directly via CDN without requiring npm build tools.
   - Declarative state-driven UI using modern React Hooks (`useState`, `useEffect`, `useRef`).
   - Supports full CRUD operations (Create, Read, Update, Delete) against MySQL via Laravel REST endpoints.
2. **`index.vanilla.html.bak` (Archived Reference)**:
   - Contains the previous complete, annotated Vanilla JS implementation with manual DOM manipulation and Fetch API for reference and comparison.

## How to Run
1. Start the Laravel backend API:
   ```bash
   cd laravel-api
   php artisan serve --host=127.0.0.1 --port=8000
   ```
2. Serve the front-end application:
   ```bash
   cd vanilla-ajax-laravel
   npx serve -l 3000
   ```
3. Open `http://localhost:3000` in your browser.
