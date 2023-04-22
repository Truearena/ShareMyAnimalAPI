import express from "express";
import utils from "../utils";
import { IUser, UserModel } from "./models";
import {
    body,
    check,
    checkSchema,
    Location,
    param,
    Schema,
} from "express-validator";
import mongoose from "mongoose";
import { Crypt } from "./crypt";
import { Token } from "./token";

const router = express.Router();
const PATH = "/api/v1/register";

export async function check_email_exist(user: IUser) {
    const res = await UserModel.findOne({
        email: user.email,
    }).clone();
    if (res != null) {
        throw { error: { msg: "Email already exist" } };
    }
}

router.post(
    `${PATH}`,
    body("username").exists().isString().isLength({ max: 12 }),
    body("email").exists().isString().isEmail(),
    body("password").isString().isLength({ min: 6, max: 50 }),
    async (req: express.Request, res: express.Response) => {
        if (utils.VALIDATION.isError(req, res)) {
            return;
        }
        const user = new UserModel({
            username: req.body.username,
            email: req.body.email,
            password: await Crypt.crypt_password(req.body.password),
        });
        try {
            await check_email_exist(user);
            await user.save();
            return res.status(utils.STATUS.Created).send({
                refresh_token: await Token.generate_refresh_token(user),
                access_token: await Token.generate_access_token(user),
                expires_in: "1800s",
                token_type: "Bearer",
            });
        } catch (err) {
            return res.status(utils.STATUS.InternError).send(err);
        }
    }
);

export default router;
