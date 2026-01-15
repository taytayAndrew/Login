import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Dropdown, Button, Modal, message } from 'antd';
import { MoreOutlined, TeamOutlined, FolderOutlined, SettingOutlined, DeleteOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { MenuProps } from 'antd';

const { Text, Paragraph } = Typography;

interface Workspace {
    id: string;
    name: string;
    description: string;
    owner: {
        id: number;
        name: string;
    };
    archived: boolean;
    createdAt: string;
    updatedAt: string;
}

interface WorkspaceCardProps {
    workspace: Workspace;
    onUpdate: () => void;
    listMode?: boolean;
}

const WorkspaceCard: React.FC<WorkspaceCardProps> = ({ workspace, onUpdate, listMode = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleArchive = () => {
        Modal.confirm({
            title: 'Archive Workspace',
            content: `Are you sure you want to archive "${workspace.name}"? This will archive all projects within it.`,
            okText: 'Archive',
            okType: 'danger',
            onOk: async () => {
                try {
                    setLoading(true);
                    await axios.delete(`/api/v1/workspaces/${workspace.id}`);
                    message.success('Workspace archived successfully');
                    onUpdate();
                } catch (error) {
                    message.error('Failed to archive workspace');
                } finally {
                    setLoading(false);
                }
            },
        });
    };

    const menuItems: MenuProps['items'] = [
        {
            key: 'settings',
            label: 'Settings',
            icon: <SettingOutlined />,
            onClick: () => navigate(`/workspaces/${workspace.id}/settings`),
        },
        {
            key: 'members',
            label: 'Manage Members',
            icon: <TeamOutlined />,
            onClick: () => navigate(`/workspaces/${workspace.id}/members`),
        },
        {
            type: 'divider',
        },
        {
            key: 'archive',
            label: 'Archive',
            icon: <DeleteOutlined />,
            danger: true,
            onClick: handleArchive,
        },
    ];

    const cardContent = (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <Typography.Title level={4} style={{ margin: 0, marginBottom: '4px' }}>
                        {workspace.name}
                    </Typography.Title>
                    <Text type="secondary" style={{ fontSize: '12px' }}>
                        Owner: {workspace.owner.name}
                    </Text>
                </div>
                <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
            </div>

            <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: '12px', minHeight: '40px' }}
            >
                {workspace.description || 'No description'}
            </Paragraph>

            <Space size="small">
                <Tag icon={<FolderOutlined />} color="blue">
                    Projects
                </Tag>
                <Tag icon={<TeamOutlined />} color="green">
                    Members
                </Tag>
            </Space>
        </>
    );

    if (listMode) {
        return (
            <Card
                hoverable
                style={{ width: '100%', cursor: 'pointer' }}
                onClick={() => navigate(`/workspaces/${workspace.id}`)}
                loading={loading}
            >
                {cardContent}
            </Card>
        );
    }

    return (
        <Card
            hoverable
            style={{ height: '100%', cursor: 'pointer' }}
            onClick={() => navigate(`/workspaces/${workspace.id}`)}
            loading={loading}
        >
            {cardContent}
        </Card>
    );
};

export default WorkspaceCard;
