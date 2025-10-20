import { Modal } from 'antd';
import type { ButtonProps } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

interface ModalConfirmOptions {
  title: string;
  content: string;
  okButtonProps?: ButtonProps;
}

export const modalConfirm = ({ title, content, okButtonProps }: ModalConfirmOptions): Promise<boolean> => {
  return new Promise((resolve) => {
    Modal.confirm({
      title,
      content,
      icon: <ExclamationCircleOutlined />,
      okButtonProps,
      onOk: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
};
