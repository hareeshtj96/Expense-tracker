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

const allowedOrigins = process.env.CLIENT_URLS.split(",").map(url => url.trim());

// Middlewares
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);

        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error("Not allowed by CORS: " + origin));
    },
    credentials: true,
    optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

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