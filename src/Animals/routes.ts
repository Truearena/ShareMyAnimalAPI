import express from 'express'
import utils, { getUserByToken } from '../utils';
import { AnimalModel, IAnimal } from './models';
import { body, check, checkSchema, Location, param, Schema } from 'express-validator';
import mongoose from 'mongoose';

const router = express.Router();
const PATH = '/api/v1/animals';

router.post(`${PATH}`,
  body('breeds').exists().isArray(),
  body('category').exists().isString().isLength({ max: 128 }),
  check('breeds.*').isString().isLength({ max: 128 }),
  async (req: express.Request, res: express.Response) => {
    /* ADMIN ROUTE */
    if (await utils.AUTHORIZATION.cannotUseAdminRoutes(req, res)) { return; }
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */
  
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

  router.delete(`${PATH}/:id`,
  param('id').exists().withMessage('URI requires animal id'),
  async (req: express.Request, res: express.Response) => {
    /* ADMIN ROUTE */
    if (await utils.AUTHORIZATION.cannotUseAdminRoutes(req, res)) { return; }
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */
  
    try {
      await AnimalModel.deleteOne({
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

router.put(`${PATH}/:id`,
  param('id').exists().withMessage('URI requires animal id'),
  check('breeds').optional().isArray(),
  check('category').optional().isString().isLength({ max: 128 }),
  check('breeds.*').optional().isString().isLength({ max: 128 }),
  async (req: express.Request, res: express.Response) => {
    /* ADMIN ROUTE */
    if (await utils.AUTHORIZATION.cannotUseAdminRoutes(req, res)) { return; }
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */
  
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

router.get(`${PATH}`,
  checkSchema({
    "sorting": {
      in: ['query'] as Location[],
      matches: {
        options: /\b(?:oldest|mostrecent)\b/,
        errorMessage: "Invalid sorting"
      },
      optional: true,
    }
  } as Schema),
  async (req: express.Request, res: express.Response) => {
    /* GUEST ROUTE */
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */
  
    const animals = await AnimalModel.find({});

    const x = await getUserByToken(req);
    console.log(x);
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
