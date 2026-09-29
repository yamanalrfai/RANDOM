# Expense Tracker

A full-stack web application built to track personal expenses, allowing users to log, categorize, and monitor their spending. Developed as the final project for the Dalil Training Academy Full Stack Web Development program, it features a responsive UI, a robust Express API, and seamless PostgreSQL integration.

## How to run

**Database**
1. Open pgAdmin and create a new database named `expense_tracker`.
2. Open the Query Tool for the new database, paste the contents of `backend/schema.sql`, and execute it to create the `expenses` table and seed the initial data.

**Backend**
1. Navigate into the `backend` folder in your terminal.
2. Duplicate the `.env.example` file, rename it to `.env`, and fill in your PostgreSQL database credentials (specifically `DB_PASSWORD`).
3. Run `npm install` to install all necessary dependencies (Express, pg, cors, dotenv).
4. Run `npm start` (or `node server.js`) to start the server on `http://localhost:3000`.

**Frontend**
1. Navigate to the `frontend` folder in VS Code.
2. Right-click `index.html` and select **"Open with Live Server"** to launch the application in your browser. 
*(Note: Ensure any active browser VPN extensions are temporarily disabled, as they can block the frontend from communicating with the local backend).*

## Features

- [x] Add an expense (with validation)
- [x] Delete an expense
- [x] Edit an expense
- [x] Filter by category
- [x] Summary cards (total, count, highest)
- [x] Data is saved in a PostgreSQL database
- [x] **Bonus:** Export expenses to a downloadable CSV file

## Screenshots

*(Replace these placeholders with your actual screenshots before submitting)*
* `![Desktop View](./screenshoot/desktop-view.png)`
* `![Mobile View](./screenshoot/mobile-view.png)`

## What was the hardest part?

The most challenging part of the project was managing data types and formatting as information moved between PostgreSQL, the Express server, and the frontend JavaScript. For example, the `pg` library returns numeric database columns as strings, which caused the JavaScript `.toFixed()` method to crash until I learned to explicitly wrap the variables in `Number()`. Similarly, PostgreSQL sends dates as full ISO timestamps (`2026-02-06T21:00:00.000Z`), which broke the UI and the HTML `<input type="date">` fields. I solved this by using JavaScript's `.split('T')[0]` on the frontend to extract just the readable date segment before rendering the table or opening the edit modal.