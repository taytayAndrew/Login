import React from 'react';
import { Card, Progress, Tag, Space, Button } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, WarningOutlined, EditOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Milestone {
    id: number;
    name: string;
    description: string;
    startDate: string;
    dueDate: string;
    color: string;
    isCompleted: boolean;
    completedDate: string | null;
    progress: number;
    tasks: any[];
}

interface MilestoneCardProps {
    milestone: Milestone;
    onComplete?: (milestoneId: number) => void;
    onEdit?: (milestone: Milestone) => void;
}

const MilestoneCard: React.FC<MilestoneCardProps> = ({ milestone, onComplete, onEdit }) => {
    const getMilestoneStatus = () => {
        if (milestone.isCompleted) {
            return { icon: <CheckCircleOutlined />, color: 'success', text: '已完成' };
        }
        const now = dayjs();
        const dueDate = dayjs(milestone.dueDate);
        if (now.isAfter(dueDate)) {
            return { icon: <WarningOutlined />, color: 'error', text: '已逾期' };
        }
        const daysLeft = dueDate.diff(now, 'day');
        if (daysLeft <= 7) {
            return { icon: <ClockCircleOutlined />, color: 'warning', text: `剩余${daysLeft}天` };
        }
        return { icon: <ClockCircleOutlined />, color: 'processing', text: '进行中' };
    };

    const status = getMilestoneStatus();
    const startDate = dayjs(milestone.startDate);
    const dueDate = dayjs(milestone.dueDate);
    const duration = dueDate.diff(startDate, 'day');
    const completedTasks = milestone.tasks?.filter((t: any) => t.status === 'DONE').length || 0;
    const totalTasks = milestone.tasks?.length || 0;

    return (
        <Card
            style={{
                borderLeft: `4px solid ${milestone.color}`,
                marginBottom: 16
            }}
            bodyStyle={{ padding: 16 }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        {/* 标题和状态 */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: 16 }}>{milestone.name}</h3>
                            <Tag color={status.color} icon={status.icon}>
                                {status.text}
                            </Tag>
                        </div>

                        {/* 描述 */}
                        {milestone.description && (
                            <p style={{ color: '#666', margin: 0, fontSize: 13 }}>
                                {milestone.description}
                            </p>
                        )}

                        {/* 日期信息 */}
                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#999' }}>
                            <span>📅 {startDate.format('YYYY-MM-DD')} ~ {dueDate.format('YYYY-MM-DD')}</span>
                            <span>⏱️ {duration}天</span>
                            <span>📋 {completedTasks}/{totalTasks}个任务</span>
                        </div>

                        {/* 进度条 */}
                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12, color: '#666' }}>完成进度</span>
                                <span style={{ fontSize: 12, fontWeight: 500 }}>
                                    {Math.round(milestone.progress)}%
                                </span>
                            </div>
                            <Progress
                                percent={milestone.progress}
                                status={milestone.isCompleted ? 'success' : 'active'}
                                strokeColor={milestone.color}
                                showInfo={false}
                            />
                        </div>

                        {/* 完成日期 */}
                        {milestone.isCompleted && milestone.completedDate && (
                            <div style={{ fontSize: 12, color: '#52c41a' }}>
                                ✓ 完成于 {dayjs(milestone.completedDate).format('YYYY-MM-DD')}
                            </div>
                        )}
                    </Space>
                </div>

                {/* 操作按钮 */}
                <Space direction="vertical" style={{ marginLeft: 16 }}>
                    {onEdit && (
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => onEdit(milestone)}
                        >
                            编辑
                        </Button>
                    )}
                    {!milestone.isCompleted && onComplete && (
                        <Button
                            type="primary"
                            size="small"
                            onClick={() => onComplete(milestone.id)}
                        >
                            标记完成
                        </Button>
                    )}
                </Space>
            </div>
        </Card>
    );
};

export default MilestoneCard;
