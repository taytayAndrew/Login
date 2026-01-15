import React from 'react';
import { Card, Descriptions, Progress, Typography, Space, Statistic, Row, Col, Empty } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface SprintReportProps {
    sprintId: string;
    report: any;
}

const SprintReport: React.FC<SprintReportProps> = ({ sprintId, report }) => {
    if (!report) {
        return (
            <Card>
                <Empty description="No report data available" />
            </Card>
        );
    }

    const completionPercentage = report.totalStoryPoints > 0
        ? Math.round((report.completedStoryPoints / report.totalStoryPoints) * 100)
        : 0;

    const taskCompletionPercentage = report.totalTasks > 0
        ? Math.round((report.completedTasks / report.totalTasks) * 100)
        : 0;

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="large">
            <Card title="Sprint Overview">
                <Descriptions column={2}>
                    <Descriptions.Item label="Sprint Name">
                        {report.sprint?.name}
                    </Descriptions.Item>
                    <Descriptions.Item label="Status">
                        {report.sprint?.status}
                    </Descriptions.Item>
                    <Descriptions.Item label="Start Date">
                        {report.sprint?.startDate ? new Date(report.sprint.startDate).toLocaleDateString() : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="End Date">
                        {report.sprint?.endDate ? new Date(report.sprint.endDate).toLocaleDateString() : 'N/A'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Duration">
                        {report.durationDays} days
                    </Descriptions.Item>
                    <Descriptions.Item label="Days Remaining">
                        {report.remainingDays} days
                    </Descriptions.Item>
                </Descriptions>

                {report.sprint?.goal && (
                    <div style={{ marginTop: 16 }}>
                        <Text strong>Sprint Goal:</Text>
                        <div style={{ marginTop: 8 }}>
                            <Text>{report.sprint.goal}</Text>
                        </div>
                    </div>
                )}
            </Card>

            <Card title="Progress Metrics">
                <Row gutter={[16, 16]}>
                    <Col span={8}>
                        <Statistic
                            title="Total Tasks"
                            value={report.totalTasks}
                            prefix={<CheckCircleOutlined />}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Completed Tasks"
                            value={report.completedTasks}
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Col>
                    <Col span={8}>
                        <Statistic
                            title="Task Completion"
                            value={taskCompletionPercentage}
                            suffix="%"
                            valueStyle={{ color: taskCompletionPercentage >= 80 ? '#3f8600' : '#cf1322' }}
                        />
                    </Col>
                </Row>

                <div style={{ marginTop: 24 }}>
                    <Text strong>Task Progress</Text>
                    <Progress
                        percent={taskCompletionPercentage}
                        status={taskCompletionPercentage === 100 ? 'success' : 'active'}
                        style={{ marginTop: 8 }}
                    />
                </div>
            </Card>

            <Card title="Story Points">
                <Row gutter={[16, 16]}>
                    <Col span={6}>
                        <Statistic
                            title="Capacity"
                            value={report.capacity || 0}
                            suffix="SP"
                            prefix={<ClockCircleOutlined />}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Total Points"
                            value={report.totalStoryPoints}
                            suffix="SP"
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Completed"
                            value={report.completedStoryPoints}
                            suffix="SP"
                            valueStyle={{ color: '#3f8600' }}
                        />
                    </Col>
                    <Col span={6}>
                        <Statistic
                            title="Remaining"
                            value={report.remainingStoryPoints}
                            suffix="SP"
                            valueStyle={{ color: '#cf1322' }}
                        />
                    </Col>
                </Row>

                <div style={{ marginTop: 24 }}>
                    <Text strong>Story Point Progress</Text>
                    <Progress
                        percent={completionPercentage}
                        status={completionPercentage === 100 ? 'success' : 'active'}
                        style={{ marginTop: 8 }}
                    />
                </div>

                {report.velocity !== null && report.velocity !== undefined && (
                    <div style={{ marginTop: 24 }}>
                        <Statistic
                            title="Velocity"
                            value={report.velocity}
                            suffix="SP"
                            prefix={<TrophyOutlined />}
                            valueStyle={{ color: '#1890ff' }}
                        />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            Story points completed in this sprint
                        </Text>
                    </div>
                )}
            </Card>

            {report.sprint?.retrospectiveNotes && (
                <Card title="Retrospective Notes">
                    <Text>{report.sprint.retrospectiveNotes}</Text>
                </Card>
            )}
        </Space>
    );
};

export default SprintReport;
