# Form System — `useForm` + Form Components

This project uses **[TanStack Form](https://tanstack.com/form)** wrapped in a custom `useForm` hook that auto-registers reusable field components. This guide explains how the system works, how to use it, and how to create new form components.

---

## Architecture Overview

```
hooks/use-form.ts          → Defines the hook + registers field components
components/form/*.tsx      → Reusable field components (InputField, etc.)
components/ui/field.tsx    → Low-level UI primitives (Field, FieldLabel, FieldError, etc.)
```

**Flow:**

1. `useForm` creates a form instance with `defaultValues` and an `onSubmit` handler.
2. `form.AppField` connects a field name to a registered component.
3. Each field component (e.g. `InputField`) uses `useFieldContext()` to read/write its value.

---

## Quick Start

```tsx
import { useForm } from "@/hooks/use-form";

const form = useForm({
  defaultValues: {
    name: "",
    email: "",
  },
  onSubmit: async ({ value }) => {
    console.log(value); // { name: '...', email: '...' }
  },
});

return (
  <form
    onSubmit={(e) => {
      e.preventDefault();
      form.handleSubmit(e);
    }}
  >
    <form.AppField
      name="name"
      children={(field) => (
        <field.InputField label="Name" placeholder="Your name" />
      )}
    />

    <form.AppField
      name="email"
      children={(field) => (
        <field.InputField
          label="Email"
          type="email"
          placeholder="you@email.com"
        />
      )}
    />

    <button type="submit">Submit</button>
  </form>
);
```

> **Important:** Always call `e.preventDefault()` before `form.handleSubmit(e)` inside the `<form onSubmit>` handler.

---

## API Reference

### `useForm(options)`

Returns a form instance. Key options:

| Option          | Type                           | Description                                   |
| --------------- | ------------------------------ | --------------------------------------------- |
| `defaultValues` | `Record<string, any>`          | Initial values for all fields                 |
| `onSubmit`      | `({ value }) => Promise<void>` | Called when the form is submitted             |
| `validators`    | `object`                       | Optional field-level or form-level validators |

### `form.AppField`

Renders a registered field component connected to the form state.

| Prop       | Type                   | Description                                                 |
| ---------- | ---------------------- | ----------------------------------------------------------- |
| `name`     | `keyof defaultValues`  | The field key (must match a key in `defaultValues`)         |
| `children` | `(field) => ReactNode` | Render function — `field` exposes all registered components |

Available field components on `field.*`:

| Component          | Source                      | Description                      |
| ------------------ | --------------------------- | -------------------------------- |
| `field.InputField` | `components/form/input.tsx` | Text/email/password/number input |

### `form.handleSubmit(event)`

Triggers form validation and calls `onSubmit` if valid.

---

## Existing Components

### `InputField`

**Path:** `components/form/input.tsx`

A text input with label, icon, description, and error display.

**Props:**

| Prop          | Type             | Default  | Description                                                   |
| ------------- | ---------------- | -------- | ------------------------------------------------------------- |
| `label`       | `string?`        | —        | Label text above the input                                    |
| `icon`        | `ComponentType?` | —        | Lucide icon shown inside the input                            |
| `description` | `string?`        | —        | Helper text below the input                                   |
| `type`        | `string`         | `"text"` | HTML input type (`text`, `email`, `password`, `number`, etc.) |
| `placeholder` | `string?`        | —        | Placeholder text                                              |
| `required`    | `boolean?`       | —        | Adds `*` to label and HTML required attribute                 |
| `className`   | `string?`        | —        | Additional CSS classes for the input                          |

All standard `<input>` HTML attributes are also accepted.

**Example:**

```tsx
<form.AppField
  name="email"
  children={(field) => (
    <field.InputField
      label="Email"
      icon={Mail}
      placeholder="you@email.com"
      type="email"
      required
    />
  )}
/>
```

---

## Creating a New Form Component

Follow these steps to create and register a new field component.

### Step 1: Create the component file

Create a new file in `components/form/`, e.g. `select.tsx`:

```tsx
"use client";

import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { useFieldContext } from "@/hooks/use-form";
import { useStore } from "@tanstack/react-form";

interface SelectFieldProps {
  label?: string;
  description?: string;
  options: { label: string; value: string }[];
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const SelectField = ({
  label,
  description,
  options,
  placeholder,
  required,
  className,
}: SelectFieldProps) => {
  const field = useFieldContext<string>();
  const errors = useStore(field.store, (state) => state.meta.errors);

  return (
    <Field>
      {label && (
        <FieldLabel htmlFor={field.name}>
          {label}
          {required && "*"}
        </FieldLabel>
      )}

      <select
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className={className}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {description && (
        <FieldDescription className="text-sm opacity-45">
          {description}
        </FieldDescription>
      )}
      <FieldError errors={errors.map((e) => ({ message: e.message }))} />
    </Field>
  );
};

export default SelectField;
```

### Step 2: Register it in `use-form.ts`

```diff
 import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
 import { lazy } from 'react';

 export const { fieldContext, useFieldContext, formContext, useFormContext } =
   createFormHookContexts();

 // Fields
 const InputField = lazy(() => import('@/components/form/input'));
+const SelectField = lazy(() => import('@/components/form/select'));

 export const { useAppForm: useForm, withForm } = createFormHook({
   fieldContext,
   formContext,
   fieldComponents: {
     InputField,
+    SelectField,
   },
   formComponents: {},
 });
```

### Step 3: Use it

```tsx
<form.AppField
  name="status"
  children={(field) => (
    <field.SelectField
      label="Status"
      placeholder="Select..."
      options={[
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ]}
    />
  )}
/>
```

---

## Component Checklist

When creating a new form component, make sure to:

- [ ] Use `'use client'` directive at the top
- [ ] Import `useFieldContext` from `@/hooks/use-form`
- [ ] Use `useStore(field.store, ...)` for reactive error access
- [ ] Bind `value`, `onChange`, and `onBlur` to the field context
- [ ] Wrap in `<Field>` with `<FieldLabel>`, `<FieldError>`, and optionally `<FieldDescription>`
- [ ] Use `export default` (required for `lazy()` import)
- [ ] Register the component in `hooks/use-form.ts` via `lazy()`

---

## Real-World Example: Auth Page

See [app/auth/page.tsx](file:///c:/Users/francy.nobre/Desktop/dev/appdacoruja/app/auth/page.tsx) for a complete working example with login/signup modes, conditional fields, and social auth.

Key patterns used:

```tsx
// 1. Initialize form
const form = useForm({
  defaultValues: { name: '', email: '', password: '', confirmPassword: '' },
  onSubmit: async ({ value }) => { /* login or register */ },
});

// 2. Wrap in <form> with preventDefault
<form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(e); }}>

// 3. Conditionally render fields
{mode === 'signup' && (
  <form.AppField name="name"
    children={(field) => <field.InputField label="Full Name" />}
  />
)}

// 4. Always render shared fields
<form.AppField name="email"
  children={(field) => <field.InputField label="Email" type="email" />}
/>
```
