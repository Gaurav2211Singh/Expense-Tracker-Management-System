# Expense Tracker Management System

A full-stack expense tracking application built with FastAPI, PostgreSQL, and JavaScript.

## Features

- User authentication with JWT
- CRUD operations for expenses
- Responsive UI with Fetch API integration
- PostgreSQL database integration

## Prerequisites

- Python 3.8+
- PostgreSQL
- Node.js (for development)

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a PostgreSQL database and update the connection string in `.env` file:
```
DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker
SECRET_KEY=your-secret-key-here
```

4. Run the application:
```bash
uvicorn app.main:app --reload
```

5. Open `http://localhost:8000` in your browser

## Project Structure

```
expense_tracker/
├── app/
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── database.py
│   └── routers/
│       ├── auth.py
│       └── expenses.py
├── static/
│   ├── css/
│   └── js/
├── templates/
├── requirements.txt
└── .env
```

## API Documentation

Once the server is running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc` 