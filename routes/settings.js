const express = require('express');
const router = express.Router();

// GET settings page
router.get('/', (req, res) => {
    res.render('settings', { 
        title: 'Settings',
        emailSettings: {
            emailService: process.env.EMAIL_SERVICE,
            emailUser: process.env.EMAIL_USER,
            emailHost: process.env.EMAIL_HOST,
            emailPort: process.env.EMAIL_PORT
        }
    });
});

// POST test email configuration
router.post('/test-email', async (req, res) => {
    try {
        const testEmail = req.body.testEmail || process.env.EMAIL_USER;
        await req.app.locals.sendEmail(
            testEmail,
            'Test Email from BillMaster',
            'This is a test email to verify your email configuration.',
            `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Test Email</h1>
                <p>If you receive this email, your email configuration is working correctly!</p>
                <p>Configuration details:</p>
                <ul>
                    <li>Service: ${process.env.EMAIL_SERVICE}</li>
                    <li>Host: ${process.env.EMAIL_HOST}</li>
                    <li>Port: ${process.env.EMAIL_PORT}</li>
                </ul>
            </div>
            `
        );
        res.json({ success: true, message: 'Test email sent successfully' });
    } catch (error) {
        console.error('Error sending test email:', error);
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST update notification settings
router.post('/notifications', (req, res) => {
    try {
        // Here you would typically save to database
        res.json({ success: true, message: 'Notification settings updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// POST update system settings
router.post('/system', (req, res) => {
    try {
        // Here you would typically save to database
        res.json({ success: true, message: 'System settings updated' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

module.exports = router;