import { ServicePageTitle } from "./servicePageTitle.model.js";

export const createTitle = async (data) => await ServicePageTitle.create(data);
export const getAllTitles = async () => await ServicePageTitle.find().sort({ createdAt: -1 });
export const getSingleTitle = async (id) => await ServicePageTitle.findById(id);
export const updateTitle = async (id, data) =>
  await ServicePageTitle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
export const deleteTitle = async (id) => await ServicePageTitle.findByIdAndDelete(id);