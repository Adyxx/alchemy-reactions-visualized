# alchemy-reactions-visualized

Frontend: Vite + React + TypeScript with React Flow.
Backend: Django, with the Element model managed through Django admin.

## Start the frontend

```bash
npm install
npm run dev
```

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
"# alchemy-reactions-visualized" 
