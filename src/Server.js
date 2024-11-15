// server.js or wherever your API endpoint is defined
const express = require('express');
const { createUser } = require('./cosmosClient');
const app = express();
const cors = require('cors');
app.use(cors({ origin: 'http://localhost:3000' }));


app.use(express.json());

app.post('/signup', async (req, res) => {
    try {
        const userData = req.body;
        const newUser = await createUser(userData);
        res.status(201).json({ message: 'User signed up successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create user' });
    }
});

app.listen(3000, () => console.log('Server running on port 3000'));
