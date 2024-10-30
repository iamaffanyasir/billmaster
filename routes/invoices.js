const express = require('express');
const router = express.Router();
const Invoice = require('../models/Invoice');
const Client = require('../models/Client');
const Activity = require('../models/Activity');
const Project = require('../models/Project');

// GET all invoices
router.get('/', async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('clientId').sort({ createdAt: -1 });
        res.render('invoices/index', { 
            title: 'Manage Invoices',
            invoices: invoices
        });
    } catch (error) {
        console.error('Error fetching invoices:', error);
        res.status(500).render('error', {
            message: 'Error fetching invoices',
            error: error
        });
    }
});

// GET invoice creation form
router.get('/new', async (req, res) => {
    try {
        const clients = await Client.find().sort({ name: 1 });
        res.render('invoices/new', { 
            title: 'Generate New Invoice',
            clients: clients
        });
    } catch (error) {
        console.error('Error loading invoice form:', error);
        res.status(500).render('error', {
            message: 'Error loading invoice form',
            error: error
        });
    }
});

// POST new invoice
router.post('/', async (req, res) => {
    try {
        console.log('Received invoice data:', req.body); // Debug log

        // Find client and project
        const [client, project] = await Promise.all([
            Client.findById(req.body.clientId),
            Project.findById(req.body.projectId)
        ]);

        if (!client || !project) {
            throw new Error('Client or Project not found');
        }

        // Process invoice items
        const items = [];
        if (Array.isArray(req.body.items)) {
            for (let i = 0; i < req.body.items.length; i++) {
                const item = req.body.items[i];
                const quantity = parseFloat(item.quantity) || 0;
                const rate = parseFloat(item.rate) || 0;
                items.push({
                    description: item.description,
                    quantity: quantity,
                    rate: rate,
                    amount: quantity * rate
                });
            }
        }

        // Create invoice
        const newInvoice = new Invoice({
            invoiceNumber: `INV-${Date.now()}`,
            clientId: client._id,
            projectId: project._id,
            clientName: client.name,
            clientEmail: client.email,
            projectName: project.name,
            amount: parseFloat(req.body.amount),
            items: items,
            dueDate: new Date(req.body.dueDate),
            status: 'pending',
            createdAt: new Date(),
            updatedAt: new Date()
        });

        console.log('Creating invoice:', newInvoice); // Debug log

        // Save invoice
        await newInvoice.save();

        // Create activity log
        const activity = new Activity({
            description: `New invoice ${newInvoice.invoiceNumber} generated for ${newInvoice.clientName}`,
            type: 'invoice',
            status: 'pending',
            relatedId: newInvoice._id
        });
        await activity.save();

        // Create email HTML
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Invoice from BillMaster</h1>
                <p>Dear ${client.name},</p>
                <p>Please find your invoice details below:</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Invoice Number:</strong> ${newInvoice.invoiceNumber}</p>
                    <p><strong>Amount:</strong> $${newInvoice.amount.toLocaleString()}</p>
                    <p><strong>Due Date:</strong> ${newInvoice.dueDate.toLocaleDateString()}</p>
                    
                    <h3>Invoice Items:</h3>
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead>
                            <tr>
                                <th style="text-align: left;">Description</th>
                                <th style="text-align: right;">Quantity</th>
                                <th style="text-align: right;">Rate</th>
                                <th style="text-align: right;">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${items.map(item => `
                                <tr>
                                    <td>${item.description}</td>
                                    <td style="text-align: right;">${item.quantity}</td>
                                    <td style="text-align: right;">$${item.rate.toLocaleString()}</td>
                                    <td style="text-align: right;">$${item.amount.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                        <tfoot>
                            <tr>
                                <td colspan="3" style="text-align: right;"><strong>Total:</strong></td>
                                <td style="text-align: right;"><strong>$${newInvoice.amount.toLocaleString()}</strong></td>
                            </tr>
                        </tfoot>
                    </table>
                </div>

                <p>Please process the payment before the due date.</p>
                <p>Thank you for your business!</p>
            </div>
        `;

        // Send email
        await req.app.locals.sendEmail(
            client.email,
            `Invoice ${newInvoice.invoiceNumber} from BillMaster`,
            `Your invoice ${newInvoice.invoiceNumber} for $${newInvoice.amount} is due on ${newInvoice.dueDate.toLocaleDateString()}`,
            emailHtml
        );

        res.redirect('/invoices');
    } catch (error) {
        console.error('Error creating invoice:', error);
        
        // Get clients for re-rendering the form
        const clients = await Client.find().sort({ name: 1 });
        
        res.status(500).render('invoices/new', {
            title: 'Generate New Invoice',
            clients: clients,
            error: 'Failed to create and send invoice: ' + error.message
        });
    }
});

// GET invoice details
router.get('/:id', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('clientId');
        if (!invoice) {
            return res.status(404).render('error', {
                message: 'Invoice not found',
                error: { status: 404 }
            });
        }
        res.render('invoices/detail', { invoice, title: 'Invoice Details' });
    } catch (error) {
        console.error('Error fetching invoice:', error);
        res.status(500).render('error', {
            message: 'Error fetching invoice details',
            error: error
        });
    }
});

// POST resend invoice email
router.post('/:id/resend', async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('clientId');
        if (!invoice) {
            return res.status(404).json({ success: false, message: 'Invoice not found' });
        }

        // Create email HTML
        const emailHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #333;">Invoice Reminder from BillMaster</h1>
                <p>Dear ${invoice.clientName},</p>
                <p>This is a reminder about your pending invoice:</p>
                
                <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
                    <p><strong>Invoice Number:</strong> ${invoice.invoiceNumber}</p>
                    <p><strong>Amount:</strong> $${invoice.amount.toLocaleString()}</p>
                    <p><strong>Due Date:</strong> ${new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>

                <p>Please process the payment as soon as possible.</p>
                <p>Thank you for your business!</p>
                
                <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="color: #666; font-size: 12px;">This is an automated reminder from BillMaster</p>
                </div>
            </div>
        `;

        // Send reminder email
        await req.app.locals.sendEmail(
            invoice.clientEmail,
            `Reminder: Invoice ${invoice.invoiceNumber} from BillMaster`,
            `Reminder: Your invoice ${invoice.invoiceNumber} for $${invoice.amount} is due on ${new Date(invoice.dueDate).toLocaleDateString()}`,
            emailHtml
        );

        res.json({ success: true, message: 'Reminder sent successfully' });
    } catch (error) {
        console.error('Error sending reminder:', error);
        res.status(500).json({ 
            success: false, 
            message: 'Failed to send reminder: ' + error.message 
        });
    }
});

// PUT update invoice status
router.put('/:id/status', async (req, res) => {
    try {
        // Log incoming request
        console.log('Status update request:', {
            id: req.params.id,
            body: req.body,
            headers: req.headers
        });

        // Validate request body
        if (!req.body || !req.body.status) {
            return res.status(400).json({
                success: false,
                message: 'Status is required'
            });
        }

        const { status } = req.body;

        // Validate status value
        if (!['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Find invoice and update only the status field
        const invoice = await Invoice.findByIdAndUpdate(
            req.params.id,
            { 
                $set: { 
                    status: status,
                    updatedAt: new Date(),
                    paidAt: status === 'paid' ? new Date() : undefined
                }
            },
            { 
                new: true,
                runValidators: false // Disable validation since we're only updating status
            }
        );

        if (!invoice) {
            console.log('Invoice not found:', req.params.id);
            return res.status(404).json({
                success: false,
                message: 'Invoice not found'
            });
        }

        console.log('Invoice updated:', invoice);

        // Update associated project
        if (invoice.projectId) {
            const project = await Project.findById(invoice.projectId);
            if (project) {
                project.status = status === 'paid' ? 'completed' : 'ongoing';
                await project.save();
                console.log('Project status updated:', project);
            }
        }

        // Create activity log
        const activity = new Activity({
            description: `Invoice ${invoice.invoiceNumber} marked as ${status}`,
            type: 'invoice',
            status: status,
            relatedId: invoice._id
        });
        await activity.save();
        console.log('Activity log created:', activity);

        // Send success response
        res.json({
            success: true,
            message: 'Invoice status updated successfully',
            invoice: invoice
        });

    } catch (error) {
        console.error('Error updating invoice status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update invoice status: ' + error.message,
            error: error.stack
        });
    }
});

// Make sure to export only the router
module.exports = router; 