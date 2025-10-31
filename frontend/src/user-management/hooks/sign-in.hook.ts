import { useState } from 'react';

import { useAppDispatch } from '../../main/hooks/use-app-dispatch';
import { useAppSelector } from '../../main/hooks/use-app-selector';
import { getAwsAuthUtil } from '../../main/utils/aws/aws-auth.util';
import { SignInFormData, SignInFormDataSchema } from '../models/sign-in.model';
import { selectUserManagementLoadingStatus } from '../selectors/user-management-loading-status.selector';
import { signInThunk } from '../slices/user-management-slice/thunks/sign-in.thunk';

export const useSignIn = () => {
  const dispatch = useAppDispatch();

  const isLoading = useAppSelector(selectUserManagementLoadingStatus);
  const [formData, setFormData] = useState<SignInFormData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SignInFormData, string>>>({});

  const handleChange = (field: keyof SignInFormData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleClear = (field: keyof SignInFormData) => () => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const result = SignInFormDataSchema.safeParse(formData);

    if (result.success) {
      setErrors({});
      await dispatch(signInThunk(formData)).unwrap();
      return { success: true, data: formData };
    }

    const formattedErrors: Partial<Record<keyof SignInFormData, string>> = {};
    result.error.errors.forEach((err) => {
      const path = err.path[0] as keyof SignInFormData;
      formattedErrors[path] = err.message;
    });
    setErrors(formattedErrors);
    return { success: false, error: 'Form is invalid' };
  };

  const handleGoogleSignIn = async () => {
    if (isLoading) return;

    try {
      await getAwsAuthUtil().signInWithGoogle();
    } catch (error) {
      console.error('Google sign-in failed:', error);
    }
  };

  return {
    formData,
    errors,
    isLoading,
    handleChange,
    handleClear,
    handleSubmit,
    handleGoogleSignIn,
  };
};
