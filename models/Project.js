const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    deadline: {
        type: Date,
        required: true
    },
    budget: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['ongoing', 'completed'],
        default: 'ongoing'
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Project', projectSchema); 