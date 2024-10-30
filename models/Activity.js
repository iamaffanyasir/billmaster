const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
    description: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['client', 'project', 'invoice'],
        required: true
    },
    status: {
        type: String,
        enum: [
            'created',      // For new items
            'updated',      // For edited items
            'completed',    // For completed projects
            'pending',      // For pending invoices/projects
            'overdue',      // For overdue invoices
            'paid',         // For paid invoices
            'cancelled',    // For cancelled items
            'active',       // For active projects
            'ongoing'       // For ongoing projects
        ],
        default: 'created'
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'type',
        required: false
    }
});

// Add pre-save middleware for validation
activitySchema.pre('save', function(next) {
    // Define valid statuses for each type
    const validStatuses = {
        invoice: ['pending', 'paid', 'overdue', 'cancelled', 'created', 'updated'],
        project: ['active', 'ongoing', 'completed', 'cancelled', 'created', 'updated'],
        client: ['created', 'updated']
    };

    // Validate status based on type
    if (!validStatuses[this.type].includes(this.status)) {
        next(new Error(`Invalid status ${this.status} for ${this.type} activity`));
    }
    next();
});

module.exports = mongoose.model('Activity', activitySchema); 