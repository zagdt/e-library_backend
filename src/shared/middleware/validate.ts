import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';

type ValidationTarget = 'body' | 'query' | 'params';

export const validate = (
  schema: ZodSchema,
  target: ValidationTarget = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const data = req[target];
      const validated = await schema.parseAsync(data);
      if (target === 'body') {
        // Body is writable, safe to replace entirely
        (req as any).body = validated;
      } else {
        // For query and params, mutate the existing object instead of reassigning
        Object.assign(req[target], validated);
      }
      (req as any).validated = {
        ...(req as any).validated,
        [target]: validated,
      };
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const formattedErrors: Record<string, string[]> = {};
        error.issues.forEach((issue) => {
          const path = issue.path.join('.') || target;
          if (!formattedErrors[path]) {
            formattedErrors[path] = [];
          }
          formattedErrors[path].push(issue.message);
        });

        res.status(422).json({
          success: false,
          message: 'Validation Error',
          errors: formattedErrors,
        });
        return;
      }
      next(error);
    }
  };
};

export const validateMultiple = (schemas: {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
}) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const allErrors: Record<string, string[]> = {};

      for (const [target, schema] of Object.entries(schemas)) {
        if (schema) {
          try {
            const validationTarget = target as ValidationTarget;
            const validated = await schema.parseAsync(req[validationTarget]);

            if (validationTarget === 'body') {
              (req as any).body = validated;
            } else {
              Object.assign(req[validationTarget], validated);
            }

            (req as any).validated = {
              ...(req as any).validated,
              [validationTarget]: validated,
            };
          } catch (error) {
            if (error instanceof ZodError) {
              error.issues.forEach((issue) => {
                const path = `${target}.${issue.path.join('.')}`;
                if (!allErrors[path]) {
                  allErrors[path] = [];
                }
                allErrors[path].push(issue.message);
              });
            }
          }
        }
      }

      if (Object.keys(allErrors).length > 0) {
        res.status(422).json({
          success: false,
          message: 'Validation Error',
          errors: allErrors,
        });
        return;
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
