import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IEcomUser extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const EcomUserSchema = new Schema<IEcomUser>(
  {
    firstName: { type: String, required: false }, // Made optional for backward compatibility
    lastName: { type: String, required: false }, // Made optional for backward compatibility
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true, strict: false } // strict: false allows old 'name' field to exist
);

// Hash password before saving
EcomUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Method to compare password
EcomUserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

// Indexes are already created by unique: true in schema definition
// Removed duplicate index definitions to fix warnings

export default mongoose.models.EcomUser || mongoose.model<IEcomUser>('EcomUser', EcomUserSchema);
