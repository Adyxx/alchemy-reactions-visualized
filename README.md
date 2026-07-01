# alchemy-reactions-visualized

Frontend: Vite + React + TypeScript with React Flow.
Backend: Django, with the Element model managed through Django admin.

## Start the frontend

```bash
npm install
npm run dev
```

`npm run build` also exports the current graph data from `backend/db.sqlite3` into `public/elements.json`, so the site can be deployed statically on GitHub Pages without a live Django server.
For GitHub Pages deployment, `backend/db.sqlite3` should be committed with the latest data before running the build workflow.

## Start the backend

```bash
cd backend
python manage.py migrate
python manage.py runserver
```

Then open:

```text
http://localhost:8000/admin/
http://localhost:8000/health/
```

## Backend notes

The `Element` model is registered in Django admin so CRUD works there for now. The backend defaults to SQLite for local startup. Next step can be auth-backed edit/view permissions and an API for the React UI.

Each element now supports name, symbol, description, cost, aspect, and component links to other elements. In the admin, use the inline component rows on an element to define what it is made of. The frontend reads `/api/elements/` and renders the current graph from the database.
For GitHub Pages builds, the production app reads the generated `public/elements.json` file instead of calling Django directly.
