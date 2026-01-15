import React, { useState } from 'react';
import { List, Card, Button, Input, Space, Empty, Spin, Radio, message } from 'antd';
import { PlusOutlined, SearchOutlined, AppstoreOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import WorkspaceCard from './WorkspaceCard';
import CreateWorkspaceModal from './CreateWorkspaceModal';

const { Search } = Input;

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

type ViewMode = 'grid' | 'list';

const WorkspaceList: React.FC = () => {
    const [viewMode, setViewMode] = useState<ViewMode>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['workspaces', searchQuery],
        queryFn: async () => {
            const url = searchQuery
                ? `/api/v1/workspaces/search?query=${searchQuery}`
                : '/api/v1/workspaces/my';
            const response = await axios.get(url);
            return searchQuery ? response.data.content : response.data;
        },
    });

    const handleSearch = (value: string) => {
        setSearchQuery(value);
    };

    const handleCreateSuccess = () => {
        message.success('Workspace created successfully');
        refetch();
        setIsCreateModalOpen(false);
    };

    return (
        <div style={{ padding: '24px' }}>
            <div style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ margin: 0 }}>Workspaces</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                    Create Workspace
                </Button>
            </div>

            <Space style={{ marginBottom: '16px', width: '100%', justifyContent: 'space-between' }}>
                <Search
                    placeholder="Search workspaces..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    onSearch={handleSearch}
                    style={{ width: 400 }}
                />
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
                    description="No workspaces found"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                >
                    <Button type="primary" onClick={() => setIsCreateModalOpen(true)}>
                        Create Your First Workspace
                    </Button>
                </Empty>
            ) : viewMode === 'grid' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
                    {data.map((workspace: Workspace) => (
                        <WorkspaceCard key={workspace.id} workspace={workspace} onUpdate={refetch} />
                    ))}
                </div>
            ) : (
                <List
                    dataSource={data}
                    renderItem={(workspace: Workspace) => (
                        <List.Item>
                            <WorkspaceCard workspace={workspace} onUpdate={refetch} listMode />
                        </List.Item>
                    )}
                />
            )}

            <CreateWorkspaceModal
                open={isCreateModalOpen}
                onCancel={() => setIsCreateModalOpen(false)}
                onSuccess={handleCreateSuccess}
            />
        </div>
    );
};

export default WorkspaceList;
