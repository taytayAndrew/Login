import React, { useState, useEffect } from 'react';
import { Card, List, Button, Empty, Spin, Space, Typography, Divider } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import axios from '../../services/axios';
import NotificationItem from './NotificationItem';

const { Title } = Typography;

interface NotificationDropdownProps {
    onClose: () => void;
    onCountChange: (count: number) => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose, onCountChange }) => {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async (pageNum = 0) => {
        setLoading(true);
        try {
            const response = await axios.get('/api/v1/notifications', {
                params: {
                    page: pageNum,
                    size: 10,
                    unreadOnly: false,
                },
            });
            if (response.data.success) {
                const data = response.data.data;
                if (pageNum === 0) {
                    setNotifications(data.content);
                } else {
                    setNotifications([...notifications, ...data.content]);
                }
                setHasMore(!data.last);
                setPage(pageNum);
            }
        } catch (error) {
            console.error('Error fetching notifications:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await axios.put('/api/v1/notifications/read-all');
            fetchNotifications(0);
            onCountChange(0);
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationRead = () => {
        fetchNotifications(0);
        // Update unread count
        const unreadCount = notifications.filter(n => !n.read).length;
        onCountChange(Math.max(0, unreadCount - 1));
    };

    const loadMore = () => {
        if (!loading && hasMore) {
            fetchNotifications(page + 1);
        }
    };

    return (
        <Card
            style={{ width: 400, maxHeight: 600, overflow: 'auto' }}
            bodyStyle={{ padding: 0 }}
        >
            <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
                <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                    <Title level={5} style={{ margin: 0 }}>Notifications</Title>
                    <Button
                        type="link"
                        size="small"
                        icon={<CheckOutlined />}
                        onClick={handleMarkAllAsRead}
                    >
                        Mark all as read
                    </Button>
                </Space>
            </div>

            {loading && notifications.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>
                    <Spin />
                </div>
            ) : notifications.length === 0 ? (
                <Empty
                    description="No notifications"
                    style={{ padding: '40px' }}
                />
            ) : (
                <>
                    <List
                        dataSource={notifications}
                        renderItem={(notification) => (
                            <NotificationItem
                                key={notification.id}
                                notification={notification}
                                onRead={handleNotificationRead}
                            />
                        )}
                    />
                    {hasMore && (
                        <div style={{ textAlign: 'center', padding: '12px' }}>
                            <Button onClick={loadMore} loading={loading}>
                                Load More
                            </Button>
                        </div>
                    )}
                </>
            )}
        </Card>
    );
};

export default NotificationDropdown;
