import { Card, Row, Col, Statistic, Typography } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useState } from 'react';
import { userAPI } from '../services/api';

const { Title } = Typography;

const Home = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalUsers: 0,
    loading: true,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await userAPI.listUsers();
        if (response.success) {
          setStats({
            totalUsers: response.data?.length || 0,
            loading: false,
          });
        }
      } catch (error) {
        setStats({ ...stats, loading: false });
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <Title level={2}>欢迎回来，{user?.name || '用户'}！</Title>
      
      <Row gutter={16} style={{ marginTop: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title="当前用户"
              value={user?.name || '未知'}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="用户角色"
              value={user?.roles?.map(r => r.name).join(', ') || '无'}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title="系统用户总数"
              value={stats.totalUsers}
              prefix={<TeamOutlined />}
              loading={stats.loading}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <Title level={4}>用户信息</Title>
        <Row gutter={16}>
          <Col span={6}>
            <strong>ID:</strong> {user?.id}
          </Col>
          <Col span={6}>
            <strong>姓名:</strong> {user?.name}
          </Col>
          <Col span={6}>
            <strong>年龄:</strong> {user?.age}
          </Col>
          <Col span={6}>
            <strong>邮箱:</strong> {user?.email || 'N/A'}
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default Home;

