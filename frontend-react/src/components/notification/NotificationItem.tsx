import React from 'react';
import { List, Typography, Tag, Space } from 'antd';
import { BellOutlined, CommentOutlined, CheckCircleOutlined, UserAddOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import axios from '../../services/axios';

dayjs.extend(relativeTime);

const { Text } = Typography;

interface NotificationItemProps {
    notification: any;
    onRead: () => void;
}

const getNotificationIcon = (type: string) => {
    switch (type) {
        case 'TASK_COMMENTED':
        case 'TASK_MENTIONED':
            return <CommentOutlined style={{ color: '#1890ff' }} />;
        case 'TASK_COMPLETED':
            return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
        case 'MEMBER_ADDED':
            return <UserAddOutlined style={{ color: '#722ed1' }} />;
        default:
            return <BellOutlined style={{ color: '#faad14' }} />;
    }
};

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onRead }) => {
    const handleClick = async () => {
        if (!notification.read) {
            try {
                await axios.put(`/api/v1/notifications/${notification.id}/read`);
                onRead();
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate to entity if applicable
        if (notification.entityType === 'TASK' && notification.entityId) {
            // TODO: Navigate to task detail
            console.log('Navigate to task:', notification.entityId);
        }
    };

    return (
        <List.Item
            onClick={handleClick}
            style={{
                padding: '12px 16px',
                cursor: 'pointer',
                backgroundColor: notification.read ? 'transparent' : '#f0f5ff',
                borderLeft: notification.read ? 'none' : '3px solid #1890ff',
            }}
        >
            <List.Item.Meta
                avatar={getNotificationIcon(notification.type)}
                title={
                    <Space>
                        <Text strong={!notification.read}>{notification.title}</Text>
                        {!notification.read && <Tag color="blue">New</Tag>}
                    </Space>
                }
                description={
                    <div>
                        <Text type="secondary">{notification.message}</Text>
                        <div style={{ marginTop: '4px' }}>
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                {dayjs(notification.createdAt).fromNow()}
                            </Text>
                        </div>
                    </div>
                }
            />
        </List.Item>
    );
};

export default NotificationItem;
