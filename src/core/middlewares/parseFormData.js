/**
 * Middleware to parse nested form-data keys (e.g., mission[title]) 
 * into structured objects for Joi and Mongoose.
 */
export const parseFormData = (req, res, next) => {
    if (!req.body) return next();

    const result = {};

    Object.keys(req.body).forEach((key) => {
        const value = req.body[key];

        // Use regex to find parts: "coreStrengths[items][0][title]" -> ["coreStrengths", "items", "0", "title"]
        const parts = key.split(/[[\]]+/).filter(Boolean);

        if (parts.length <= 1) {
            result[key] = value;
            return;
        }

        let current = result;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            const isLast = i === parts.length - 1;

            if (isLast) {
                current[part] = value;
            } else {
                const nextPart = parts[i + 1];
                const isNextNumber = !isNaN(Number(nextPart));

                // Initialize next level as Array or Object
                if (!current[part]) {
                    current[part] = isNextNumber ? [] : {};
                }
                current = current[part];
            }
        }
    });

    req.body = result;
    next();
};