import { Input, Modal, message } from 'antd';
import type { KnowledgeBase } from '@/types/launchpad';

interface ShowOptions {
  title: string;
  onCreate: (name: string) => KnowledgeBase | Promise<KnowledgeBase>;
}

const AddKnowledgeBasePopup = {
  show: ({ title, onCreate }: ShowOptions): Promise<KnowledgeBase | undefined> => {
    return new Promise((resolve) => {
      let modalRef: ReturnType<typeof Modal.confirm> | null = null;
      let value = '';

      const close = (base?: KnowledgeBase) => {
        resolve(base);
        modalRef?.destroy();
      };

      const handleOk = async () => {
        const name = value.trim();
        if (!name) {
          message.warning('请输入知识库名称');
          return Promise.reject();
        }
        try {
          const created = await onCreate(name);
          close(created);
        } catch (error) {
          message.error('创建知识库失败');
          return Promise.reject(error);
        }
        return undefined;
      };

      modalRef = Modal.confirm({
        title,
        icon: null,
        centered: true,
        okText: '创建',
        cancelText: '取消',
        okButtonProps: { disabled: true },
        content: (
          <Input
            autoFocus
            placeholder="输入知识库名称"
            onChange={(event) => {
              value = event.target.value;
              modalRef?.update({ okButtonProps: { disabled: !event.target.value.trim() } });
            }}
            onPressEnter={() => {
              modalRef?.update({ okButtonProps: { disabled: true } });
              handleOk().catch(() => {});
            }}
          />
        ),
        onOk: handleOk,
        onCancel: () => close(undefined),
      });
    });
  },
};

export default AddKnowledgeBasePopup;
