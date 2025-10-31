import { useState } from 'react';

import { useAppDispatch } from '../../main/hooks/use-app-dispatch';
import { useAppSelector } from '../../main/hooks/use-app-selector';
import { SignUpFormData, SignUpFormDataSchema } from '../models/sign-up.model';
import { selectUserManagementLoadingStatus } from '../selectors/user-management-loading-status.selector';
import { signUpThunk } from '../slices/user-management-slice/thunks/sign-up.thunk';

export const useSignUp = () => {
  const dispatch = useAppDispatch();
  const isLoading = useAppSelector(selectUserManagementLoadingStatus);

  const [formData, setFormData] = useState<SignUpFormData>({
    name: '',
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignUpFormData, string>>>({});

  const handleChange = (field: keyof SignUpFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = (field: keyof SignUpFormData) => () => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = SignUpFormDataSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      await dispatch(signUpThunk(formData)).unwrap();
      return { success: true, data: formData };
    }

    const formattedErrors: Partial<Record<keyof SignUpFormData, string>> = {};
    result.error.errors.forEach((err) => {
      const path = err.path[0] as keyof SignUpFormData;
      formattedErrors[path] = err.message;
    });
    setErrors(formattedErrors);
    return { success: false, error: 'Form is invalid' };
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleClear,
    handleSubmit,
  };
};
