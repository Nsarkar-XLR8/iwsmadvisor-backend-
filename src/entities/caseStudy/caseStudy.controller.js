import mongoose from 'mongoose';
import {
  createCaseStudyService,
  getCaseStudiesService,
  getCaseStudyByIdService,
  updateCaseStudyService,
  deleteCaseStudyService,
} from './caseStudy.service.js';

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

// Admin: create case study (multipart/form-data)
export const createCaseStudy = async (req, res) => {
  try {
    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files);
    const title = pickField(req.body, ['title', 'Title', 'title ', 'Title ']);
    const description = pickField(req.body, ['description', 'Description', 'description ', 'Description ']);
    const subtitle = pickField(req.body, ['subtitle', 'subTitle', 'Subtitle']);
    const challenge = pickField(req.body, ['challenge', 'Challenge']);
    const solution = pickField(req.body, ['solution', 'Solution']);
    const benefit = pickField(req.body, ['benefit', 'Benefit']);
    const customer = pickField(req.body, ['customer', 'Customer']);
    const client = pickField(req.body, ['client', 'Client']);
    const duration = pickField(req.body, ['duration', 'Duration']);
    const teamSize = pickField(req.body, ['teamSize', 'team_size', 'TeamSize', 'Team Size']);
    const technologiesUsed = pickField(req.body, ['technologiesUsed', 'technologies', 'TechnologiesUsed', 'Technologies']);
    const resultImpact = pickField(req.body, ['resultImpact', 'result', 'ResultImpact', 'Result']);
    const caseExperience = pickField(req.body, ['caseExperience', 'experience', 'CaseExperience', 'Experience']);
    const clientName = pickField(req.body, ['clientName', 'client_name', 'ClientName']);
    const companyName = pickField(req.body, ['companyName', 'company_name', 'CompanyName']);

    const caseStudy = await createCaseStudyService({
      title,
      description,
      subtitle,
      challenge,
      solution,
      benefit,
      customer,
      client,
      duration,
      teamSize,
      technologiesUsed,
      resultImpact,
      caseExperience,
      clientName,
      companyName,
      image: imageFile,
    });
    return res.status(201).json({
      success: true,
      message: 'Case study created successfully',
      data: caseStudy,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Create case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: list case studies
export const getCaseStudies = async (req, res) => {
  try {
    const { page, limit, search } = req.query;
    const result = await getCaseStudiesService({ page, limit, search });

    return res.status(200).json({
      success: true,
      message: 'Case studies fetched successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Get case studies error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Public: get single case study
export const getCaseStudyById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case study id' });
    }

    const caseStudy = await getCaseStudyByIdService(id);
    if (!caseStudy) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Case study fetched successfully',
      data: caseStudy,
    });
  } catch (error) {
    console.error('Get case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: update case study
export const updateCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case study id' });
    }

    const imageFile = req.files?.file?.[0] || req.files?.image?.[0] || firstAvailableFile(req.files);
    const title = pickField(req.body, ['title', 'Title', 'title ', 'Title ']);
    const description = pickField(req.body, ['description', 'Description', 'description ', 'Description ']);
    const subtitle = pickField(req.body, ['subtitle', 'subTitle', 'Subtitle']);
    const challenge = pickField(req.body, ['challenge', 'Challenge']);
    const solution = pickField(req.body, ['solution', 'Solution']);
    const benefit = pickField(req.body, ['benefit', 'Benefit']);
    const customer = pickField(req.body, ['customer', 'Customer']);
    const client = pickField(req.body, ['client', 'Client']);
    const duration = pickField(req.body, ['duration', 'Duration']);
    const teamSize = pickField(req.body, ['teamSize', 'team_size', 'TeamSize', 'Team Size']);

    const result = await updateCaseStudyService(id, {
      ...(title !== undefined ? { title } : {}),
      ...(description !== undefined ? { description } : {}),
      ...(subtitle !== undefined ? { subtitle } : {}),
      ...(challenge !== undefined ? { challenge } : {}),
      ...(solution !== undefined ? { solution } : {}),
      ...(benefit !== undefined ? { benefit } : {}),
      ...(customer !== undefined ? { customer } : {}),
      ...(client !== undefined ? { client } : {}),
      ...(duration !== undefined ? { duration } : {}),
      ...(teamSize !== undefined ? { teamSize } : {}),
      ...(imageFile ? { image: imageFile } : {}),
    });

    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Case study updated successfully',
      data: result.caseStudy,
    });
  } catch (error) {
    if (error.code === 'VALIDATION_ERROR') {
      return res.status(400).json({ success: false, message: error.message });
    }
    console.error('Update case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

// Admin: delete case study
export const deleteCaseStudy = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'Invalid case study id' });
    }

    const result = await deleteCaseStudyService(id);
    if (result?.notFound) {
      return res.status(404).json({ success: false, message: 'Case study not found' });
    }

    return res.status(200).json({ success: true, message: 'Case study deleted successfully' });
  } catch (error) {
    console.error('Delete case study error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
