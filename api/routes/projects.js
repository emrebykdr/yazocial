const express = require('express');
const router = express.Router();
const Projects = require('../db/models/Projects');

// GET /api/projects
router.get('/', async (req, res) => {
    try {
        const { page = 1, limit = 20, sort = '-createdAt', status = 'active', tag } = req.query;
        const filter = { status };
        if (tag) filter.tags = tag;
        const projects = await Projects.find(filter)
            .populate('userId', 'username avatarUrl')
            .populate('tags', 'name slug')
            .sort(sort).skip((page - 1) * limit).limit(parseInt(limit));
        const total = await Projects.countDocuments(filter);
        res.json({ success: true, data: projects, pagination: { page: parseInt(page), limit: parseInt(limit), total } });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// GET /api/projects/:id
router.get('/:id', async (req, res) => {
    try {
        const project = await Projects.findById(req.params.id)
            .populate('userId', 'username avatarUrl').populate('tags', 'name slug');
        if (!project) return res.status(404).json({ success: false, error: 'Proje bulunamadı' });
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/projects
router.post('/', async (req, res) => {
    try {
        const project = new Projects(req.body);
        await project.save();
        res.status(201).json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// PUT /api/projects/:id
router.put('/:id', async (req, res) => {
    try {
        const project = await Projects.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!project) return res.status(404).json({ success: false, error: 'Proje bulunamadı' });
        res.json({ success: true, data: project });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

// DELETE /api/projects/:id
router.delete('/:id', async (req, res) => {
    try {
        const project = await Projects.findByIdAndDelete(req.params.id);
        if (!project) return res.status(404).json({ success: false, error: 'Proje bulunamadı' });
        res.json({ success: true, message: 'Proje silindi' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;
