const express = require('express');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/database');

// Load environment variables
dotenv.config();

// Get PORT from environment variables
const PORT = process.env.PORT || 3000;

// Verify environment variables
if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.MONGODB_URI) {
    console.error('Missing required environment variables. Please check your .env file.');
    process.exit(1);
}

const app = express();

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', './views');

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));

// Configure Nodemailer
const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE,
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    tls: {
        rejectUnauthorized: false
    }
});

// Email sending function
const sendEmail = async (to, subject, text, html) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
            html
        };
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent:', info.messageId);
        return info;
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

// Make sendEmail available throughout the application
app.locals.sendEmail = sendEmail;

// Import routes
const clientsRouter = require('./routes/clients');
const projectsRouter = require('./routes/projects');
const invoicesRouter = require('./routes/invoices');
const settingsRouter = require('./routes/settings');

// Add this middleware before your routes
app.use((req, res, next) => {
    // Set path for all routes
    res.locals.path = req.originalUrl;
    // Set title for all routes
    res.locals.title = 'BillMaster';
    next();
});

// Then your existing routes
app.use('/clients', (req, res, next) => {
    res.locals.path = '/clients';
    next();
}, clientsRouter);

app.use('/projects', (req, res, next) => {
    res.locals.path = '/projects';
    next();
}, projectsRouter);

app.use('/invoices', (req, res, next) => {
    res.locals.path = '/invoices';
    next();
}, invoicesRouter);

app.use('/settings', (req, res, next) => {
    res.locals.path = '/settings';
    next();
}, settingsRouter);

// Home route
app.get('/', async (req, res) => {
    try {
        const Client = require('./models/Client');
        const Project = require('./models/Project');
        const Invoice = require('./models/Invoice');
        const Activity = require('./models/Activity');

        // Fetch all required data
        const [clients, projects, invoices, activities] = await Promise.all([
            Client.find(),
            Project.find().populate('clientId'),
            Invoice.find(),
            Activity.find()
                .sort({ createdAt: -1 })  // Sort by most recent first
                .limit(10)  // Limit to 10 most recent activities
                .populate('relatedId')  // Populate related document references
        ]);

        // Format activities for display
        const recentActivity = activities.map(activity => {
            let formattedActivity = {
                type: activity.type,
                description: activity.description,
                date: activity.createdAt,
                status: activity.status
            };

            // Add additional context based on activity type
            switch (activity.type) {
                case 'invoice':
                    if (activity.relatedId) {
                        formattedActivity.description = `Invoice #${activity.relatedId.invoiceNumber} ${activity.status}`;
                        formattedActivity.amount = activity.relatedId.amount;
                    }
                    break;
                case 'project':
                    if (activity.relatedId) {
                        formattedActivity.description = `Project "${activity.relatedId.name}" ${activity.status}`;
                    }
                    break;
                case 'client':
                    if (activity.relatedId) {
                        formattedActivity.description = `Client "${activity.relatedId.name}" ${activity.status}`;
                    }
                    break;
            }

            return formattedActivity;
        });

        // Calculate total revenue from all paid invoices
        const totalRevenue = invoices
            .filter(invoice => invoice.status === 'paid')
            .reduce((sum, invoice) => sum + (invoice.amount || 0), 0);

        // Calculate project statistics
        const projectStats = {
            active: projects.filter(p => p.status === 'active').length,
            ongoing: projects.filter(p => p.status === 'ongoing').length,
            completed: projects.filter(p => p.status === 'completed').length,
            total: projects.length
        };

        // Calculate invoice statistics
        const invoiceStats = {
            pending: invoices.filter(i => i.status === 'pending').length,
            overdue: invoices.filter(i => 
                i.status === 'pending' && 
                new Date(i.dueDate) < new Date()
            ).length,
            total: invoices.length
        };

        // Debug logs
        console.log('Recent Activities:', recentActivity);
        console.log('Total Revenue:', totalRevenue);
        console.log('Project Statistics:', projectStats);
        console.log('Invoice Statistics:', invoiceStats);

        res.render('index', {
            title: 'BillMaster Dashboard',
            path: '/',
            clients,
            projects,
            invoices,
            recentActivity,  // Pass formatted activities
            totalRevenue,
            projectStats,
            invoiceStats,
            error: null
        });

    } catch (error) {
        console.error('Error in dashboard route:', error);
        res.render('index', {
            title: 'BillMaster Dashboard',
            path: '/',
            clients: [],
            projects: [],
            invoices: [],
            recentActivity: [],
            totalRevenue: 0,
            projectStats: { ongoing: 0, completed: 0, total: 0 },
            invoiceStats: { pending: 0, overdue: 0, total: 0 },
            error: 'Error loading dashboard data'
        });
    }
});

// Connect to MongoDB and start server
connectDB()
    .then(() => {
        // Start server only after successful database connection
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            console.log('Environment:', process.env.NODE_ENV || 'development');
            console.log('MongoDB connected successfully');
        });
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
        process.exit(1);
    });

// Graceful shutdown
process.on('SIGINT', async () => {
    try {
        await mongoose.connection.close();
        console.log('MongoDB connection closed through app termination');
        process.exit(0);
    } catch (err) {
        console.error('Error during shutdown:', err);
        process.exit(1);
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(err.status || 500).render('error', {
        message: err.message || 'Something went wrong',
        error: err
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).render('error', {
        message: 'Page not found',
        error: { status: 404 }
    });
});

module.exports = app;