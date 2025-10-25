'use client';

import { useState } from 'react';
import { z } from 'zod';
import { formatValidationErrors } from '@/lib/validations';

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (data: unknown): boolean => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors(formatValidationErrors(error));
      }
      return false;
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  const getFieldError = (field: string): string | undefined => {
    return errors[field];
  };

  return {
    errors,
    validate,
    clearErrors,
    getFieldError,
  };
}
