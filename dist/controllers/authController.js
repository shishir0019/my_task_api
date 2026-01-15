"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.login = exports.register = void 0;
const user_1 = __importDefault(require("../models/user"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const existingUser = await user_1.default.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: 'User already exists' });
        const salt = await bcrypt_1.default.genSalt(10);
        const hashPassword = await bcrypt_1.default.hash(password, salt);
        const user = new user_1.default({ name, email, password: hashPassword });
        await user.save();
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.status(201).json({ token, user: { _id: user._id, name, email } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await user_1.default.findOne({ email });
        if (!user)
            return res.status(400).json({ message: 'Invalid credentials' });
        const isMatch = await user.comparePassword(password);
        if (!isMatch)
            return res.status(400).json({ message: 'Invalid credentials' });
        const token = jsonwebtoken_1.default.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json({ token, user: { _id: user._id, name: user.name, email } });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};
exports.login = login;
const getMe = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId)
            return res.status(401).json({ message: 'Unauthorized' });
        const user = await user_1.default.findById(userId).select('name email').lean();
        if (!user)
            return res.status(404).json({ message: 'User not found' });
        res.json({ user });
    }
    catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};
exports.getMe = getMe;
