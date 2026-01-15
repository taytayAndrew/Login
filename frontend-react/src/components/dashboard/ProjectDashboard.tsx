import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Statistic, Progress, Spin, message, Tag } from 'antd';
import {
    CheckCircleOutlined,
    ClockCircleOutlined,
    SyncOutlined,
    WarningOutlined,
    RocketOutlined,
} from '@ant-design/icons';
import axios from '../../services/axios';

interface DashboardProps {
    projectId: string;
}

const ProjectDashboard: React.FC<DashboardProps> = ({ projectId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, [projectId]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/dashboard`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load dashboard data');
            console.error('Error fetching dashboard:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    const getHealthColor = (status: string) => {
        switch (status) {
            case 'ON_TRACK':
                return 'success';
            case 'AT_RISK':
                return 'warning';
            case 'DELAYED':
                return 'error';
            default:
                return 'default';
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <Row gutter={[16, 16]}>
                {/* Task Statistics */}
                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Total Tasks"
                            value={data.totalTasks}
                            prefix={<RocketOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="To Do"
                            value={data.todoTasks}
                            prefix={<ClockCircleOutlined />}
                            valueStyle={{ color: '#faad14' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="In Progress"
                            value={data.inProgressTasks}
                            prefix={<SyncOutlined spin />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                    </Card>
                </Col>

                <Col xs={24} sm={12} lg={6}>
                    <Card>
                        <Statistic
                            title="Done"
                            value={data.doneTasks}
                            prefix={<CheckCircleOutlined />}
                            valueStyle={{ color: '#52c41a' }}
                        />
                    </Card>
                </Col>

                {/* Completion Rate */}
                <Col xs={24} lg={12}>
                    <Card title="Completion Rate">
                        <Progress
                            percent={Math.round(data.completionRate)}
                            status={data.completionRate > 70 ? 'success' : data.completionRate > 40 ? 'normal' : 'exception'}
                            strokeWidth={15}
                        />
                        <div style={{ marginTop: '16px', textAlign: 'center' }}>
                            <Statistic
                                value={data.doneTasks}
                                suffix={`/ ${data.totalTasks} tasks completed`}
                            />
                        </div>
                    </Card>
                </Col>

                {/* Overdue Tasks */}
                <Col xs={24} lg={12}>
                    <Card title="Overdue Tasks">
                        <Statistic
                            value={data.overdueTasks}
                            prefix={<WarningOutlined />}
                            valueStyle={{ color: data.overdueTasks > 0 ? '#ff4d4f' : '#52c41a' }}
                            suffix={data.overdueTasks > 0 ? 'tasks need attention' : 'All on track!'}
                        />
                    </Card>
                </Col>

                {/* Active Sprint */}
                {data.activeSprint && (
                    <Col xs={24}>
                        <Card title="Active Sprint">
                            <Row gutter={16}>
                                <Col span={12}>
                                    <div>
                                        <h3>{data.activeSprint.name}</h3>
                                        <p>
                                            <Tag color="blue">
                                                {new Date(data.activeSprint.startDate).toLocaleDateString()} -{' '}
                                                {new Date(data.activeSprint.endDate).toLocaleDateString()}
                                            </Tag>
                                        </p>
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Progress
                                        type="circle"
                                        percent={Math.round(data.activeSprint.progress)}
                                        width={120}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                )}
            </Row>
        </div>
    );
};

export default ProjectDashboard;
