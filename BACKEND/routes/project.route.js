const express = require('express');
const { getProjects, getProjectById, createProject, updateProject, deleteProject } = require('../controllers/project.controller');
const protect = require('../middleware/protect.middleware');
const authorize = require('../middleware/authorize.middleware');
const projectUpload = require("../middleware/project-upload.middleware");


const projectRouter = express.Router();


// public routes / user routes
projectRouter.get('/', getProjects);
projectRouter.get('/:id', getProjectById);



// admin routes
projectRouter.post(
    '/',
    protect,
    authorize('admin'),
    projectUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    createProject
);
projectRouter.put(
    '/:id',
    protect,
    authorize('admin'),
    projectUpload.fields([
        { name: "image", maxCount: 1 },
        { name: "images", maxCount: 10 },
    ]),
    updateProject
);
projectRouter.delete('/:id', protect, authorize('admin'), deleteProject);

module.exports = projectRouter;