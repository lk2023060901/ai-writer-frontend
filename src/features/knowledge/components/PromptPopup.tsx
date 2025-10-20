import { Input, Modal, message } from 'antd';

interface PromptOptions {
  title: string;
  message?: string;
  defaultValue?: string;
  okText?: string;
  cancelText?: string;
}

const PromptPopup = {
  show: ({
    title,
    message: description,
    defaultValue = '',
    okText = '确定',
    cancelText = '取消',
  }: PromptOptions): Promise<string | undefined> => {
    return new Promise((resolve) => {
      let modalRef: ReturnType<typeof Modal.confirm> | null = null;
      let value = defaultValue;

      const close = (result?: string) => {
        resolve(result);
        modalRef?.destroy();
      };

      const handleOk = async () => {
        const trimmed = value.trim();
        if (!trimmed) {
          message.warning('请输入内容');
          return Promise.reject();
        }
        close(trimmed);
        return undefined;
      };

      modalRef = Modal.confirm({
        title,
        icon: null,
        centered: true,
        okText,
        cancelText,
        okButtonProps: { disabled: !defaultValue.trim() },
        content: (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {description && <div>{description}</div>}
            <Input
              autoFocus
              defaultValue={defaultValue}
              onChange={(event) => {
                value = event.target.value;
                modalRef?.update({ okButtonProps: { disabled: !event.target.value.trim() } });
              }}
              onPressEnter={() => {
                modalRef?.update({ okButtonProps: { disabled: true } });
                handleOk().catch(() => {});
              }}
            />
          </div>
        ),
        onOk: handleOk,
        onCancel: () => close(undefined),
      });
    });
  },
};

export default PromptPopup;
