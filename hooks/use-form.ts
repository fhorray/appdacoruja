import { createFormHookContexts, createFormHook } from '@tanstack/react-form';
import { lazy } from 'react';

export const { fieldContext, useFieldContext, formContext, useFormContext } =
  createFormHookContexts();


// Fields
const InputField = lazy(() => import('@/components/form/input'));
const TextareaField = lazy(() => import('@/components/form/textarea'));
const MoneyField = lazy(() => import('@/components/form/money'));

export const { useAppForm: useForm, withForm } = createFormHook({
  fieldContext,
  formContext,
  fieldComponents: {
    InputField,
    TextareaField,
    MoneyField,
  },
  formComponents: {
  },
});