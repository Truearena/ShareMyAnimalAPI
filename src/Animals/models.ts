import mongoose from 'mongoose'

export interface IAnimal {
	_id: mongoose.ObjectId;
	category: string;
	breeds: string[];
	creationDate: Date;
	updateDate?: Date;
}

export const AnimalSchema = new mongoose.Schema({
  category: {
    type: String,
    required: true,
  },
  breeds: {
    type: [String],
    required: true,
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

export const AnimalModel = mongoose.model<IAnimal>('Animal', AnimalSchema);