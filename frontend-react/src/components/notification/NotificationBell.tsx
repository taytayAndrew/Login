import React, { useState, useEffect } from 'react';
import { Badge, Dropdown, Button } from 'antd';
import { BellOutlined } from '@ant-design/icons';
import axios from '../../services/axios';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell: React.FC = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        fetchUnreadCount();
        // Poll for new notifications every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchUnreadCount = async () => {
        try {
            const response = await axios.get('/api/v1/notifications/unread-count');
            if (response.data.success) {
                setUnreadCount(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching unread count:', error);
        }
    };

    const handleOpenChange = (flag: boolean) => {
        setOpen(flag);
        if (flag) {
            // Refresh count when opening
            fetchUnreadCount();
        }
    };

    return (
        <Dropdown
            dropdownRender={() => (
                <NotificationDropdown
                    onClose={() => setOpen(false)}
                    onCountChange={setUnreadCount}
                />
            )}
            trigger={['click']}
            open={open}
            onOpenChange={handleOpenChange}
            placement="bottomRight"
        >
            <Button
                type="text"
                icon={
                    <Badge count={unreadCount} overflowCount={99}>
                        <BellOutlined style={{ fontSize: '20px' }} />
                    </Badge>
                }
            />
        </Dropdown>
    );
};

export default NotificationBell;
