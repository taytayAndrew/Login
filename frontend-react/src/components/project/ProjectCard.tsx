import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Dropdown, Button, Modal, message } from 'antd';
import { MoreOutlined, TeamOutlined, SettingOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { MenuProps } from 'antd';

const { Text, Paragraph } = Typography;

interface Project {
    id: string;
    name: string;
    key: string;
    description: string;
    methodology: 'SCRUM' | 'KANBAN' | 'TRADITIONAL';
    visibility: 'PUBLIC' | 'PRIVATE' | 'TEAM_ONLY';
    workspace: {
        id: string;
        name: string;
    };
    projectLead?: {
        id: number;
        name: string;
    };
    archived: boolean;
    createdAt: string;
}

interface ProjectCardProps {
    project: Project;
    onUpdate: () => void;
    listMode?: boolean;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onUpdate, listMode = false }) => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const handleArchive = () => {
        Modal.confirm({
            title: 'Archive Project',
            content: `Are you sure you want to archive "${project.name}"?`,
            okText: 'Archive',
            okType: 'danger',
            onOk: async () => {
                try {
                    setLoading(true);
                    await axios.delete(`/api/v1/projects/${project.id}`);
                    message.success('Project archived successfully');
                    onUpdate();
                } catch (error) {
                    message.error('Failed to archive project');
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
            onClick: () => navigate(`/projects/${project.id}/settings`),
        },
        {
            key: 'members',
            label: 'Manage Members',
            icon: <TeamOutlined />,
            onClick: () => navigate(`/projects/${project.id}/members`),
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

    const getMethodologyColor = (methodology: string) => {
        switch (methodology) {
            case 'SCRUM': return 'blue';
            case 'KANBAN': return 'green';
            case 'TRADITIONAL': return 'orange';
            default: return 'default';
        }
    };

    const cardContent = (
        <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div style={{ flex: 1 }}>
                    <Space direction="vertical" size={4} style={{ width: '100%' }}>
                        <Space>
                            <Tag color="purple">{project.key}</Tag>
                            <Tag color={getMethodologyColor(project.methodology)}>{project.methodology}</Tag>
                        </Space>
                        <Typography.Title level={4} style={{ margin: 0 }}>
                            {project.name}
                        </Typography.Title>
                        <Text type="secondary" style={{ fontSize: '12px' }}>
                            {project.workspace.name}
                        </Text>
                    </Space>
                </div>
                <Dropdown menu={{ items: menuItems }} trigger={['click']}>
                    <Button type="text" icon={<MoreOutlined />} onClick={(e) => e.stopPropagation()} />
                </Dropdown>
            </div>

            <Paragraph
                ellipsis={{ rows: 2 }}
                style={{ marginBottom: '12px', minHeight: '40px' }}
            >
                {project.description || 'No description'}
            </Paragraph>

            <Space size="small" wrap>
                {project.projectLead && (
                    <Tag icon={<TeamOutlined />}>
                        Lead: {project.projectLead.name}
                    </Tag>
                )}
                <Tag icon={<CalendarOutlined />}>
                    {new Date(project.createdAt).toLocaleDateString()}
                </Tag>
            </Space>
        </>
    );

    if (listMode) {
        return (
            <Card
                hoverable
                style={{ width: '100%', cursor: 'pointer' }}
                onClick={() => navigate(`/projects/${project.id}`)}
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
            onClick={() => navigate(`/projects/${project.id}`)}
            loading={loading}
        >
            {cardContent}
        </Card>
    );
};

export default ProjectCard;
