"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authRoutes_1 = __importDefault(require("../routes/authRoutes"));
const taskRoutes_1 = __importDefault(require("../routes/taskRoutes"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
router.use('/auth', authRoutes_1.default);
router.use('/tasks', auth_1.protect, taskRoutes_1.default);
exports.default = router;
