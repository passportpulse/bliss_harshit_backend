import mongoose, { Document, Schema } from 'mongoose';

enum Role {
  ADMIN = 'ADMIN',
  USER = 'USER'
}

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  role: Role;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    role: { type: String, enum: Object.values(Role), default: Role.ADMIN },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
