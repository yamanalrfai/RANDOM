// Expense Tracker - backend (Express API + PostgreSQL)
require('dotenv').config();
const { Pool } = require('pg');
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

const pool = new Pool({
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_DATABASE
});

const allowedCategories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

app.get('/api/expenses', async (req, res) => {
    try {
        const query = `
            SELECT *
            FROM expenses 
            ORDER BY date DESC, id DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while fetching expenses" });
    }
});

app.get('/api/expenses/:id', async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(404).json({ error: "Invalid expense ID" });
    }

    try {
        const query = `
            SELECT *
            FROM expenses 
            WHERE id = $1
        `;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while fetching expense" });
    }
});

app.post('/api/expenses', async (req, res) => {
    const { title, amount, category, date } = req.body;

    if (!title || title.trim() === '') {
        return res.status(400).json({ error: "Title is required" });
    }
    if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Amount must be a number greater than 0" });
    }
    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ error: "Invalid category selected" });
    }
    if (!date) {
        return res.status(400).json({ error: "Date is required" });
    }

    try {
        const query = `
            INSERT INTO expenses (title, amount, category, date) 
            VALUES ($1, $2, $3, $4)
            RETURNING *;
        `;
        const result = await pool.query(query, [title, amount, category, date]);
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while adding expense" });
    }
});

app.put('/api/expenses/:id', async (req, res) => {
    const id = req.params.id;
    const { title, amount, category, date } = req.body;

    if (isNaN(id)) {
        return res.status(404).json({ error: "Invalid expense ID" });
    }

    // Identical validation to POST route
    if (!title || title.trim() === '') return res.status(400).json({ error: "Title is required" });
    if (isNaN(amount) || amount <= 0) return res.status(400).json({ error: "Amount must be greater than 0" });
    if (!allowedCategories.includes(category)) return res.status(400).json({ error: "Invalid category" });
    if (!date) return res.status(400).json({ error: "Date is required" });

    try {
        const query = `
            UPDATE expenses 
            SET title = $1, amount = $2, category = $3, date = $4 
            WHERE id = $5 
            RETURNING *;
        `;
        const result = await pool.query(query, [title, amount, category, date, id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while updating expense" });
    }
});

app.delete('/api/expenses/:id', async (req, res) => {
    const id = req.params.id;

    if (isNaN(id)) {
        return res.status(404).json({ error: "Invalid expense ID" });
    }

    try {
        const query = `DELETE FROM expenses WHERE id = $1
        RETURNING id`;
        const result = await pool.query(query, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "Expense not found" });
        }

        res.json({ message: "Expense deleted successfully", deletedId: id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error while deleting expense" });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});