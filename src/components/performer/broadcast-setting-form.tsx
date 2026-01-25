import {
  Button, Col, Form, InputNumber,
  Row
} from 'antd';
import React from 'react';

interface IProps {
  onFinish(data: any): Function;
  loading: boolean;
  maxParticipantsAllowed: number;
}

const formItemLayout = {
  labelCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 24
    }
  },
  wrapperCol: {
    xs: {
      span: 24
    },
    sm: {
      span: 16
    }
  }
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 0
    },
    sm: {
      span: 16,
      offset: 0
    }
  }
};

function BroadcastSetting({
  onFinish,
  maxParticipantsAllowed,
  loading
}: IProps) {
  const [form] = Form.useForm();
  return (
    <Form
      {...formItemLayout}
      form={form}
      onFinish={onFinish}
      name="broadcastSettingForm"
      className="performerEditForm"
      initialValues={{
        maxParticipantsAllowed:
          typeof maxParticipantsAllowed === 'number'
            ? maxParticipantsAllowed
            : 0
      }}
      layout="vertical"
    >
      <Row gutter={25}>
        <Col sm={12} xs={24}>
          <Form.Item
            name="maxParticipantsAllowed"
            label="Max Participants Allowed"
            extra="Set 0 to unlimit participants allowed"
          >
            <InputNumber
              type="number"
              min={0}
              style={{ width: '100%' }}
              placeholder="Input max participants allowed"
            />
          </Form.Item>
        </Col>
      </Row>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" htmlType="submit" disabled={loading} loading={loading}>
          Save Changes
        </Button>
      </Form.Item>
    </Form>
  );
}

export default BroadcastSetting;
