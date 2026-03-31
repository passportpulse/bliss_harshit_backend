import mongoose, { Document, Schema, Types } from 'mongoose';


export interface UnitVariant {
  id?: string; // optional (generated in frontend or backend)
  name: string;
  price: number;
  originalPrice: number;
  note: string;
}

export interface Ingredient {
  id?: string;
  name: string;
  description: string;
}

export interface Benefit {
  id?: string;
  title: string;
  description: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Types.ObjectId;
  subCategory?: Types.ObjectId;
  metadata?: any;
  rating?: number;
  reviewCount?: number;
  images: Types.ObjectId[];
  consumptionInfo?: {
    dosage: string;
    bestTime: string;
    duration: string;
    note: string;
  };
  createdAt: Date;
  updatedAt: Date;
  unitVariants: UnitVariant[];
  ingredients: Ingredient[];
  benefits: Benefit[];
  clinicalStudyNote?: string;
  faq?: FaqItem[];
}


const UnitVariantSchema = new Schema<UnitVariant>(
  {
    id: { type: String },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number, required: true },
    note: { type: String, default: '' },
  },
  { _id: false }
);

const IngredientSchema = new Schema<Ingredient>(
  {
    id: { type: String },
    name: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const BenefitSchema = new Schema<Benefit>(
  {
    id: { type: String },
    title: { type: String, required: true },
    description: { type: String, default: '' },
  },
  { _id: false }
);

const FaqItemSchema = new Schema<FaqItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
}, { _id: false });

const ProductSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    originalPrice: { type: Number },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    subCategory: { type: Schema.Types.ObjectId, ref: 'SubCategory' },
    metadata: { type: Schema.Types.Mixed },
    rating: { type: Number, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    images: [{ type: Schema.Types.ObjectId, ref: 'Image' }],

    consumptionInfo: {
      dosage: { type: String, default: '' },
      bestTime: { type: String, default: '' },
      duration: { type: String, default: '' },
      note: { type: String, default: '' },
    },

    unitVariants: [UnitVariantSchema],
    ingredients: [IngredientSchema],
    benefits: [BenefitSchema],

    clinicalStudyNote: { type: String, default: '' },
    faq: { type: [FaqItemSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.models.Product ||
  mongoose.model<IProduct>('Product', ProductSchema);
