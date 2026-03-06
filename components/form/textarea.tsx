'use client';

import { Textarea } from '@/components/ui/textarea';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';

import { useFieldContext } from '@/hooks/use-form';
import { useStore } from '@tanstack/react-form';

interface TextareaFieldProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'name' | 'value' | 'onChange' | 'onBlur'> {
  label?: string;
  description?: string;
}

const TextareaField = ({ label, description, ...props }: TextareaFieldProps) => {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}
          {props.required && '*'}
        </FieldLabel>
      )}

      <Textarea
        id={field.name}
        name={field.name}
        value={field.state.value ?? ''}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        {...props}
      />

      {description && (
        <FieldDescription className="text-sm opacity-45">
          {description}
        </FieldDescription>
      )}
      <FieldError
        errors={errors.map((e) => ({
          message: e.message,
        }))}
      />
    </Field>
  );
};

export default TextareaField;
