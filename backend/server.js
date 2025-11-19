const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const ConnectDB = require('./database/db');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categoryRoute');
const expenseRoutes = require('./routes/expenseRoute');
const budgetRoutes = require('./routes/budgetRoute');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 6000;

// Middlewares
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));

app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/budgets', budgetRoutes);


app.listen(PORT, () => {
    ConnectDB()
    console.log(`Server is listening on port ${PORT}`)
});