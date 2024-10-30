const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Activity = require('../models/Activity');

// GET all clients
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ createdAt: -1 });
        console.log('Fetched clients:', clients);
        res.render('clients', { 
            title: 'Manage Clients',
            clients: clients,
            path: '/clients'
        });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).render('error', { 
            message: 'Error fetching clients',
            error: error
        });
    }
});

// GET clients data (API endpoint for other routes to use)
router.get('/api/list', (req, res) => {
    try {
        res.json({ success: true, clients: clients });
    } catch (error) {
        console.error('Error fetching clients:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch clients' });
    }
});

// POST new client
router.post('/', async (req, res) => {
    try {
        const newClient = new Client({
            name: req.body.clientName,
            email: req.body.email,
            phone: req.body.phone,
            company: req.body.company,
            address: req.body.address,
            notes: req.body.notes
        });

        await newClient.save();

        // Create activity log
        const activity = new Activity({
            description: `New client ${newClient.name} added`,
            type: 'client',
            status: 'created',
            relatedId: newClient._id
        });
        await activity.save();

        console.log('New client saved:', newClient);
        res.redirect('/clients');
    } catch (error) {
        console.error('Error creating client:', error);
        res.status(500).render('error', { 
            message: 'Error creating client',
            error: error
        });
    }
});

// DELETE client
router.delete('/:id', async (req, res) => {
    try {
        console.log('Attempting to delete client:', req.params.id);
        const result = await Client.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Client not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting client:', error);
        res.status(500).json({ success: false, message: 'Error deleting client' });
    }
});

// GET client for editing
router.get('/:id/edit', async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).render('error', {
                message: 'Client not found',
                error: { status: 404 }
            });
        }
        res.render('clients/edit', { client, title: 'Edit Client' });
    } catch (error) {
        console.error('Error fetching client:', error);
        res.status(500).render('error', {
            message: 'Error fetching client',
            error: error
        });
    }
});

// PUT update client
router.put('/:id', async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.clientName,
                email: req.body.email,
                phone: req.body.phone,
                company: req.body.company,
                address: req.body.address,
                notes: req.body.notes,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!client) {
            return res.status(404).json({ error: 'Client not found' });
        }

        res.json({ success: true, client });
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ error: 'Error updating client' });
    }
});

module.exports = router;