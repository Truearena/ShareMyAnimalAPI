import express from 'express'
import utils from '../utils';
import { AnimalModel, IAnimal } from './models';
import { body, check, checkSchema, Location, param } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();

router.post('/api/v1/animals',
  body('breeds').exists().isArray(),
  body('category').exists().isString().isLength({ max: 128 }),
  check('breeds.*').isString().isLength({ max: 128 }),
  async (req: express.Request, res: express.Response) => {
    if (utils.VALIDATION.isError(req, res)) { return; }
    const animal = new AnimalModel({
      breeds: req.body.breeds,
      category: req.body.category,
    })
    try {
      await animal.save()
      return (res.status(utils.STATUS.Created).send(animal));
    } catch (err) {
      return (res.status(utils.STATUS.InternError).send(err));
    }
  });

router.put('/api/v1/animals/:id',
  param('id').exists().withMessage('URI requires animal id'),
  check('breeds').optional().isArray(),
  check('category').optional().isString().isLength({ max: 128 }),
  check('breeds.*').optional().isString().isLength({ max: 128 }),
  async (req: express.Request, res: express.Response) => {
    if (utils.VALIDATION.isError(req, res)) { return; }
    try {
      await AnimalModel.updateOne({
        _id: new mongoose.mongo.ObjectId(req.params?.['id']),
      }, {
        ...req.body,
        updateDate: new Date(),
      } as IAnimal)
      return (res.status(utils.STATUS.Success).send());
    } catch (err) {
      return (res.status(utils.STATUS.InternError).send(err));
    }
  });

router.get('/api/v1/animals',
  checkSchema({
    "sorting": {
      in: ['query'] as Location[],
      matches: {
        options: /\b(?:oldest|mostrecent)\b/,
        errorMessage: "Invalid sorting"
      }
    }
  }),
  async (req: express.Request, res: express.Response) => {
    if (utils.VALIDATION.isError(req, res)) { return; }
    const animals = await AnimalModel.find({});

    return res.send(animals.sort((a, b) => {
      if (req.query?.['sorting'] === 'mostrecent') {
        return (+b.creationDate - +a.creationDate);
      }
      if (req.query?.['sorting'] === 'oldest') {
        return (+a.creationDate - +b.creationDate);
      }
      return (+b.creationDate - +a.creationDate);
    }));
  });

export default router;
