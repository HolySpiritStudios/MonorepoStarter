import { CommonSuccessResponse } from '../../common/models/common-request.model.ts';
import { getRestClientUtil } from '../../main/utils/clients/rest-client.util.ts';

interface Props {
  fullName: string;
  email: string;
  password: string;
}

export const signUpRequest = async (props: Props) => {
  const response = await getRestClientUtil().post<CommonSuccessResponse, Props>('/authentication/v1/sign-up', props, {
    useAuth: false,
  });

  return response;
};
