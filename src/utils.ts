import { validationResult } from "express-validator";
import { Token } from './Authentification/token';
import express from "express";
import { IUser, UserModel } from "./Authentification/models";
import mongoose from "mongoose";

const STATUS = {
    Success: 200,
    Created: 201,
    BadRequest: 400,
    Unauthorized: 403,
    NotFound: 404,
    InternError: 500,
};

export const getUserByToken = async (request: express.Request): Promise<IUser | undefined> => {
    try {
        if (!request?.headers?.authorization) { return (undefined); }
        const token = request.headers.authorization.substring(7, request.headers.authorization.length);
        if (!token) { return (undefined); }
        const decodedToken: any = await Token.decode_token(token, process.env.ACCESS_TOKEN_SECRET as string);
        console.log(decodedToken);
        const userId = decodedToken?.payload?._id;
        if (!decodedToken?.payload?._id) { return (undefined); }
        try {
            const user = await UserModel.findOne({
                _id: new mongoose.mongo.ObjectId(userId),
            })
            if (!user) { return (undefined); }
            return (user);
        } catch {
            return (undefined);
        }
    } catch (err) {
        console.error(err);
    }
    return (undefined);
}

const VALIDATION = {
    isError: (req: express.Request, res: express.Response): boolean => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(utils.STATUS.BadRequest).json({
                errors: errors.array(),
            });
            return true;
        }
        return false;
    },
};

const isAdmin = async (req: express.Request) => {
    try {
        const user = await getUserByToken(req);
        if (user?.role === 'admin') {
            return (true);
        }
    } catch (err) {
        console.log(err);
    }
    return (false);
}

const isUser = async (req: express.Request) => {
    try {
        const user = await getUserByToken(req);
        if (user?.role === 'user' || user?.role === 'admin') {
            return (true);
        }
    } catch (err) {
        console.log(err);
    }
    return (false);
}

const cannotUseAdminRoutes = async (req: express.Request, res: express.Response) => {
    try {
        if (await isAdmin(req)) {
            return (false);
        }
    } catch (err) {
        console.log(err);
    }
    res.status(utils.STATUS.Unauthorized).send({
        err: {
            msg: "You're not an admin.",
        }
    })
    return (true);
}

const cannotUseUserRoutes = async (req: express.Request, res: express.Response) => {
    try {
        if (await isUser(req)) {
            return (false);
        }
    } catch (err) {
        console.log(err);
    }
    res.status(utils.STATUS.Unauthorized).send({
        err: {
            msg: "You're not an user.",
        }
    })
    return (true);
}

const AUTHORIZATION = {
    getUserByToken: getUserByToken,
    isAdmin: isAdmin,
    isUser: isUser,
    cannotUseUserRoutes: cannotUseUserRoutes,
    cannotUseAdminRoutes: cannotUseAdminRoutes,
}

const utils = {
    STATUS,
    VALIDATION,
    AUTHORIZATION,
};

export default utils;
