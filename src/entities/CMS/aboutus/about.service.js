import { About } from "./about.model.js";
import { AppError } from "../../../errors/AppError.js";
import { HttpStatusCode } from "../../../lib/httpStatus.js";

const createAboutIntoDb = async (payload) => {
    // ✅ Only one About document should exist (singleton)
    const existing = await About.findOne();
    if (existing) throw new AppError("About section already exists. Use update instead.", HttpStatusCode.Conflict);

    const about = await About.create(payload);
    return about;
};

const getAboutFromDb = async () => {
    const about = await About.findOne().lean();
    if (!about) throw new AppError("About section not found", HttpStatusCode.NotFound);
    return about;
};

const updateAboutIntoDb = async (id, payload) => {
    // ✅ Find by ID not findOne
    const existingAbout = await About.findById(id);
    if (!existingAbout) throw new AppError("About section not found", HttpStatusCode.NotFound);

    // ✅ Check all fields for changes
    const fields = ["title", "subtitle", "descriptionTitle", "description", "btnName", "image"];
    const isSame = fields.every((field) => {
        if (payload[field] === undefined) return true;
        return payload[field]?.trim?.() === existingAbout[field]?.trim?.();
    });
    if (isSame) throw new AppError("No changes detected. About is already up to date", HttpStatusCode.Conflict);

    const updated = await About.findByIdAndUpdate(
        id,
        { $set: payload },
        { new: true, runValidators: true }
    );

    return updated;
};



const deleteAboutFromDb = async () => {
    const deleted = await About.findOneAndDelete();
    if (!deleted) throw new AppError("About section not found", HttpStatusCode.NotFound);
    return deleted;
};

export const aboutService = {
    createAboutIntoDb,
    getAboutFromDb,
    updateAboutIntoDb,
    deleteAboutFromDb,
};