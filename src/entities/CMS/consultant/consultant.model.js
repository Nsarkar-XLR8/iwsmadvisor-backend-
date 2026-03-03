import { Schema, model } from 'mongoose';

/**
 * Consultant Model Schema
 * Optimized for performance with lean selection and indexing.
 */
const consultantSchema = new Schema(
    {
        title: {
            type: String,
            required: [true, 'Title is required'],
            trim: true,
            maxlength: [100, 'Title cannot exceed 100 characters'],
        },
        description: {
            type: String,
            required: [true, 'Description is required'],
            trim: true,
        },
        btnName: {
            type: String,
            required: [true, 'Button name is required'],
            default: 'View Profile',
            trim: true,
        },
    },
    {
        timestamps: true, // Automatically manages createdAt and updatedAt
        // versionKey: false, // Removes __v for cleaner JSON output
        // toJSON: { virtuals: true },
        // toObject: { virtuals: true },
    }
);

// Optimization: Add an index on title if you plan to search or sort by it frequently
// consultantSchema.index({ title: 1 });

 export const Consultant = model('Consultant', consultantSchema);

// export default Consultant;