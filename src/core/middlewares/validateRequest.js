// const validateRequest = (schema) => (req, res, next) => {
//     const { error } = schema.validate(req.body);
//     if (error) {
//       return res.status(400).json({ error: error.details[0].message });
//     }
//     next();
// };

// export default validateRequest;


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

  const { error } = schema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  next();
};

export default validateRequest;
