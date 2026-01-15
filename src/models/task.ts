import mongoose, { Schema, Document } from 'mongoose';

import { Types } from 'mongoose';

export interface ITask extends Document {
    title: string;
    description?: string;
    completed: boolean;
    dueDate?: Date;
    priority?: 'low' | 'medium' | 'high';
    user: Types.ObjectId;
}

const taskSchema = new Schema(
    {
        title: { type: String, required: true },
        description: { type: String, required: true },
        completed: { type: Boolean, default: false },
        dueDate: { type: Date },
        priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true
        }
    },
    { timestamps: true }
);

export default mongoose.model<ITask>('Task', taskSchema);
