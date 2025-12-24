import { Modal, Form, Input, message } from 'antd';
import { useAuth } from '../contexts/AuthContext';

const ChangePasswordModal = ({ visible, onCancel }) => {
  const [form] = Form.useForm();
  const { changePassword } = useAuth();

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const result = await changePassword(values.oldPassword, values.newPassword);
      
      if (result.success) {
        message.success('密码修改成功');
        form.resetFields();
        onCancel();
      } else {
        message.error(result.message || '修改密码失败');
      }
    } catch (error) {
      console.error('修改密码错误:', error);
    }
  };

  return (
    <Modal
      title="修改密码"
      open={visible}
      onOk={handleSubmit}
      onCancel={onCancel}
      okText="确定"
      cancelText="取消"
    >
      <Form form={form} layout="vertical">
        <Form.Item
          name="oldPassword"
          label="原密码"
          rules={[{ required: true, message: '请输入原密码' }]}
        >
          <Input.Password placeholder="请输入原密码" />
        </Form.Item>
        <Form.Item
          name="newPassword"
          label="新密码"
          rules={[
            { required: true, message: '请输入新密码' },
            { min: 6, message: '密码至少6位' },
          ]}
        >
          <Input.Password placeholder="请输入新密码（至少6位）" />
        </Form.Item>
        <Form.Item
          name="confirmPassword"
          label="确认新密码"
          dependencies={['newPassword']}
          rules={[
            { required: true, message: '请确认新密码' },
            ({ getFieldValue }) => ({
              validator(_, value) {
                if (!value || getFieldValue('newPassword') === value) {
                  return Promise.resolve();
                }
                return Promise.reject(new Error('两次输入的密码不一致'));
              },
            }),
          ]}
        >
          <Input.Password placeholder="请再次输入新密码" />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ChangePasswordModal;

