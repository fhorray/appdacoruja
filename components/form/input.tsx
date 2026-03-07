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
import { cn } from '@/lib/utils';

interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, ''> {
  label?: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  description?: string;
}

const InputField = ({ label, icon, description, ...props }: InputProps) => {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);
  const Icon = icon;
  const isInvalid = field.state.meta.isTouched && !field.state.meta.isValid;

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}
          {props.required && '*'}
        </FieldLabel>
      )}

      <div className="relative group w-full flex items-center">
        {Icon && (
          <span className="absolute left-4 top-1/2 -translate-y-1/2 z-10 text-muted-foreground/60 transition-colors group-focus-within:text-primary pointer-events-none">
            <Icon className="w-5 h-5" />
          </span>
        )}
        <Input
          id={field.name}
          name={field.name}
          value={field.state.value ?? ''}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
          aria-invalid={isInvalid}
          {...props}
          className={cn(
            "h-10 border-none bg-muted/30 focus-visible:ring-1 focus-visible:ring-primary/20",
            Icon && "pl-12",
            props.className
          )}
          autoComplete="off"
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

export default InputField;
