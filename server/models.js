const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
    username: { type: String, required: true },
    password: { type: String, required: true }
});

const memberSchema = new mongoose.Schema({
    name: { type: String, required: true },
    registrationNumber: { type: String, required: true },
    role: { type: String, required: true },
    photo: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
        }
    }
});

const coordinatorSchema = new mongoose.Schema({
    name: { type: String, required: true },
    department: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    photo: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
        }
    }
});

const upcomingEventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    link: { type: String },
    photo: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
        }
    }
});

const clubGameSchema = new mongoose.Schema({
    title: { type: String, required: true },
    genre: { type: String, required: true },
    author: { type: String, required: true },
    link: { type: String },
    photo: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
        }
    },
    media: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/.*\.(?:mp4|webm|ogg))$/.test(v);
            },
            message: props => `${props.value} is not a valid media URL!`
        }
    }
});




const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    phone: { type: String, required: true },
    photo: { 
        type: String,
        validate: {
            validator: function(v) {
                return !v || /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/.test(v);
            },
            message: props => `${props.value} is not a valid image URL!`
        }
    }
});

module.exports = {
    Admin: mongoose.model('Admin', adminSchema),
    Member: mongoose.model('Member', memberSchema),
    Coordinator: mongoose.model('Coordinator', coordinatorSchema),
    UpcomingEvent: mongoose.model('UpcomingEvent', upcomingEventSchema),
    ClubGame: mongoose.model('ClubGame', clubGameSchema),
    Contact: mongoose.model('Contact', contactSchema)
};
