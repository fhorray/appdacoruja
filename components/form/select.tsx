'use client';

import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field';
import { useFieldContext } from '@/hooks/use-form';
import { cn } from '@/lib/utils';
import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SelectFieldProps extends Omit<
  React.ComponentProps<typeof Select>,
  'value' | 'onValueChange'
> {
  label?: string;
  description?: string;
  placeholder?: string;
  options: { value: string; label: string }[];
  className?: string;
  disabled?: boolean;
  onValueChange?: (value: string) => void;
  onBlur?: () => void;
}

const SelectField = ({
  label,
  description,
  placeholder = 'Select an option',
  options,
  disabled,
  className,
  onValueChange,
  onBlur,
  ...props
}: SelectFieldProps) => {
  const field = useFieldContext();
  const { value, meta } = field.state;
  const { errors } = meta;

  const handleValueChange = (newValue: string) => {
    field.handleChange(newValue);
    onValueChange?.(newValue);
  };

  return (
    <Field>
      {label && <FieldLabel>{label}</FieldLabel>}
      <Select
        value={(value as string) || ''}
        onValueChange={handleValueChange}
        disabled={disabled}
        {...props}
      >
        <SelectTrigger 
          className={cn('w-full', className)}
          onBlur={() => {
            field.handleBlur();
            onBlur?.();
          }}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {description && (
        <FieldDescription className="text-sm opacity-45">
          {description}
        </FieldDescription>
      )}
      <FieldError
        errors={errors.map((e: any) => ({
          message: e?.message?.toString() || 'Invalid',
        }))}
      />
    </Field>
  );
};

export default SelectField;