import { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message, Input, InputNumber, Row, Col, Tag, Modal, Form } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { userAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchParams, setSearchParams] = useState({});
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.listUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 搜索用户
  const handleSearch = async () => {
    setLoading(true);
    try {
      const response = await userAPI.searchUsers(
        searchParams.name,
        searchParams.minAge,
        searchParams.maxAge
      );
      if (response.success) {
        setUsers(response.data || []);
        message.success('搜索成功');
      }
    } catch (error) {
      message.error('搜索失败');
    } finally {
      setLoading(false);
    }
  };

  // 重置搜索
  const handleReset = () => {
    setSearchParams({});
    fetchUsers();
  };

  // 创建用户
  const handleCreate = async (values) => {
    try {
      const response = await userAPI.createUser(values);
      if (response.success) {
        message.success('创建用户成功');
        setCreateModalVisible(false);
        form.resetFields();
        fetchUsers();
      } else {
        message.error(response.message || '创建用户失败');
      }
    } catch (error) {
      message.error('创建用户失败');
    }
  };

  // 删除用户
  const handleDelete = async (id) => {
    try {
      const response = await userAPI.deleteUser(id);
      if (response.success) {
        message.success('删除用户成功');
        fetchUsers();
      } else {
        message.error(response.message || '删除用户失败');
      }
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '角色',
      dataIndex: 'roles',
      key: 'roles',
      render: (roles) => (
        <Space>
          {roles?.map((role) => (
            <Tag key={role.id} color="blue">{role.name}</Tag>
          )) || <Tag>无</Tag>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => navigate(`/users/${record.id}`)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Space style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
        >
          创建用户
        </Button>
      </Space>

      {/* 搜索区域 */}
      <Card style={{ marginBottom: 16 }}>
        <Row gutter={16}>
          <Col span={6}>
            <Input
              placeholder="用户名"
              value={searchParams.name}
              onChange={(e) => setSearchParams({ ...searchParams, name: e.target.value })}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              placeholder="最小年龄"
              style={{ width: '100%' }}
              value={searchParams.minAge}
              onChange={(value) => setSearchParams({ ...searchParams, minAge: value })}
            />
          </Col>
          <Col span={6}>
            <InputNumber
              placeholder="最大年龄"
              style={{ width: '100%' }}
              value={searchParams.maxAge}
              onChange={(value) => setSearchParams({ ...searchParams, maxAge: value })}
            />
          </Col>
          <Col span={6}>
            <Space>
              <Button
                type="primary"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              >
                搜索
              </Button>
              <Button onClick={handleReset}>重置</Button>
            </Space>
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />

      {/* 创建用户模态框 */}
      <Modal
        title="创建用户"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreate}
        >
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
          <Form.Item
            name="password"
            label="密码"
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password placeholder="密码（至少6位）" />
          </Form.Item>
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                创建
              </Button>
              <Button onClick={() => {
                setCreateModalVisible(false);
                form.resetFields();
              }}>
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserList;

