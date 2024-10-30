const express = require('express');
const router = express.Router();
const Client = require('../models/Client');
const Project = require('../models/Project');
const Activity = require('../models/Activity');

// GET all projects
router.get('/', async (req, res) => {
    try {
        const clients = await Client.find().sort({ name: 1 });
        const projects = await Project.find().populate('clientId');
        
        console.log('Available clients:', clients); // Debug log
        
        res.render('projects', { 
            title: 'Manage Projects',
            projects: projects,
            clients: clients,
            error: null
        });
    } catch (error) {
        console.error('Error in projects route:', error);
        res.render('projects', { 
            title: 'Manage Projects',
            projects: [],
            clients: [],
            error: 'Failed to load data'
        });
    }
});

// GET project creation form
router.get('/new', (req, res) => {
    res.render('projects/new', { 
        title: 'Add New Project',
        clients: req.app.locals.clients || []
    });
});

// POST new project
router.post('/', async (req, res) => {
    try {
        console.log('Creating new project:', req.body); // Add this for debugging

        const newProject = new Project({
            name: req.body.projectName,
            clientId: req.body.clientId,
            description: req.body.description,
            startDate: req.body.startDate,
            deadline: req.body.deadline,
            budget: req.body.budget,
            status: 'ongoing' // Default status
        });

        await newProject.save();

        // Create activity log
        const activity = new Activity({
            description: `New project "${newProject.name}" created`,
            type: 'project',
            status: 'created',
            relatedId: newProject._id
        });
        await activity.save();

        console.log('Project saved successfully:', newProject); // Add this for debugging
        res.redirect('/projects');
    } catch (error) {
        console.error('Error creating project:', error);
        res.status(500).render('error', { 
            message: 'Error creating project',
            error: error
        });
    }
});

// DELETE project
router.delete('/:id', async (req, res) => {
    try {
        const result = await Project.findByIdAndDelete(req.params.id);
        if (!result) {
            return res.status(404).json({ success: false, message: 'Project not found' });
        }
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting project:', error);
        res.status(500).json({ success: false, message: 'Error deleting project' });
    }
});

// GET project for editing
router.get('/:id/edit', async (req, res) => {
    try {
        const project = await Project.findById(req.params.id).populate('clientId');
        const clients = await Client.find();
        
        if (!project) {
            return res.status(404).render('error', {
                message: 'Project not found',
                error: { status: 404 }
            });
        }
        
        res.render('projects/edit', { 
            project, 
            clients,
            title: 'Edit Project' 
        });
    } catch (error) {
        console.error('Error fetching project:', error);
        res.status(500).render('error', {
            message: 'Error fetching project',
            error: error
        });
    }
});

// PUT update project
router.put('/:id', async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                name: req.body.projectName,
                clientId: req.body.clientId,
                description: req.body.description,
                startDate: req.body.startDate,
                deadline: req.body.deadline,
                budget: req.body.budget,
                status: req.body.status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!project) {
            return res.status(404).json({ error: 'Project not found' });
        }

        res.json({ success: true, project });
    } catch (error) {
        console.error('Error updating project:', error);
        res.status(500).json({ error: 'Error updating project' });
    }
});

// Add this route to get projects by client
router.get('/client/:clientId', async (req, res) => {
    try {
        const projects = await Project.find({
            clientId: req.params.clientId,
            status: { $in: ['active', 'ongoing'] } // Only show active or ongoing projects
        });
        res.json(projects);
    } catch (error) {
        console.error('Error fetching client projects:', error);
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

// Update the PUT route for status updates
router.put('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        console.log('Updating project status:', { id: req.params.id, status }); // Debug log

        // Validate status
        if (!['active', 'ongoing', 'completed', 'cancelled'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status value'
            });
        }

        // Find and update project
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            {
                status: status,
                updatedAt: new Date()
            },
            { new: true }
        );

        if (!project) {
            console.log('Project not found:', req.params.id); // Debug log
            return res.status(404).json({
                success: false,
                message: 'Project not found'
            });
        }

        console.log('Project updated:', project); // Debug log

        // Create activity log
        const activity = new Activity({
            description: `Project ${project.name} marked as ${status}`,
            type: 'project',
            status: status,
            relatedId: project._id
        });
        await activity.save();

        res.json({
            success: true,
            message: 'Project status updated successfully',
            project: project
        });

    } catch (error) {
        console.error('Error updating project status:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update project status: ' + error.message
        });
    }
});

// Export only the router
module.exports = router;