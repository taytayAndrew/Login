import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Form, Input, InputNumber, Button, Card, message, Spin, Tag, Space } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { userAPI } from '../services/api';

const UserDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    setLoading(true);
    try {
      const response = await userAPI.getUser(id);
      if (response.success) {
        const userData = response.data;
        setUser(userData);
        form.setFieldsValue({
          name: userData.name,
          age: userData.age,
          email: userData.email,
        });
      } else {
        message.error('获取用户信息失败');
        navigate('/users');
      }
    } catch (error) {
      message.error('获取用户信息失败');
      navigate('/users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (values) => {
    setSaving(true);
    try {
      const response = await userAPI.updateUser(id, values);
      if (response.success) {
        message.success('更新用户成功');
        fetchUser();
      } else {
        message.error(response.message || '更新用户失败');
      }
    } catch (error) {
      message.error('更新用户失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/users')}
        style={{ marginBottom: 16 }}
      >
        返回
      </Button>

      <Card title={`用户详情 - ${user?.name || ''}`}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdate}
          style={{ maxWidth: 600 }}
        >
          <Form.Item label="用户ID">
            <Input value={user?.id} disabled />
          </Form.Item>

          <Form.Item
            name="name"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="用户名" />
          </Form.Item>

          <Form.Item
            name="age"
            label="年龄"
            rules={[
              { required: true, message: '请输入年龄' },
              { type: 'number', min: 1, max: 150 },
            ]}
          >
            <InputNumber style={{ width: '100%' }} placeholder="年龄" min={1} max={150} />
          </Form.Item>

          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="邮箱" />
          </Form.Item>

          <Form.Item label="角色">
            <Space>
              {user?.roles?.map((role) => (
                <Tag key={role.id} color="blue">{role.name}</Tag>
              )) || <Tag>无</Tag>}
            </Space>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={saving}>
                保存
              </Button>
              <Button onClick={() => navigate('/users')}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserDetail;

