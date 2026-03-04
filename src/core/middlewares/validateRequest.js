import { BadRequestError } from '../../errors/index.js';

const validateRequest = (schema) => (req, res, next) => {
  // ✅ Universally parse any JSON strings from form-data before validation
  Object.keys(req.body).forEach((key) => {
    if (typeof req.body[key] === "string") {
      const trimmed = req.body[key].trim();
      if (
        (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
        (trimmed.startsWith("[") && trimmed.endsWith("]"))
      ) {
        try {
          req.body[key] = JSON.parse(trimmed);
        } catch {
          // ✅ Not valid JSON — leave as string, let Joi handle the error
        }
      }
    }
  });

  const { error } = schema.validate(req.body, { abortEarly: false });
  if (error) {
    const fieldErrors = error.details.map((detail) => ({
      field: detail.path.join('.'),
      message: detail.message,
      type: detail.type,
    }));
    throw new BadRequestError('Request validation failed.', fieldErrors);
  }

  next();
};

export default validateRequest;
