import { AppError } from '../utils/errors.js';

export const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse({ body: req.body ?? {}, params: req.params, query: req.query });
  if (!result.success)
    return next(
      new AppError(
        400,
        'VALIDATION_ERROR',
        'Request validation failed',
        result.error.issues.map(({ path, message }) => ({ path: path.join('.'), message })),
      ),
    );
  req.validated = result.data;
  return next();
};
