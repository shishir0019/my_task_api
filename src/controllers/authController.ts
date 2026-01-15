import type { Request, Response } from 'express';
import { Types } from 'mongoose';
import User from '@/models/user';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { successResponse } from '@/utils/response';

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

interface IUserResponse {
  _id: Types.ObjectId;
  name: string;
  email: string;
}

interface ILoginResponse {
  token: string;
  user: IUserResponse;
}

export const register = async (req: Request, res: Response) => {
    try {
        const { name, email, password } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(password, salt);

        const user = new User({ name, email, password: hashPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json(successResponse<ILoginResponse>({ token, user: { _id: user._id, name: user.name, email } }));
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1d' });
        res.json(successResponse<ILoginResponse>({ token, user: { _id: user._id, name: user.name, email } }));
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const user = await User.findById(userId).select('name email').lean();
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(successResponse<IUserResponse>(user));
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error });
  }
};