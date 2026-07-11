import mongoose from 'mongoose';
import {
  createRealStateService,
  getRealStatesService,
  getRealStateByIdService,
  updateRealStateService,
  deleteRealStateService,
} from './realState.service.js';

const firstAvailableFile = (files) => {
  if (!files) return undefined;
  if (Array.isArray(files)) return files[0];
  for (const key of Object.keys(files)) {
    if (files[key]?.[0]) return files[key][0];
  }
  return undefined;
};

const pickField = (body, keys) => {
  for (const key of keys) {
    if (body?.[key] !== undefined) return body[key];
  }
  return undefined;
};

// Admin: create real state (multipart/form-data)
export const createRealState = async (req, res) => {
  try {
    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files);
    const { title, subTitle, overview, overviewTitle, keyCapabilities, order } = req.body;

    const realState = await createRealStateService({
      title,
      subTitle,
      overview,
      overviewTitle,
      keyCapabilities,
      order,
      image: imageFile,
    });

    return res.status(201).json({
      success: true,
      message: 'Real state created successfully',
      data: realState,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list real states
export const getRealStates = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getRealStatesService({ page, limit, search });

    return res.status(200).json({
      success: true,
      message: 'Real states fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get real states error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single real state
export const getRealStateById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid real state id' });
    }

    const realState = await getRealStateByIdService(id);
    if (!realState) {
      return res.status(404).json({ success: false, message: 'Real state not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Real state fetched successfully',
      data: realState,
    });
  } catch (error) {
    console.error('Get real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update real state
export const updateRealState = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid real state id' });
    }

    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files);
    const { title, subTitle, overview, overviewTitle, keyCapabilities, order } = req.body;

    const result = await updateRealStateService(id, {
      ...(title !== undefined ? { title } : {}),
      ...(subTitle !== undefined ? { subTitle } : {}),
      ...(overview !== undefined ? { overview } : {}),
      ...(overviewTitle !== undefined ? { overviewTitle } : {}),
      ...(keyCapabilities !== undefined ? { keyCapabilities } : {}),
      ...(order !== undefined ? { order } : {}),
      ...(imageFile ? { image: imageFile } : {}),
    });

    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Real state not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Real state updated successfully',
      data: result.realState,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete real state
export const deleteRealState = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid real state id' });
    }

    const result = await deleteRealStateService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Real state not found' });
    }

    return res.status(200).json({ success: true, message: 'Real state deleted successfully' });
  } catch (error) {
    console.error('Delete real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
import mongoose from 'mongoose';
import {
  createRealStateService,
  getRealStatesService,
  getRealStateByIdService,
  updateRealStateService,
  deleteRealStateService,
} from './realState.service.js';

const firstAvailableFile = (files) => {
  if (!files) return undefined;
  if (Array.isArray(files)) return files[0];
  for (const key of Object.keys(files)) {
    if (files[key]?.[0]) return files[key][0];
  }
  return undefined;
};

const pickField = (body, keys) => {
  for (const key of keys) {
    if (body?.[key] !== undefined) return body[key];
  }
  return undefined;
};

// Admin: create real state (multipart/form-data)
export const createRealState = async (req, res) => {
  try {
    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files);
    const title = pickField(req.body, ['title', 'Title', 'realStateTitle', 'RealStateTitle']);
    const subtitles = pickField(req.body, ['subtitles', 'subtitle', 'subTitles', 'Subtitles']);
    const overview = pickField(req.body, ['overview', 'Overview', 'description', 'Description']);
    const keyCapabilities = pickField(req.body, ['keyCapabilities', 'capabilities', 'KeyCapabilities', 'keyCapability']);

    const realState = await createRealStateService({
      title,
      subTitle,
      overview,
      overviewTitle,
      keyCapabilities,
      order,
      image: imageFile,
    });

    return res.status(201).json({
      success: true,
      message: 'Real state created successfully',
      data: realState,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list real states
export const getRealStates = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getRealStatesService({ page, limit, search });

    return res.status(200).json({
      success: true,
      message: 'Real states fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get real states error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single real state
export const getRealStateById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid real state id' });
    }

    const realState = await getRealStateByIdService(id);
    if (!realState) {
      return res.status(404).json({ success: false, message: 'Real state not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Real state fetched successfully',
      data: realState,
    });
  } catch (error) {
    console.error('Get real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update real state
export const updateRealState = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid real state id' });
    }

    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files);
    const { title, subTitle, overview, overviewTitle, keyCapabilities, order } = req.body;

    const result = await updateRealStateService(id, {
      ...(title !== undefined ? { title } : {}),
      ...(subTitle !== undefined ? { subTitle } : {}),
      ...(overview !== undefined ? { overview } : {}),
      ...(overviewTitle !== undefined ? { overviewTitle } : {}),
      ...(keyCapabilities !== undefined ? { keyCapabilities } : {}),
      ...(order !== undefined ? { order } : {}),
      ...(imageFile ? { image: imageFile } : {}),
    });

    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Real state not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Real state updated successfully',
      data: result.realState,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete real state
export const deleteRealState = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid real state id' });
    }

    const result = await deleteRealStateService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Real state not found' });
    }

    return res.status(200).json({ success: true, message: 'Real state deleted successfully' });
  } catch (error) {
    console.error('Delete real state error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};