const express = require("express");
const { Pool } = require('pg');
const userRoutes = require('./routes/user');

const app = express();
app.use(express.json());

// Set up database connection
const pool = new Pool({
    connectionString: 'postgresql://neondb_owner:nFoWJl4Iy6Bz@ep-dawn-sky-a5bowg63.us-east-2.aws.neon.tech/education?sslmode=require',
    ssl: {
        rejectUnauthorized: false // Allow self-signed certificates (only for development, remove in production)
    }
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Error connecting to the database', err);
    } else {
        console.log('Connected to the database');
    }
});

// Define routes
app.use("/user", userRoutes);

const port = 8000;
app.listen(port, () => {
    console.log(`App is listening on port ${port}`);
});
