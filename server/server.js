const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const multer = require('multer');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

dotenv.config();

const { Admin, Member, Coordinator, UpcomingEvent, ClubGame, Contact } = require('./models');

const app = express();
const PORT = process.env.PORT || 5001;
const SECRET_KEY = process.env.SECRET_KEY;
const MONGO_URI = process.env.MONGO_URI;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Cloudinary Configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary Storage Configuration
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'PIXELIT',
        allowedFormats: ['jpg', 'png', 'jpeg', 'mp4', 'webm']
    }
});

const upload = multer({ storage });

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

// Admin Login
app.post('/api/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const admin = await Admin.findOne({ username });
        if (!admin || !await bcrypt.compare(password, admin.password)) {
            return res.status(401).json({ message: 'Invalid username or password' });
        }
        const token = jwt.sign({ id: admin._id }, SECRET_KEY, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ message: 'Error logging in', error });
    }
});

// Models
const models = {
    members: Member,
    coordinators: Coordinator,
    upcomingEvents: UpcomingEvent,
    clubGames: ClubGame,
    contacts: Contact
};

// GET All Data from Collections
Object.entries(models).forEach(([route, Model]) => {
    app.get(`/api/${route}`, async (req, res) => {
        try {
            const items = await Model.find();
            res.json(items);
        } catch (error) {
            res.status(500).json({ message: `Error fetching ${route}`, error });
        }
    });

    // Create New Document with Cloudinary Upload
    app.post(`/api/${route}`, verifyToken, upload.fields([{ name: 'photo' }, { name: 'media' }]), async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.files['photo']) data.photo = req.files['photo'][0].path;
        if (req.files['media']) data.media = req.files['media'][0].path;

        const newItem = new Model(data);
        await newItem.save();
        res.status(201).json(newItem);
    } catch (error) {
        console.error(`❌ Error creating ${route.slice(0, -1)}:`, error);  // Log full error
        res.status(500).json({ message: `Error creating ${route.slice(0, -1)}`, error: error.message || error });
    }
});


    // Update Document with Cloudinary Upload
    app.put(`/api/${route}/:id`, verifyToken, upload.fields([{ name: 'photo' }, { name: 'media' }]), async (req, res) => {
        const { id } = req.params;
        try {
            let updateData = { ...req.body };
            if (req.files['photo']) updateData.photo = req.files['photo'][0].path;
            if (req.files['media']) updateData.media = req.files['media'][0].path;

            const updatedItem = await Model.findByIdAndUpdate(id, updateData, { new: true });
            if (!updatedItem) return res.status(404).json({ message: `${route.slice(0, -1)} not found` });

            res.json(updatedItem);
        } catch (error) {
            res.status(500).json({ message: `Error updating ${route.slice(0, -1)}`, error });
        }
    });

    // Delete Document
    app.delete(`/api/${route}/:id`, verifyToken, async (req, res) => {
        const { id } = req.params;
        try {
            const deletedItem = await Model.findByIdAndDelete(id);
            if (!deletedItem) return res.status(404).json({ message: `${route.slice(0, -1)} not found` });

            res.json({ message: `${route.slice(0, -1)} deleted successfully` });
        } catch (error) {
            res.status(500).json({ message: `Error deleting ${route.slice(0, -1)}`, error });
        }
    });
});

// Nodemailer Configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Send Contact Query via Email
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
const publicDir = path.join(__dirname, '..', 'public');
app.use(express.static(publicDir));
app.get('/', (req, res) => {
    res.sendFile(path.join(publicDir, 'index.html'));
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
