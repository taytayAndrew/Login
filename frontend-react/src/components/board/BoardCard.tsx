import React from 'react';
import { Card, Tag, Avatar, Space, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Task {
    id: string;
    taskKey: string;
    title: string;
    status: string;
    priority: string;
    assignee?: {
        id: string;
        username: string;
    };
}

interface BoardCardProps {
    task: Task;
    isDragging: boolean;
}

const getPriorityColor = (priority: string): string => {
    switch (priority) {
        case 'CRITICAL':
            return 'red';
        case 'HIGH':
            return 'orange';
        case 'MEDIUM':
            return 'blue';
        case 'LOW':
            return 'green';
        default:
            return 'default';
    }
};

const BoardCard: React.FC<BoardCardProps> = ({ task, isDragging }) => {
    return (
        <Card
            size="small"
            hoverable
            style={{
                cursor: 'pointer',
                opacity: isDragging ? 0.5 : 1,
                boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : undefined,
            }}
            bodyStyle={{ padding: '12px' }}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="small">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        {task.taskKey}
                    </Text>
                    <Tag color={getPriorityColor(task.priority)} style={{ margin: 0, fontSize: '10px' }}>
                        {task.priority}
                    </Tag>
                </div>

                <Text strong style={{ fontSize: '14px' }}>
                    {task.title}
                </Text>

                {task.assignee && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Avatar size="small" icon={<UserOutlined />} />
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {task.assignee.username}
                        </Text>
                    </div>
                )}
            </Space>
        </Card>
    );
};

export default BoardCard;
