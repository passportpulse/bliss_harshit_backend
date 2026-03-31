import { Types } from 'mongoose';

// Convert string to ObjectId
export const toObjectId = (id: string): Types.ObjectId => {
  return new Types.ObjectId(id);
};

// Check if a string is a valid ObjectId
export const isValidObjectId = (id: string): boolean => {
  return Types.ObjectId.isValid(id);
};

// Convert MongoDB document to plain object
export const toPlainObject = (doc: any) => {
  if (!doc) return null;
  
  if (Array.isArray(doc)) {
    return doc.map(d => {
      const obj = d.toObject ? d.toObject() : d;
      obj._id = obj._id.toString();
      return obj;
    });
  }
  
  const obj = doc.toObject ? doc.toObject() : doc;
  if (obj._id) {
    obj._id = obj._id.toString();
  }
  return obj;
};

// Pagination helper
export const paginate = <T>(
  query: any,
  page: number = 1,
  limit: number = 10,
  sort: Record<string, 1 | -1> = { createdAt: -1 }
) => {
  const skip = (page - 1) * limit;
  
  return Promise.all([
    query.clone().sort(sort).skip(skip).limit(limit).exec(),
    query.model.countDocuments(query.getQuery())
  ]).then(([items, total]) => ({
    items: toPlainObject(items),
    total,
    page,
    totalPages: Math.ceil(total / limit),
    limit
  }));
};
