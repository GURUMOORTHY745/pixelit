const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const nodemailer = require('nodemailer');

const { Admin, Member, Coordinator, UpcomingEvent, ClubGame, Contact } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.SECRET_KEY;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Connect to MongoDB
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// ✅ Authentication Middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(" ")[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
}

// ✅ Admin Login Route (No Hashing)
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin || password !== admin.password) { // Removed bcrypt
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: admin._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// ✅ Models for CRUD Operations
const models = {
    members: Member,
    coordinators: Coordinator,
    upcomingEvents: UpcomingEvent,
    clubGames: ClubGame,
    contacts: Contact
};

// ✅ Generic CRUD Routes (Without File Uploads)
Object.entries(models).forEach(([route, Model]) => {
    // 🔹 GET All Documents
    app.get(`/api/${route}`, async (req, res) => {
        try {
            const items = await Model.find();
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: `Error fetching ${route}`, error });
        }
    });

    // 🔹 POST (Create New Document)
    app.post(`/api/${route}`, verifyToken, async (req, res) => {
        try {
            const newItem = new Model(req.body);
            await newItem.save();
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ message: `Error creating ${route.slice(0, -1)}`, error });
        }
    });

    // 🔹 PUT (Update Existing Document)
    app.put(`/api/${route}/:id`, verifyToken, async (req, res) => {
        try {
            const updatedItem = await Model.findByIdAndUpdate(req.params.id, req.body, { new: true });
            if (!updatedItem) {
                return res.status(404).json({ message: `${route.slice(0, -1)} not found` });
            }
            res.json(updatedItem);
        } catch (error) {
            res.status(500).json({ message: `Error updating ${route.slice(0, -1)}`, error });
        }
    });

    // 🔹 DELETE (Remove Document)
    app.delete(`/api/${route}/:id`, verifyToken, async (req, res) => {
        try {
            const deletedItem = await Model.findByIdAndDelete(req.params.id);
            if (!deletedItem) {
                return res.status(404).json({ message: `${route.slice(0, -1)} not found` });
            }
            res.json({ message: `${route.slice(0, -1)} deleted successfully` });
        } catch (error) {
            res.status(500).json({ message: `Error deleting ${route.slice(0, -1)}`, error });
        }
    });
});

// ✅ Nodemailer Setup (For Queries)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ✅ Contact Form (Send Query)
app.post('/api/send-query', async (req, res) => {
    const { name, email, message } = req.body;
    if (!name || !email || !message) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: 'pixelit@klu.ac.in',
        subject: `New Query from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`
    };
    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Query sent successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Error sending email', error });
    }
});

// ✅ Serve `index.html`
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ✅ Start the Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
