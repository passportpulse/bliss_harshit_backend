import mongoose, { Document, Schema, Types } from 'mongoose';

enum BlogStatus {
  DRAFT = 'DRAFT',
  PUBLISHED = 'PUBLISHED'
}

export interface IBlog extends Document {
  title: string;
  slug: string;
  content: string;
  image: string;
  status: BlogStatus;
  category?: Types.ObjectId;
  readingTime?: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const BlogSchema = new Schema<IBlog>(
  {
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    status: {
      type: String,
      enum: Object.values(BlogStatus),
      default: BlogStatus.DRAFT,
    },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    readingTime: { type: Number },
    publishedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.models.Blog || 
  mongoose.model<IBlog>('Blog', BlogSchema);
