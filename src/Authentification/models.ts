import mongoose from "mongoose";

export interface IUser {
    _id?: mongoose.ObjectId;
    username: string;
    email: string;
    password: string;
    role: 'user' | 'admin';
    creationDate: Date;
    updateDate?: Date;
}

export const UserSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    creationDate: {
        type: Date,
        default: Date.now,
    },
    role: {
        type: String,
        default: 'user',
    },
    updateDate: {
        type: Date,
        default: undefined,
    },
});

export const UserModel = mongoose.model<IUser>("User", UserSchema);
