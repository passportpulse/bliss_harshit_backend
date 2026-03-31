import mongoose, { Document, Schema, Types } from 'mongoose';

export interface ISubCategory extends Document {
  name: string;
  slug: string;
  category: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubCategorySchema = new Schema<ISubCategory>(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.SubCategory || 
  mongoose.model<ISubCategory>('SubCategory', SubCategorySchema);
