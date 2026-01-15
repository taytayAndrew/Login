import React, { useState } from 'react';
import { List, Button, Input, Space, Empty, Spin, Radio, Select, Tag } from 'antd';
import { PlusOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProjectCard from './ProjectCard';
import CreateProjectModal from './CreateProjectModal';

const { Search } = Input;
const { Option } = Select;

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
    projectLead: {
        id: number;
        name: string;
    };
    archived: boolean;
    createdAt: string;
}

type ViewMode = 'grid' | 'list';

const ProjectList: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId?: string }>();
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [methodologyFilter, setMethodologyFilter] = useState<string | undefined>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['projects', workspaceId, searchQuery, methodologyFilter],
        queryFn: async () => {
            let url = '/api/v1/projects';

            if (searchQuery) {
                url = `/api/v1/projects/search?query=${searchQuery}`;
            } else if (workspaceId) {
                url = `/api/v1/projects/workspace/${workspaceId}`;
            } else if (methodologyFilter) {
                url = `/api/v1/projects/methodology/${methodologyFilter}`;
            }

            const response = await axios.get(url);
            return searchQuery || methodologyFilter ? response.data.content : response.data;
        },
    });

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const getMethodologyColor = (methodology: string) => {
        switch (methodology) {
            case 'SCRUM': return 'blue';
            case 'KANBAN': return 'green';
            case 'TRADITIONAL': return 'orange';
            default: return 'default';
        }
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>Projects</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                    Create Project
                </Button>
            </div>

            <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
                <Space>
                    <Search
                        placeholder="Search projects..."
                        allowClear
                        enterButton={<SearchOutlined />}
                        onSearch={handleSearch}
                        style={{ width: 300 }}
                    />
                    <Select
                        placeholder="Filter by methodology"
                        allowClear
                        style={{ width: 200 }}
                        onChange={setMethodologyFilter}
                    >
                        <Option value="SCRUM">
                            <Tag color={getMethodologyColor('SCRUM')}>SCRUM</Tag>
                        </Option>
                        <Option value="KANBAN">
                            <Tag color={getMethodologyColor('KANBAN')}>KANBAN</Tag>
                        </Option>
                        <Option value="TRADITIONAL">
                            <Tag color={getMethodologyColor('TRADITIONAL')}>TRADITIONAL</Tag>
                        </Option>
                    </Select>
                </Space>
                <Radio.Group value={viewMode} onChange={(e) => setViewMode(e.target.value)}>
                    <Radio.Button value="grid">
                        <AppstoreOutlined /> Grid
                    </Radio.Button>
                    <Radio.Button value="list">
                        <UnorderedListOutlined /> List
                    </Radio.Button>
                </Radio.Group>
            </Space>

            {isLoading ? (
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            ) : !data || data.length === 0 ? (
                <Empty
                    description="No projects found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
                        Create Your First Project
                    </Button>
                </Empty>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {data.map((project: Project) => (
                        <ProjectCard key={project.id} project={project} onUpdate={refetch} />
                    ))}
                </div>
            ) : (
                <List
                    dataSource={data}
                    renderItem={(project: Project) => (
                        <List.Item>
                            <ProjectCard project={project} onUpdate={refetch} listMode />
                        </List.Item>
                    )}
                />
            )}

            <CreateProjectModal
                open={isCreateModalOpen}
                workspaceId={workspaceId}
                onCancel={() => setIsCreateModalOpen(false)}
                onSuccess={() => {
                    refetch();
                    setIsCreateModalOpen(false);
                }}
            />
        </div>
    );
};

export default ProjectList;
