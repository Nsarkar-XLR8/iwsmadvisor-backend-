import { ServicePageTitle } from './servicePageTitle.model.js';

export const createTitle = async (data) => ServicePageTitle.create(data);

export const getAllTitles = async () =>
  ServicePageTitle.find().sort({ order: 1, createdAt: -1 });

export const getSingleTitle = async (id) => ServicePageTitle.findById(id);

export const updateTitle = async (id, data) =>
  ServicePageTitle.findByIdAndUpdate(id, data, {
    new: true,
    runValidators: true
  });

export const deleteTitle = async (id) => ServicePageTitle.findByIdAndDelete(id);
