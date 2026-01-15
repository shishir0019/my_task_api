"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteTask = exports.updateTask = exports.createTask = exports.getTaskById = exports.getTasks = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const task_1 = __importDefault(require("../models/task"));
const response_1 = require("../utils/response");
/**
 * GET /tasks
 * Get all tasks for logged-in user (pagination + filters)
 */
const getTasks = async (req, res) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const skip = (page - 1) * limit;
        const filter = { user: req.user.id };
        if (req.query.completed !== undefined) {
            filter.completed = req.query.completed === 'true';
        }
        if (req.query.priority) {
            filter.priority = req.query.priority;
        }
        if (req.query.dueDate) {
            const date = new Date(req.query.dueDate);
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.dueDate = {
                $gte: startOfDay,
                $lte: endOfDay,
            };
        }
        const [tasks, total] = await Promise.all([
            task_1.default.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            task_1.default.countDocuments(filter),
        ]);
        res.json((0, response_1.successResponse)(tasks, {
            page,
            limit,
            total,
        }));
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTasks = getTasks;
/**
 * GET /tasks/:id
 * Get single task by ID (only owner)
 */
const getTaskById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        const task = await task_1.default.findOne({
            _id: id,
            user: req.user.id,
        });
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json((0, response_1.successResponse)(task));
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.getTaskById = getTaskById;
/**
 * POST /tasks
 * Create task
 */
const createTask = async (req, res) => {
    try {
        const { title, description, dueDate, priority } = req.body;
        const task = await task_1.default.create({
            title,
            description,
            dueDate,
            priority,
            user: req.user.id,
        });
        res.status(201).json((0, response_1.successResponse)(task));
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.createTask = createTask;
/**
 * PUT /tasks/:id
 * Update task (only owner)
 */
const updateTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        // Prevent changing task owner
        delete req.body.user;
        const updatedTask = await task_1.default.findOneAndUpdate({ _id: id, user: req.user.id }, req.body, { new: true });
        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.json((0, response_1.successResponse)(updatedTask));
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.updateTask = updateTask;
/**
 * DELETE /tasks/:id
 * Delete task (only owner)
 */
const deleteTask = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose_1.default.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }
        const deletedTask = await task_1.default.findOneAndDelete({
            _id: id,
            user: req.user.id,
        });
        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }
        res.status(204).send();
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.deleteTask = deleteTask;
