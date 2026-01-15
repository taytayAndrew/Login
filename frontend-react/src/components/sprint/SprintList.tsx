import React, { useState, useEffect } from 'react';
import { List, Card, Tag, Button, Space, Progress, Typography, message, Empty } from 'antd';
import { PlusOutlined, PlayCircleOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from '@/services/axios';
import CreateSprintModal from './CreateSprintModal';
import SprintBoard from './SprintBoard';

const { Text, Title } = Typography;

interface Sprint {
    id: string;
    name: string;
    goal: string;
    status: string;
    startDate: string;
    endDate: string;
    capacity: number;
    velocity: number;
    projectId: string;
}

interface SprintListProps {
    projectId: string;
}

const getStatusColor = (status: string): string => {
    switch (status) {
        case 'ACTIVE':
            return 'processing';
        case 'COMPLETED':
            return 'success';
        case 'PLANNED':
            return 'default';
        default:
            return 'default';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'ACTIVE':
            return <PlayCircleOutlined />;
        case 'COMPLETED':
            return <CheckCircleOutlined />;
        case 'PLANNED':
            return <CalendarOutlined />;
        default:
            return null;
    }
};

const SprintList: React.FC<SprintListProps> = ({ projectId }) => {
    const [sprints, setSprints] = useState<Sprint[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);

    useEffect(() => {
        loadSprints();
    }, [projectId]);

    const loadSprints = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/sprints/project/${projectId}`);
            setSprints(response.data);
        } catch (error) {
            message.error('Failed to load sprints');
        } finally {
            setLoading(false);
        }
    };

    const handleStartSprint = async (sprintId: string) => {
        try {
            await axios.post(`/api/v1/sprints/${sprintId}/start`);
            message.success('Sprint started successfully');
            loadSprints();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to start sprint');
        }
    };

    const handleCompleteSprint = async (sprintId: string) => {
        try {
            await axios.post(`/api/v1/sprints/${sprintId}/complete`, {
                retrospectiveNotes: '',
            });
            message.success('Sprint completed successfully');
            loadSprints();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to complete sprint');
        }
    };

    const calculateProgress = (sprint: Sprint): number => {
        if (!sprint.capacity || sprint.capacity === 0) return 0;
        if (!sprint.velocity) return 0;
        return Math.min(100, (sprint.velocity / sprint.capacity) * 100);
    };

    const getDaysRemaining = (endDate: string): number => {
        const end = new Date(endDate);
        const today = new Date();
        const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    if (selectedSprint) {
        return (
            <SprintBoard
                sprint={selectedSprint}
                onBack={() => setSelectedSprint(null)}
                onUpdate={loadSprints}
            />
        );
    }

    return (
        <div>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={4}>Sprints</Title>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => setShowCreateModal(true)}
                >
                    Create Sprint
                </Button>
            </div>

            {sprints.length === 0 ? (
                <Empty description="No sprints found. Create your first sprint to get started." />
            ) : (
                <List
                    loading={loading}
                    dataSource={sprints}
                    renderItem={(sprint) => (
                        <List.Item>
                            <Card
                                style={{ width: '100%' }}
                                hoverable
                                onClick={() => setSelectedSprint(sprint)}
                            >
                                <Space direction="vertical" style={{ width: '100%' }} size="middle">
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <Space>
                                            <Title level={5} style={{ margin: 0 }}>
                                                {sprint.name}
                                            </Title>
                                            <Tag color={getStatusColor(sprint.status)} icon={getStatusIcon(sprint.status)}>
                                                {sprint.status}
                                            </Tag>
                                        </Space>
                                        <Space>
                                            {sprint.status === 'PLANNED' && (
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    icon={<PlayCircleOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleStartSprint(sprint.id);
                                                    }}
                                                >
                                                    Start
                                                </Button>
                                            )}
                                            {sprint.status === 'ACTIVE' && (
                                                <Button
                                                    size="small"
                                                    icon={<CheckCircleOutlined />}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleCompleteSprint(sprint.id);
                                                    }}
                                                >
                                                    Complete
                                                </Button>
                                            )}
                                        </Space>
                                    </div>

                                    {sprint.goal && (
                                        <Text type="secondary">{sprint.goal}</Text>
                                    )}

                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <div>
                                            <Text type="secondary">Start Date: </Text>
                                            <Text>{new Date(sprint.startDate).toLocaleDateString()}</Text>
                                        </div>
                                        <div>
                                            <Text type="secondary">End Date: </Text>
                                            <Text>{new Date(sprint.endDate).toLocaleDateString()}</Text>
                                        </div>
                                        {sprint.status === 'ACTIVE' && (
                                            <div>
                                                <Text type="secondary">Days Remaining: </Text>
                                                <Text strong>{getDaysRemaining(sprint.endDate)}</Text>
                                            </div>
                                        )}
                                    </div>

                                    {sprint.capacity && (
                                        <div>
                                            <div style={{ marginBottom: 8 }}>
                                                <Text type="secondary">Capacity: {sprint.capacity} SP</Text>
                                                {sprint.velocity !== null && sprint.velocity !== undefined && (
                                                    <Text type="secondary" style={{ marginLeft: 16 }}>
                                                        Velocity: {sprint.velocity} SP
                                                    </Text>
                                                )}
                                            </div>
                                            {sprint.status !== 'PLANNED' && (
                                                <Progress
                                                    percent={Math.round(calculateProgress(sprint))}
                                                    status={sprint.status === 'COMPLETED' ? 'success' : 'active'}
                                                />
                                            )}
                                        </div>
                                    )}
                                </Space>
                            </Card>
                        </List.Item>
                    )}
                />
            )}

            <CreateSprintModal
                visible={showCreateModal}
                projectId={projectId}
                onClose={() => setShowCreateModal(false)}
                onSuccess={() => {
                    setShowCreateModal(false);
                    loadSprints();
                }}
            />
        </div>
    );
};

export default SprintList;
