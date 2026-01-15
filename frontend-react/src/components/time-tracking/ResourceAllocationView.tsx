import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Progress, DatePicker, Space, message, Tag } from 'antd';
import { UserOutlined, ClockCircleOutlined, WarningOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface UserWorkload {
    userId: number;
    username: string;
    workload: number;
    capacity: number;
    utilization: number;
    isOverloaded: boolean;
}

interface ResourceAllocationViewProps {
    projectId: number;
}

const ResourceAllocationView: React.FC<ResourceAllocationViewProps> = ({ projectId }) => {
    const [workloadData, setWorkloadData] = useState<UserWorkload[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month')
    ]);
    const [projectUtilization, setProjectUtilization] = useState(0);
    const maxHoursPerWeek = 40;

    useEffect(() => {
        loadResourceAllocation();
    }, [projectId, dateRange]);

    const loadResourceAllocation = async () => {
        setLoading(true);
        try {
            // 获取项目工作量
            const workloadResponse = await axios.get(
                `/api/v1/time-tracking/workload/project/${projectId}`,
                {
                    params: {
                        startDate: dateRange[0].toISOString(),
                        endDate: dateRange[1].toISOString()
                    }
                }
            );

            // 获取超负荷用户
            const overloadedResponse = await axios.get(
                `/api/v1/time-tracking/workload/project/${projectId}/overloaded-users`,
                {
                    params: {
                        startDate: dateRange[0].toISOString(),
                        endDate: dateRange[1].toISOString(),
                        maxHoursPerWeek
                    }
                }
            );

            // 获取项目资源利用率
            const utilizationResponse = await axios.get(
                `/api/v1/time-tracking/workload/project/${projectId}/utilization`,
                {
                    params: {
                        startDate: dateRange[0].toISOString(),
                        endDate: dateRange[1].toISOString()
                    }
                }
            );

            setProjectUtilization(utilizationResponse.data);

            // 计算每个用户的容量和利用率
            const overloadedUsers = new Set(overloadedResponse.data);
            const weeks = dateRange[1].diff(dateRange[0], 'week', true);
            const maxCapacity = Math.ceil(maxHoursPerWeek * weeks);

            const userData: UserWorkload[] = await Promise.all(
                Object.entries(workloadResponse.data).map(async ([userId, workload]) => {
                    // 这里应该从用户服务获取用户名，暂时使用ID
                    const username = `User ${userId}`;
                    const workloadHours = workload as number;
                    const utilization = (workloadHours / maxCapacity) * 100;

                    return {
                        userId: parseInt(userId),
                        username,
                        workload: workloadHours,
                        capacity: maxCapacity,
                        utilization: Math.round(utilization),
                        isOverloaded: overloadedUsers.has(parseInt(userId))
                    };
                })
            );

            setWorkloadData(userData);
        } catch (error) {
            message.error('加载资源分配数据失败');
        } finally {
            setLoading(false);
        }
    };

    const getUtilizationColor = (utilization: number): string => {
        if (utilization < 70) return '#52c41a';
        if (utilization < 90) return '#faad14';
        return '#ff4d4f';
    };

    const getUtilizationStatus = (utilization: number): 'success' | 'normal' | 'exception' => {
        if (utilization < 70) return 'success';
        if (utilization < 90) return 'normal';
        return 'exception';
    };

    const columns: ColumnsType<UserWorkload> = [
        {
            title: '成员',
            dataIndex: 'username',
            key: 'username',
            render: (username: string, record) => (
                <Space>
                    <UserOutlined />
                    <span>{username}</span>
                    {record.isOverloaded && (
                        <Tag color="red" icon={<WarningOutlined />}>
                            超负荷
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: '工作量（小时）',
            dataIndex: 'workload',
            key: 'workload',
            sorter: (a, b) => a.workload - b.workload,
            render: (workload: number) => <strong>{workload}h</strong>,
        },
        {
            title: '容量（小时）',
            dataIndex: 'capacity',
            key: 'capacity',
            render: (capacity: number) => `${capacity}h`,
        },
        {
            title: '利用率',
            dataIndex: 'utilization',
            key: 'utilization',
            sorter: (a, b) => a.utilization - b.utilization,
            render: (utilization: number) => (
                <Space>
                    <Progress
                        percent={utilization}
                        size="small"
                        status={getUtilizationStatus(utilization)}
                        style={{ width: 100 }}
                    />
                    <span style={{ color: getUtilizationColor(utilization) }}>
                        {utilization}%
                    </span>
                </Space>
            ),
        },
        {
            title: '状态',
            key: 'status',
            render: (_, record) => {
                if (record.isOverloaded) {
                    return <Tag color="red">超负荷</Tag>;
                }
                if (record.utilization > 90) {
                    return <Tag color="orange">接近满载</Tag>;
                }
                if (record.utilization > 70) {
                    return <Tag color="blue">正常</Tag>;
                }
                return <Tag color="green">空闲</Tag>;
            },
        },
    ];

    const overloadedCount = workloadData.filter(u => u.isOverloaded).length;
    const avgUtilization = workloadData.length > 0
        ? Math.round(workloadData.reduce((sum, u) => sum + u.utilization, 0) / workloadData.length)
        : 0;

    return (
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Card>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h2>资源分配</h2>
                        <RangePicker
                            value={dateRange}
                            onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
                            format="YYYY-MM-DD"
                        />
                    </div>

                    <Row gutter={16}>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="团队成员"
                                    value={workloadData.length}
                                    prefix={<UserOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="平均利用率"
                                    value={avgUtilization}
                                    suffix="%"
                                    valueStyle={{ color: getUtilizationColor(avgUtilization) }}
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="项目资源利用率"
                                    value={Math.round(projectUtilization)}
                                    suffix="%"
                                    valueStyle={{ color: getUtilizationColor(projectUtilization) }}
                                    prefix={<CheckCircleOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card>
                                <Statistic
                                    title="超负荷成员"
                                    value={overloadedCount}
                                    valueStyle={{ color: overloadedCount > 0 ? '#ff4d4f' : '#52c41a' }}
                                    prefix={<WarningOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>
                </Space>
            </Card>

            <Card title="成员工作量详情">
                <Table
                    columns={columns}
                    dataSource={workloadData}
                    rowKey="userId"
                    loading={loading}
                    pagination={{
                        pageSize: 10,
                        showTotal: (total) => `共 ${total} 名成员`,
                    }}
                />
            </Card>
        </Space>
    );
};

export default ResourceAllocationView;
