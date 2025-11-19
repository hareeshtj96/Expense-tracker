**Expense Tracker**

It is a simple budgeting app — create categories with monthly budgets, add expenses, and view monthly summaries showing spending vs budget.

**Live demo**

Website (frontend): https://expense-tracker-sigma-eight-12.vercel.app/

API (backend): https://expense-trackers-s5ur.onrender.com/api

**Tech stack**

Frontend: React (Vite), Tailwind CSS, Recharts

Backend: Node.js + Express 

DB: MongoDB (Atlas)

Auth: JWT cookie sessions


**Run Commands**

git clone https://github.com/hareeshtj96/Expense-tracker.git
cd Expense-tracker

**Backend**
cd backend
npm install
npm start

**Frontend**
cd frontend
npm install
npm run dev


**Auth API**

**Signup**

POST /auth/signup

Creates a new user.
Example Request:

POST https://expense-trackers-s5ur.onrender.com/api/auth/signup
Content-Type: application/json
{
  "name": "Hareesh",
  "email": "hareesh@example.com",
  "password": "123456"
}

**Login**

POST /auth/login

POST https://expense-trackers-s5ur.onrender.com/api/auth/login
Content-Type: application/json

{
  "email": "hareesh@example.com",
  "password": "123456"
}

**Logout**

POST /auth/logout

POST https://expense-trackers-s5ur.onrender.com/api/auth/logout

**Verify Auth**

GET /auth/verify

Headers: Cookie-based auth (credentials: include)

GET https://expense-trackers-s5ur.onrender.com/api/auth/verify


Response Example:

{
  "status": "success",
  "authed": true,
}

**Categories API**

Base URL: /api/categories

**List Categories**
GET /categories
GET https://expense-trackers-s5ur.onrender.com/api/categories

**Create Category**

POST /categories
POST https://expense-trackers-s5ur.onrender.com/api/categories
Content-Type: application/json
{
  "name": "Food",
  "color": "#FF5733",
  "budget": 5000
}

**Update Category**

PUT /categories/:id
PUT https://expense-trackers-s5ur.onrender.com/api/categories/673b18c8f4
Content-Type: application/json

{
  "name": "Groceries",
  "color": "#00A3FF",
  "budget": 6000,
}

**Delete Category**
DELETE /categories/:id

DELETE https://expense-trackers-s5ur.onrender.com/api/categories/673b18c8f4


**Budgets API**

Base URL: /api/budgets

**List Budgets for Month**

GET /budgets?month=2024-11

GET https://expense-trackers-s5ur.onrender.com/api/budgets?month=2024-11

**Create or Update Budget**

POST /budgets
POST https://expense-trackers-s5ur.onrender.com/api/budgets
Content-Type: application/json

{
  "categoryId": "673b18c8f4",
  "amount": 5000,
  "month": "2024-11"
}

**Delete Budget**
DELETE /budgets/:id

DELETE https://expense-trackers-s5ur.onrender.com/api/budgets/673b18c8f4


**Expenses API**

Base URL: /api/expenses

**List Expenses**

GET /expenses?month=2024-11

GET https://expense-trackers-s5ur.onrender.com/api/expenses?month=2024-11

**Create Expense**

POST /expenses
POST https://expense-trackers-s5ur.onrender.com/api/expenses
Content-Type: application/json

{
  "title": "Lunch",
  "categoryId": "673b18c8f4",
  "amount": 250,
  "date": "2024-11-15"
}

**Update Expense**

PUT /expenses/:id
PUT https://expense-trackers-s5ur.onrender.com/api/expenses/673b190abc
Content-Type: application/json

{
  "title": "Lunch at Subway",
  "amount": 300
}

**Delete Expense**

DELETE /expenses/:id

DELETE https://expense-trackers-s5ur.onrender.com/api/expenses/673b190abc
