import { Form, Input, Modal } from 'antd';

interface IProps {
visible: boolean;
onCancel: Function;
onOk: any;
}

function CommunityChatGroupCreationPopup({
  visible,
  onCancel,
  onOk
}: IProps) {
  const [form] = Form.useForm();

  return (
    <Modal
      width={520}
      forceRender
      title="Create a channel"
      onCancel={() => onCancel()}
      okText="Create"
      okType="primary"
      onOk={() => form.submit()}
      visible={visible}
    >
      <Form
        layout="vertical"
        form={form}
        onFinish={onOk}
      >
        <Form.Item
          label="Channel Name"
          name="name"
          rules={[{
            required: true,
            message: 'Required'
          }]}
        >
          <Input placeholder="New Channel" />
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default CommunityChatGroupCreationPopup;
