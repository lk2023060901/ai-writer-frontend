import { Form, Input, Modal } from 'antd';
import type { KnowledgeBase } from '@/types/launchpad';

interface ShowOptions {
  base: KnowledgeBase;
  onSubmit: (values: { description: string; tags: string[] }) => void | Promise<void>;
}

const EditKnowledgeBasePopup = {
  show: ({ base, onSubmit }: ShowOptions): Promise<KnowledgeBase | undefined> => {
    return new Promise((resolve) => {
      const [form] = Form.useForm<{ description: string; tags: string }>();
      form.setFieldsValue({
        description: base.description,
        tags: base.tags.join(', '),
      });

      let submitting = false;
      let modalRef: ReturnType<typeof Modal.confirm> | null = null;

      const close = (result?: KnowledgeBase) => {
        resolve(result);
        modalRef?.destroy();
      };

      const handleOk = async () => {
        if (submitting) {
          return Promise.reject();
        }
        try {
          submitting = true;
          const values = await form.validateFields();
          const nextTags = values.tags
            ? values.tags
                .split(',')
                .map((tag) => tag.trim())
                .filter(Boolean)
            : [];
          await onSubmit({ description: values.description ?? '', tags: nextTags });
          close({
            ...base,
            description: values.description ?? '',
            tags: nextTags,
          });
        } catch (error) {
          submitting = false;
          return Promise.reject(error);
        }
        return undefined;
      };

      modalRef = Modal.confirm({
        title: '编辑知识库',
        icon: null,
        centered: true,
        okText: '保存',
        cancelText: '取消',
        content: (
          <Form form={form} layout="vertical">
            <Form.Item label="简介" name="description">
              <Input.TextArea rows={3} placeholder="请输入知识库简介" />
            </Form.Item>
            <Form.Item label="标签" name="tags">
              <Input placeholder="使用英文逗号分隔标签" />
            </Form.Item>
          </Form>
        ),
        onOk: handleOk,
        onCancel: () => close(undefined),
      });
    });
  },
};

export default EditKnowledgeBasePopup;
