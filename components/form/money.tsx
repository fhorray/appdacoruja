'use client';

import { Input } from '@/components/ui/input';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { useFieldContext } from '@/hooks/use-form';
import { useStore } from '@tanstack/react-form';
import { NumericFormat, NumberFormatValues } from 'react-number-format';

interface MoneyFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'onBlur'> {
  label?: string;
  description?: string;
}

const MoneyField = ({ label, description, ...props }: MoneyFieldProps) => {
  const field = useFieldContext<number>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  const handleValueChange = (values: NumberFormatValues) => {
    field.handleChange(values.floatValue || 0);
  };

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}
          {props.required && '*'}
        </FieldLabel>
      )}

      <div className="relative w-full">
        <NumericFormat
          customInput={Input}
          id={field.name}
          name={field.name}
          value={field.state.value || ''}
          onBlur={field.handleBlur}
          onValueChange={handleValueChange}
          thousandSeparator="."
          decimalSeparator=","
          prefix="R$ "
          decimalScale={2}
          fixedDecimalScale
          allowNegative={false}
          aria-invalid={isInvalid}
          {...props as any}
        />
      </div>

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

export default MoneyField;
