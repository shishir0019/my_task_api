import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Task, { ITask } from '@/models/task';
import { successResponse } from '@/utils/response';

/**
 * GET /tasks
 * Get all tasks for logged-in user (pagination + filters)
 */
export const getTasks = async (req: Request, res: Response) => {
    try {
        const page = Math.max(Number(req.query.page) || 1, 1);
        const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
        const skip = (page - 1) * limit;

        const filter: any = { user: req.user!.id };

        if (req.query.completed !== undefined) {
            filter.completed = req.query.completed === 'true';
        }

        if (req.query.priority) {
            filter.priority = req.query.priority;
        }

        if (req.query.dueDate) {
            const date = new Date(req.query.dueDate as string);

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
            Task.find(filter)
                .skip(skip)
                .limit(limit)
                .sort({ createdAt: -1 }),
            Task.countDocuments(filter),
        ]);

        res.json(
            successResponse<ITask[]>(tasks, {
                page,
                limit,
                total,
            })
        );
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * GET /tasks/:id
 * Get single task by ID (only owner)
 */
export const getTaskById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const task = await Task.findOne({
            _id: id,
            user: req.user!.id,
        });

        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(successResponse<ITask>(task));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * POST /tasks
 * Create task
 */
export const createTask = async (req: Request, res: Response) => {
    try {
        const { title, description, dueDate, priority } = req.body;

        const task = await Task.create({
            title,
            description,
            dueDate,
            priority,
            user: req.user!.id,
        });

        res.status(201).json(successResponse<ITask>(task));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

/**
 * PUT /tasks/:id
 * Update task (only owner)
 */
export const updateTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        // Prevent changing task owner
        delete req.body.user;

        const updatedTask = await Task.findOneAndUpdate(
            { _id: id, user: req.user!.id },
            req.body,
            { new: true }
        );

        if (!updatedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.json(successResponse<ITask>(updatedTask));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

/**
 * DELETE /tasks/:id
 * Delete task (only owner)
 */
export const deleteTask = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id as string)) {
            return res.status(400).json({ message: 'Invalid task ID' });
        }

        const deletedTask = await Task.findOneAndDelete({
            _id: id,
            user: req.user!.id,
        });

        if (!deletedTask) {
            return res.status(404).json({ message: 'Task not found' });
        }

        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
