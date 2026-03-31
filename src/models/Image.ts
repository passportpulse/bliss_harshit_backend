import mongoose, { Document, Schema, Types } from 'mongoose';

export interface IImage extends Document {
  url: string;
  product: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ImageSchema = new Schema<IImage>(
  {
    url: { type: String, required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Image || 
  mongoose.model<IImage>('Image', ImageSchema);
