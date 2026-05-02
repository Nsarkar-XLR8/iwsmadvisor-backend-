/**
 * Middleware to parse nested form-data keys (e.g., mission[title])
 * into structured objects for Joi and Mongoose.
 */
export const parseFormData = (req, res, next) => {
  if (!req.body) return next();

  const result = {};

  const assignValue = (target, key, value) => {
    if (target[key] === undefined) {
      target[key] = value;
      return;
    }

    if (Array.isArray(target[key])) {
      target[key].push(value);
      return;
    }

    target[key] = [target[key], value];
  };

  const assignNestedValue = (target, parts, value) => {
    let current = target;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      const isLast = i === parts.length - 1;

      if (isLast) {
        if (current[part] === undefined) {
          current[part] = value;
        } else if (Array.isArray(current[part])) {
          current[part].push(value);
        } else {
          current[part] = [current[part], value];
        }
        return;
      }

      const nextPart = parts[i + 1];
      const isNextNumber = !Number.isNaN(Number(nextPart));

      // Initialize next level as Array or Object
      if (!current[part]) {
        current[part] = isNextNumber ? [] : {};
      }
      current = current[part];
    }
  };

  Object.keys(req.body).forEach((key) => {
    const value = req.body[key];

    // Use regex to find parts: "coreStrengths[items][0][title]" -> ["coreStrengths", "items", "0", "title"]
    const parts = key.split(/[[\]]+/).filter(Boolean);

    if (parts.length <= 1) {
      assignValue(result, key, value);
      return;
    }

    assignNestedValue(result, parts, value);
  });

  req.body = result;
  next();
};
