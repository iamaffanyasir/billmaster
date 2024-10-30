const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: {
        type: String,
        required: true,
        unique: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    clientName: String,
    clientEmail: String,
    projectName: String,
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    items: [{
        description: String,
        quantity: Number,
        rate: Number,
        amount: Number
    }],
    dueDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue', 'cancelled'],
        default: 'pending'
    },
    paidAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

invoiceSchema.pre('save', async function(next) {
    if (this.isModified('status')) {
        try {
            const Project = mongoose.model('Project');
            const project = await Project.findById(this.projectId);
            
            if (project) {
                if (this.status === 'paid' && !this.paidAt) {
                    this.paidAt = new Date();
                    project.status = 'completed';
                } else if (this.status === 'pending') {
                    project.status = 'ongoing';
                    this.paidAt = undefined;
                }
                await project.save();
            }
        } catch (error) {
            console.error('Error updating project status:', error);
        }
    }
    next();
});

module.exports = mongoose.model('Invoice', invoiceSchema); 