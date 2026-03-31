import mongoose, { Schema, models } from 'mongoose';

const VedaconsultingSchema = new Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contactNo: { type: String, required: true },
  location: { type: String, required: true },
  healthIssue: { type: String, required: true },
}, { timestamps: true });

export default models.Vedaconsulting || mongoose.model('Vedaconsulting', VedaconsultingSchema);
