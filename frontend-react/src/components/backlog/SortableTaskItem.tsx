import React from 'react';
import { Card, Tag, Avatar, Space } from 'antd';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { HolderOutlined } from '@ant-design/icons';
import { Task } from '../../types';

interface SortableTaskItemProps {
    task: Task;
}

const priorityColors: Record<string, string> = {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'blue',
    LOW: 'default',
};

const SortableTaskItem: React.FC<SortableTaskItemProps> = ({ task }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: task.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
        marginBottom: '8px',
    };

    return (
        <div ref={setNodeRef} style={style}>
            <Card
                size="small"
                hoverable
                style={{ cursor: 'move' }}
            >
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Space>
                        <HolderOutlined {...attributes} {...listeners} style={{ cursor: 'grab' }} />
                        <span style={{ fontWeight: 500 }}>{task.identifier}</span>
                        <span>{task.title}</span>
                    </Space>
                    <Space>
                        {task.epic && (
                            <Tag color="purple">{task.epic.name}</Tag>
                        )}
                        <Tag color={priorityColors[task.priority]}>{task.priority}</Tag>
                        <Tag>{task.status}</Tag>
                        {task.storyPoints && (
                            <Tag color="cyan">{task.storyPoints} SP</Tag>
                        )}
                        {task.assignee && (
                            <Avatar size="small" src={task.assignee.avatar}>
                                {task.assignee.username?.[0]?.toUpperCase()}
                            </Avatar>
                        )}
                    </Space>
                </Space>
            </Card>
        </div>
    );
};

export default SortableTaskItem;
