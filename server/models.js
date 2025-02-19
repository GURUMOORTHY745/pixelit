const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    role: { type: String, required: true },
    photo: { type: String }
});

const coordinatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    photo: { type: String }
});

const upcomingEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    link: { type: String },
    photo: { type: String }
});

const clubGameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    author: { type: String, required: true },
    link: { type: String }, // Added link field
    photo: { type: String },
    media: { type: String }
});



const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    photo: { type: String }
});

module.exports = {
    Admin: mongoose.model('Admin', adminSchema),
    Member: mongoose.model('Member', memberSchema),
    Coordinator: mongoose.model('Coordinator', coordinatorSchema),
    UpcomingEvent: mongoose.model('UpcomingEvent', upcomingEventSchema),
    ClubGame: mongoose.model('ClubGame', clubGameSchema),
    Contact: mongoose.model('Contact', contactSchema)
}; 
