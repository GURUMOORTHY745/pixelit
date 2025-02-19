const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer'); // Added Nodemailer
require('dotenv').config();

const { Admin, Member, Coordinator, UpcomingEvent, ClubGame, Contact } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.SECRET_KEY;
const MONGO_URI = process.env.MONGO_URI;

app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files Setup
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir);
app.use('/uploads', express.static(uploadsDir));

const publicDir = path.join(__dirname, '..', 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
app.use(express.static(publicDir));

// File Upload Configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadsDir),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname))
});

const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm'];
        if (!allowedTypes.includes(file.mimetype)) {
            return cb(new Error('Unsupported file type'), false);
        }
        cb(null, true);
    }
});

// Database Connection
mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('✅ MongoDB connected'))
    .catch(err => console.error('❌ MongoDB connection error:', err));

// Authentication Middleware
function verifyToken(req, res, next) {
    const token = req.headers['authorization']?.split(" ")[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
}

// Admin Authentication Routes
app.put('/api/:collection/:id', verifyToken, upload.single('photo'), async (req, res) => {
    const { collection, id } = req.params;

    // Check if the collection exists in the models object
    if (!models[collection]) {
        return res.status(400).json({ message: 'Invalid collection name' });
    }

    try {
        const updateData = { ...req.body };

        // If a new file is uploaded, update the photo URL
        if (req.file) {
            updateData.photo = /uploads/${req.file.filename};
        }

        // Find and update the document
        const updatedItem = await models[collection].findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: ${collection.slice(0, -1)} not found });
        }

        res.json({ message: ${collection.slice(0, -1)} updated successfully, updatedItem });
    } catch (error) {
        console.error('Update error:', error);
        res.status(500).json({ message: Error updating ${collection.slice(0, -1)}, error });
    }
});
app.post('/api/:collection', verifyToken, async (req, res) => {
    const { collection } = req.params;

    if (!models[collection]) {
        return res.status(400).json({ message: 'Invalid collection name' });
    }

    try {
        const data = { ...req.body };

        // Ensure the data contains a valid URL for the photo (if provided)
        if (data.photo && !data.photo.startsWith('http')) {
            return res.status(400).json({ message: 'Invalid photo URL' });
        }

        const newItem = new models[collection](data);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        res.status(500).json({ message: `Error creating ${collection.slice(0, -1)}`, error });
    }
});


// CRUD Operations for Models
const models = {
    members: Member,
    coordinators: Coordinator,
    upcomingEvents: UpcomingEvent,
    clubGames: ClubGame,
    contacts: Contact
};

Object.entries(models).forEach(([route, Model]) => {
    app.get(`/api/${route}`, async (req, res) => {
        try {
            const items = await Model.find();
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: `Error fetching ${route}`, error });
        }
    });
    // Generic Update Route for All Collections
app.put('/api/:collection/:id', verifyToken, async (req, res) => {
    const { collection, id } = req.params;

    if (!models[collection]) {
        return res.status(400).json({ message: 'Invalid collection name' });
    }

    try {
        const updateData = { ...req.body };

        // Ensure the provided photo is a valid URL (if given)
        if (updateData.photo && !updateData.photo.startsWith('http')) {
            return res.status(400).json({ message: 'Invalid photo URL' });
        }

        const updatedItem = await models[collection].findByIdAndUpdate(id, updateData, { new: true });

        if (!updatedItem) {
            return res.status(404).json({ message: `${collection.slice(0, -1)} not found` });
        }

        res.json(updatedItem);
    } catch (error) {
        res.status(500).json({ message: `Error updating ${collection.slice(0, -1)}`, error });
    }
});


// Generic Delete Route for All Collections
app.delete('/api/:collection/:id', verifyToken, async (req, res) => {
    const { collection, id } = req.params;

    // Validate collection name
    if (!models[collection]) {
        return res.status(400).json({ message: 'Invalid collection name' });
    }

    try {
        const deletedItem = await models[collection].findByIdAndDelete(id);
        if (!deletedItem) {
            return res.status(404).json({ message: `${collection.slice(0, -1)} not found` });
        }
        res.json({ message: `${collection.slice(0, -1)} deleted successfully` });
    } catch (error) {
        res.status(500).json({ message: `Error deleting ${collection.slice(0, -1)}`, error });
    }
});

    app.post(`/api/${route}`, verifyToken, upload.fields([{ name: 'photo' }, { name: 'media' }]), async (req, res) => {
        try {
            const data = { ...req.body };
            if (req.files['photo']) data.photo = `/uploads/${req.files['photo'][0].filename}`;
            if (req.files['media']) data.media = `/uploads/${req.files['media'][0].filename}`;
            const newItem = new Model(data);
            await newItem.save();
            res.status(201).json(newItem);
        } catch (error) {
            res.status(500).json({ message: `Error creating ${route.slice(0, -1)}`, error });
        }
    });
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

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

// Serve Index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Start the Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
