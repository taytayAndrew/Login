import React from 'react';
import { Card, Progress, Tag, Space, Button, Tooltip } from 'antd';
import { EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Epic {
    id: string;
    name: string;
    description?: string;
    color?: string;
    startDate?: string;
    endDate?: string;
    progress: number;
    tasks?: any[];
}

interface EpicCardProps {
    epic: Epic;
    onEdit?: (epic: Epic) => void;
    onDelete?: (epicId: string) => void;
}

const EpicCard: React.FC<EpicCardProps> = ({ epic, onEdit, onDelete }) => {
    const isOverdue = epic.endDate && dayjs(epic.endDate).isBefore(dayjs()) && epic.progress < 100;

    return (
        <Card
            size="small"
            style={{
                marginBottom: '12px',
                borderLeft: `4px solid ${epic.color || '#1890ff'}`,
            }}
            actions={[
                <Tooltip title="Edit">
                    <EditOutlined key="edit" onClick={() => onEdit?.(epic)} />
                </Tooltip>,
                <Tooltip title="Delete">
                    <DeleteOutlined key="delete" onClick={() => onDelete?.(epic.id)} />
                </Tooltip>,
            ]}
        >
            <Space direction="vertical" style={{ width: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '16px' }}>{epic.name}</span>
                    {isOverdue && <Tag color="red">Overdue</Tag>}
                </div>

                {epic.description && (
                    <div style={{ color: '#666', fontSize: '14px' }}>
                        {epic.description}
                    </div>
                )}

                <div>
                    <Progress percent={epic.progress} size="small" status={epic.progress === 100 ? 'success' : 'active'} />
                </div>

                <Space>
                    {epic.startDate && (
                        <Tag icon={<CalendarOutlined />} color="blue">
                            {dayjs(epic.startDate).format('MMM DD, YYYY')}
                        </Tag>
                    )}
                    {epic.endDate && (
                        <Tag icon={<CalendarOutlined />} color={isOverdue ? 'red' : 'green'}>
                            {dayjs(epic.endDate).format('MMM DD, YYYY')}
                        </Tag>
                    )}
                    {epic.tasks && (
                        <Tag>{epic.tasks.length} tasks</Tag>
                    )}
                </Space>
            </Space>
        </Card>
    );
};

export default EpicCard;
