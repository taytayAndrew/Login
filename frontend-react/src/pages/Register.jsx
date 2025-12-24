import { Form, Input, InputNumber, Button, message, Space } from 'antd';
import { UserOutlined, MailOutlined, LockOutlined, SafetyOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const Register = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [codeLoading, setCodeLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);

  // 倒计时效果
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // 发送验证码
  const handleSendCode = async () => {
    try {
      const email = form.getFieldValue('email');
      if (!email) {
        message.warning('请先输入邮箱地址');
        return;
      }

      // 验证邮箱格式
      const emailRegex = /^[A-Za-z0-9+_.-]+@(.+)$/;
      if (!emailRegex.test(email)) {
        message.error('请输入有效的邮箱地址');
        return;
      }

      setCodeLoading(true);
      const response = await authAPI.sendVerificationCode(email);
      
      if (response.success) {
        message.success('验证码已发送到您的邮箱，请查收');
        setCountdown(60); // 60秒倒计时
      } else {
        message.error(response.message || '验证码发送失败');
      }
    } catch (error) {
      message.error(error.message || '验证码发送失败，请稍后重试');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleRegister = async (values) => {
    setLoading(true);
    try {
      const result = await register({
        name: values.name,
        age: values.age,
        email: values.email,
        password: values.password,
        verificationCode: values.verificationCode,
      });
      
      if (result.success) {
        message.success('注册成功，请登录');
        form.resetFields();
        setCountdown(0);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        message.error(result.message || '注册失败');
      }
    } catch (error) {
      message.error(error.message || '注册失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Form
      form={form}
      name="register"
      onFinish={handleRegister}
      layout="vertical"
      size="large"
    >
      <Form.Item
        name="name"
        label="用户名"
        rules={[{ required: true, message: '请输入用户名' }]}
      >
        <Input
          prefix={<UserOutlined />}
          placeholder="用户名"
        />
      </Form.Item>
      <Form.Item
        name="age"
        label="年龄"
        rules={[
          { required: true, message: '请输入年龄' },
          { type: 'number', min: 1, max: 150, message: '年龄必须在1-150之间' },
        ]}
      >
        <InputNumber
          style={{ width: '100%' }}
          placeholder="年龄"
          min={1}
          max={150}
        />
      </Form.Item>
      <Form.Item
        name="email"
        label="邮箱"
        rules={[
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入有效的邮箱地址' },
        ]}
      >
        <Input
          prefix={<MailOutlined />}
          placeholder="邮箱"
        />
      </Form.Item>
      <Form.Item
        name="verificationCode"
        label="验证码"
        rules={[
          { required: true, message: '请输入验证码' },
          { len: 6, message: '验证码必须是6位数字' },
          { pattern: /^\d{6}$/, message: '验证码必须是6位数字' },
        ]}
      >
        <Space.Compact style={{ width: '100%' }}>
          <Input
            prefix={<SafetyOutlined />}
            placeholder="请输入6位验证码"
            maxLength={6}
            style={{ width: '60%' }}
          />
          <Button
            type="primary"
            onClick={handleSendCode}
            loading={codeLoading}
            disabled={countdown > 0}
            style={{ width: '40%' }}
          >
            {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
          </Button>
        </Space.Compact>
      </Form.Item>
      <Form.Item
        name="password"
        label="密码"
        rules={[
          { required: true, message: '请输入密码' },
          { min: 6, message: '密码至少6位' },
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="密码（至少6位）"
        />
      </Form.Item>
      <Form.Item
        name="confirmPassword"
        label="确认密码"
        dependencies={['password']}
        rules={[
          { required: true, message: '请确认密码' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password') === value) {
                return Promise.resolve();
              }
              return Promise.reject(new Error('两次输入的密码不一致'));
            },
          }),
        ]}
      >
        <Input.Password
          prefix={<LockOutlined />}
          placeholder="请再次输入密码"
        />
      </Form.Item>
      <Form.Item>
        <Button
          type="primary"
          htmlType="submit"
          block
          loading={loading}
        >
          注册
        </Button>
      </Form.Item>
    </Form>
  );
};

export default Register;

