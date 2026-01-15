import React from 'react';
import { Card, Tag, Space, Avatar, Typography } from 'antd';
import { ClockCircleOutlined, UserOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface Task {
    id: string;
    identifier: string;
    title: string;
    type: string;
    status: string;
    priority: string;
    assignee?: { id: number; name: string };
    dueDate?: string;
}

interface TaskCardProps {
    task: Task;
    onClick?: () => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick }) => {
    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            TODO: 'default', IN_PROGRESS: 'blue', IN_REVIEW: 'orange',
            DONE: 'green', BLOCKED: 'red', CANCELLED: 'gray'
        };
        return colors[status] || 'default';
    };

    const getPriorityColor = (priority: string) => {
        const colors: Record<string, string> = {
            LOWEST: 'default', LOW: 'blue', MEDIUM: 'cyan',
            HIGH: 'orange', HIGHEST: 'red', CRITICAL: 'magenta'
        };
        return colors[priority] || 'default';
    };

    return (
        <Card
            hoverable
            size="small"
            onClick={onClick}
            style={{ marginBottom: 8, cursor: 'pointer' }}
        >
            <Space direction="vertical" size="small" style={{ width: '100%' }}>
                <Space>
                    <Text type="secondary" style={{ fontSize: 12 }}>{task.identifier}</Text>
                    <Tag color={getPriorityColor(task.priority)} style={{ fontSize: 10 }}>
                        {task.priority}
                    </Tag>
                </Space>

                <Text strong>{task.title}</Text>

                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Tag color={getStatusColor(task.status)}>{task.status}</Tag>

                    <Space size="small">
                        {task.dueDate && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                                <ClockCircleOutlined /> {new Date(task.dueDate).toLocaleDateString()}
                            </Text>
                        )}
                        {task.assignee ? (
                            <Avatar size="small" style={{ backgroundColor: '#1890ff' }}>
                                {task.assignee.name.charAt(0)}
                            </Avatar>
                        ) : (
                            <Avatar size="small" icon={<UserOutlined />} />
                        )}
                    </Space>
                </Space>
            </Space>
        </Card>
    );
};

export default TaskCard;
