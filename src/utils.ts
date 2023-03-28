import { validationResult } from "express-validator";
import express from "express";

const STATUS = {
  'Success': 200,
  'Created': 201,
  'BadRequest': 400,
  'NotFound': 404,
  'InternError': 500,
}

const VALIDATION = {
  isError: (req: express.Request, res: express.Response): boolean => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(utils.STATUS.BadRequest).json({ errors: errors.array() })
      return true;
    }
    return (false);
  }
}

const utils = {
  STATUS,
  VALIDATION,
}

export default utils;
