import React, { useState, useEffect } from 'react';
import { Card, Button, Space, Typography, Tabs, message, Statistic, Row, Col } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import axios from '@/services/axios';
import SprintBacklog from './SprintBacklog';
import BurndownChart from './BurndownChart';
import SprintReport from './SprintReport';

const { Title, Text } = Typography;

interface Sprint {
    id: string;
    name: string;
    goal: string;
    status: string;
    startDate: string;
    endDate: string;
    capacity: number;
    velocity: number;
}

interface SprintBoardProps {
    sprint: Sprint;
    onBack: () => void;
    onUpdate: () => void;
}

const SprintBoard: React.FC<SprintBoardProps> = ({ sprint, onBack, onUpdate }) => {
    const [sprintData, setSprintData] = useState<Sprint>(sprint);
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSprintReport();
    }, [sprint.id]);

    const loadSprintReport = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/sprints/${sprint.id}/report`);
            setReport(response.data);
        } catch (error) {
            console.error('Failed to load sprint report:', error);
        } finally {
            setLoading(false);
        }
    };

    const getDaysRemaining = (): number => {
        const end = new Date(sprintData.endDate);
        const today = new Date();
        const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        return Math.max(0, diff);
    };

    const getCompletionPercentage = (): number => {
        if (!report || !report.totalStoryPoints || report.totalStoryPoints === 0) return 0;
        return Math.round((report.completedStoryPoints / report.totalStoryPoints) * 100);
    };

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button icon={<ArrowLeftOutlined />} onClick={onBack}>
                    Back to Sprints
                </Button>
            </div>

            <Card style={{ marginBottom: 16 }}>
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <Title level={3} style={{ margin: 0 }}>
                            {sprintData.name}
                        </Title>
                        {sprintData.goal && (
                            <Text type="secondary">{sprintData.goal}</Text>
                        )}
                    </div>

                    {report && (
                        <Row gutter={16}>
                            <Col span={6}>
                                <Statistic
                                    title="Total Tasks"
                                    value={report.totalTasks}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Completed Tasks"
                                    value={report.completedTasks}
                                    suffix={`/ ${report.totalTasks}`}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title="Story Points"
                                    value={report.completedStoryPoints}
                                    suffix={`/ ${report.totalStoryPoints}`}
                                />
                            </Col>
                            <Col span={6}>
                                <Statistic
                                    title={sprintData.status === 'ACTIVE' ? 'Days Remaining' : 'Duration'}
                                    value={sprintData.status === 'ACTIVE' ? getDaysRemaining() : report.durationDays}
                                    suffix="days"
                                />
                            </Col>
                        </Row>
                    )}
                </Space>
            </Card>

            <Tabs
                defaultActiveKey="backlog"
                items={[
                    {
                        key: 'backlog',
                        label: 'Sprint Backlog',
                        children: (
                            <SprintBacklog
                                sprintId={sprint.id}
                                projectId={sprintData.projectId}
                                onUpdate={loadSprintReport}
                            />
                        ),
                    },
                    {
                        key: 'burndown',
                        label: 'Burndown Chart',
                        children: <BurndownChart sprintId={sprint.id} />,
                    },
                    {
                        key: 'report',
                        label: 'Sprint Report',
                        children: <SprintReport sprintId={sprint.id} report={report} />,
                    },
                ]}
            />
        </div>
    );
};

export default SprintBoard;
