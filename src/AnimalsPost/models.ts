import mongoose from 'mongoose'

export interface IAnimalPost {
	_id: mongoose.ObjectId;
	authorId: mongoose.ObjectId;
	animalId: mongoose.ObjectId;
	name: string;
	breed: string;
	age: number;
  image: string;
  likes?: mongoose.ObjectId[];
  dislikes?: mongoose.ObjectId[];
  creationDate: Date;
	updateDate?: Date;
}
export const AnimalPostSchema = new mongoose.Schema({
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  animalId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  breed: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
  image: {
    type: String,
    required: true,
  },
  likes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  dislikes: {
    type: [mongoose.Schema.Types.ObjectId],
    default: []
  },
  creationDate: {
    type: Date,
    default: Date.now
  },
  updateDate: {
    type: Date,
    default: undefined
  },
})

export const AnimalPostModel = mongoose.model<IAnimalPost>('AnimalPost', AnimalPostSchema);