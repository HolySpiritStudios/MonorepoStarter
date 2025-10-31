import { Id, ToastOptions, toast } from 'react-toastify';

import { ComponentIdEnum } from '../constants/component-id.constant';

export class ToasterUtil {
  private static _instance: ToasterUtil;

  static get instance(): ToasterUtil {
    if (!ToasterUtil._instance) {
      ToasterUtil._instance = new ToasterUtil();
    }

    return ToasterUtil._instance;
  }

  closeToast(id: Id): void {
    toast.dismiss(id);
  }

  showError(message: string, props?: ToastOptions): Id {
    return toast.error(message, {
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      position: 'bottom-right',
      toastId: ComponentIdEnum.ERROR_TOAST_CONTAINER,
      ...props,
    });
  }

  showSuccess(message: string, props?: ToastOptions): Id {
    return toast.success(message, {
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      position: 'bottom-right',
      ...props,
    });
  }
}

export const getToasterUtil = (): ToasterUtil => ToasterUtil.instance;
