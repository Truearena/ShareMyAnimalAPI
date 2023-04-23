import express from 'express'
import utils, { getUserByToken } from '../utils';
import { AnimalPostModel, IAnimalPost } from './models';
import { body, check, checkSchema, Location, param, Schema } from 'express-validator';
import mongoose from 'mongoose';
import { AnimalModel } from '../Animals/models';

const router = express.Router();
const PATH = '/api/v1/animal_post';

const isValidAnimalId = async (animalId: mongoose.mongo.BSON.ObjectId) => {
  try {
    const animal = await AnimalModel.findOne({
      _id: animalId,
    });
    if (animal) {
      return (true);
    }
  } catch (err) {
    console.error(err);
  }
  return (false);
}

const isValidBreed = async (breed: string, animalId: mongoose.mongo.BSON.ObjectId) => {
  try {
    const animal = await AnimalModel.findOne({
      _id: animalId,
    });
    if (animal?.breeds?.includes(breed)) {
      return (true)
    }
  } catch (err) {
    console.error(err);
  }
  return (false);
}

router.post(`${PATH}`,
  body('name').exists().isString().isLength({ max: 128 }),
  body('breed').exists().isString().isLength({ max: 128 }),
  body('age').exists().isNumeric(),
  body('image').exists().isString().isLength({ max: 128 }),
  body('animalId').exists().isString().isLength({ max: 128 }),
  async (req: express.Request, res: express.Response) => {
    /* USER ROUTE */
    if (await utils.AUTHORIZATION.cannotUseUserRoutes(req, res)) { return; }
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */

    const { breed, age, image, name, animalId } = req.body;
    if (!await isValidAnimalId(animalId)) {
      return res.status(utils.STATUS.BadRequest).send({
        err: {
          msg: `Invalid animalId : ${animalId}`,
        }
      })
    }
    if (!await isValidBreed(breed, animalId)) {
      return res.status(utils.STATUS.BadRequest).send({
        err: {
          msg: `Invalid breed : ${breed}`,
        }
      })
    }
    const user = await getUserByToken(req)
    const animalPost = new AnimalPostModel({
      breed: breed,
      age: age,
      image: image,
      name: name,
      animalId: new mongoose.mongo.ObjectId(animalId),
      authorId: user?._id,
    })
    try {
      await animalPost.save()
      return (res.status(utils.STATUS.Created).send(animalPost));
    } catch (err) {
      return (res.status(utils.STATUS.InternError).send(err));
    }
  });

router.delete(`${PATH}/:id`,
  param('id').exists().withMessage('URI requires animal post id'),
  async (req: express.Request, res: express.Response) => {
    /* USER ROUTE */
    if (await utils.AUTHORIZATION.cannotUseUserRoutes(req, res)) { return; }
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */

    const user = await utils.AUTHORIZATION.getUserByToken(req);
    try {
      const resultDelete = await AnimalPostModel.deleteOne({
        _id: new mongoose.mongo.ObjectId(req.params?.['id']),
        authorId: user?._id,
      }, {
        ...req.body,
        updateDate: new Date(),
      } as IAnimalPost)
      if (resultDelete.deletedCount !== 1) {
        return (res.status(utils.STATUS.NotFound).send({
          err: {
            msg: "Animal post not found.",
          }
        }))
      }
      return (res.status(utils.STATUS.Success).send());
    } catch (err) {
      return (res.status(utils.STATUS.InternError).send(err));
    }
  });

router.put(`${PATH}/:id`,
  param('id').exists().withMessage('URI requires animal post id'),
  check('breed').optional().isString().isLength({ max: 128 }),
  check('name').optional().isString().isLength({ max: 128 }),
  check('age').optional().isNumeric(),
  check('image').optional().isString(),
  async (req: express.Request, res: express.Response) => {
    /* USER ROUTE */
    if (await utils.AUTHORIZATION.cannotUseUserRoutes(req, res)) { return; }
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */

    const user = await utils.AUTHORIZATION.getUserByToken(req);
    try {
      const updateResult = await AnimalPostModel.updateOne({
        _id: new mongoose.mongo.ObjectId(req.params?.['id']),
        authorId: user?._id,
      }, {
        ...req.body,
        updateDate: new Date(),
      } as IAnimalPost)
      if (updateResult.matchedCount !== 1) {
        return (res.status(utils.STATUS.NotFound).send({
          err: {
            msg: "Unable to find this post."
          }
        }));
      } else if (updateResult.modifiedCount !== 1) {
        return (res.status(utils.STATUS.InternError).send({
          err: {
            msg: "No changes have been made."
          }
        }));
      }
      const animalPost = await AnimalPostModel.findOne({
        _id: new mongoose.mongo.ObjectId(req.params?.['id']),
        authorId: user?._id,
      })
      return (res.status(utils.STATUS.Success).send(animalPost));
    } catch (err) {
      console.log(err)
      return (res.status(utils.STATUS.InternError).send(err));
    }
  });

router.get(`${PATH}/my_posts`,
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
    /* USER ROUTE */
    if (await utils.AUTHORIZATION.cannotUseUserRoutes(req, res)) { return; }
    if (utils.VALIDATION.isError(req, res)) { return; }
    /* ----------- */

    const user = await getUserByToken(req);
    const animalPosts = await AnimalPostModel.find({
      authorId: user?._id,
    });
    return res.send(animalPosts.sort((a, b) => {
      if (req.query?.['sorting'] === 'mostrecent') {
        return (+b.creationDate - +a.creationDate);
      }
      if (req.query?.['sorting'] === 'oldest') {
        return (+a.creationDate - +b.creationDate);
      }
      return (+b.creationDate - +a.creationDate);
    }));
  });

router.get(`${PATH}/all_posts`,
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

    const animalPosts = await AnimalPostModel.find({});
    return res.send(animalPosts.sort((a, b) => {
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
