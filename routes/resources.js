const express = require("express");
const jsonschema = require("jsonschema");
const newResourceSchema = require('../schemas/newResource.json')
const updateResourceSchema = require('../schemas/updateResource.json');

const {
    ensureAdmin
} = require("../middleware/auth");

const { BadRequestError } = require("../expressError");

const Resources = require('../models/resource');

const router = express.Router();

/**
 * Main route for all resource links that are available from the backend server.
 * 
 * GET /resources => RETURNS {resources: [{id, title, url, type, rating}, ...]}
 * 
 * Authorization required: None
 * 
 */
router.get('/', async (req, res, next) => {
    try {
        const resources = await Resources.getAllResources();
        return res.json({ resources });
    } catch (err) {
        return next(err);
    }
})

/**
 * Main route for getting all article type links from the backend. No auth required at this time.
 * 
 * GET /resources/articles => RETURNS {articles: [{id, title, url, type, rating}, ...]}
 * 
 * Authorization required: None
 * 
 */
router.get('/articles', async (req, res, next) => {
    try {
        const articles = await Resources.getAllArticles();
        return res.json({ articles });
    } catch (err) {
        return next(err);
    }
})

/**
 * Main route for gettina all video type links from the backend. No autho required at this time.
 * 
 * GET /resources/videos => RETURNS {videos: [{id, title, url, type, rating}, ...]}
 * 
 * Authorization required: None
 * 
 */
router.get('/videos', async (req, res, next) => {
    try {
        const videos = await Resources.getAllVideos();
        return res.json({ videos });
    } catch (err) {
        return next(err);
    }
})

/**
 * Main route for getting the landing pages links from the backend. No auth required at this time.
 * 
 * GET resources/additional-resources => RETURNS {landingPages: [{id, title, url, type, rating}, ...]}
 * 
 * Authorization required: None
 * 
 */
router.get('/additional-resources', async (req, res, next) => {
    try {
        const landingPages = await Resources.getLandingPages();
        return res.json({ landingPages })
    } catch (err) {
        return next(err);
    }
})


/**
 * Main route for adding a new resource link to the backend server. Admin route only.
 * 
 * POST /resources => RETURNS {added: {id, title, url, type, rating}}
 * 
 * Authorization required: ADMIN USERS ONLY.
 * 
 */
router.post('/', ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, newResourceSchema);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }
        const newResource = await Resources.addNewResource(req.body);

        return res.status(201).json({ added: newResource })
    } catch (err) {
        return next(err);
    }
})

/**
 * Main route for updating a resource that is already in the backend database. Admin route only.
 * 
 * PATCH /resources/:id => RETURNS {updated: {id, title, url, type, rating}}
 * 
 * Authorization required: ADMIN USERS ONLY.
 * 
 */
router.patch('/:id', ensureAdmin, async (req, res, next) => {
    try {
        const validator = jsonschema.validate(req.body, updateResourceSchema);
        if (!validator.valid) {
            const errs = validator.errors.map((e) => e.stack);
            throw new BadRequestError(errs);
        }

        const updated = await Resources.updateResource(req.params.id, req.body);
        return res.json({ updated })
    } catch (err) {
        return next(err);
    }
})

/**
 * Main route for deleting a resource from the backend database. Admin route only.
 * 
 * DELETE /resources/:id => RETURNS {deleted: id}
 * 
 * Authorization required: ADMIN USERS ONLY.
 * 
 */
router.delete('/:id', ensureAdmin, async (req, res, next) => {
    try {
        const { id } = req.params;
        await Resources.deleteResource(id);
        return res.json({ deleted: id })
    } catch (err) {
        return next(err);
    }
})

/**
 * Main route for viewing a single resource individually. No auth required at this time.
 * 
 * GET /resources/:id => RETURNS {resource: {id, title, url, type, rating}}
 * 
 * Authorization required: None
 * 
 */
router.get('/:id', async (req, res, next) => {
    try {
        const resource = await Resources.getSingleResource(req.params.id);
        return res.json({ resource });
    } catch (err) {
        return next(err);
    }
})



module.exports = router;