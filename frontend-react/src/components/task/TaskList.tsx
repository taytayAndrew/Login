import React, { useState } from 'react';
import { Table, Button, Input, Space, Tag, Select, Dropdown, message } from 'antd';
import { PlusOutlined, SearchOutlined, FilterOutlined, MoreOutlined } from '@ant-design/icons';
import { useQuery } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import CreateTaskModal from './CreateTaskModal';
import TaskDetailDrawer from './TaskDetailDrawer';
import type { MenuProps } from 'antd';

const { Search } = Input;
const { Option } = Select;

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

const TaskList: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string | undefined>();
    const [priorityFilter, setPriorityFilter] = useState<string | undefined>();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    const { data, isLoading, refetch } = useQuery({
        queryKey: ['tasks', projectId, searchQuery, statusFilter, priorityFilter],
        queryFn: async () => {
            let url = `/api/v1/tasks/project/${projectId}`;
            if (searchQuery) {
                url = `/api/v1/tasks/project/${projectId}/search?query=${searchQuery}`;
            } else if (statusFilter) {
                url = `/api/v1/tasks/project/${projectId}/status/${statusFilter}`;
            } else if (priorityFilter) {
                url = `/api/v1/tasks/project/${projectId}/priority/${priorityFilter}`;
            }
            const response = await axios.get(url);
            return response.data.content || response.data;
        },
    });

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

    const columns = [
        { title: 'ID', dataIndex: 'identifier', key: 'identifier', width: 120 },
        { title: 'Title', dataIndex: 'title', key: 'title' },
        {
            title: 'Type', dataIndex: 'type', key: 'type', width: 100,
            render: (type: string) => <Tag>{type}</Tag>
        },
        {
            title: 'Status', dataIndex: 'status', key: 'status', width: 120,
            render: (status: string) => <Tag color={getStatusColor(status)}>{status}</Tag>
        },
        {
            title: 'Priority', dataIndex: 'priority', key: 'priority', width: 120,
            render: (priority: string) => <Tag color={getPriorityColor(priority)}>{priority}</Tag>
        },
        {
            title: 'Assignee', dataIndex: ['assignee', 'name'], key: 'assignee', width: 150,
            render: (name: string) => name || 'Unassigned'
        },
        {
            title: 'Due Date', dataIndex: 'dueDate', key: 'dueDate', width: 120,
            render: (date: string) => date ? new Date(date).toLocaleDateString() : '-'
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Space style={{ marginBottom: 16, width: '100%', justifyContent: 'space-between' }}>
                <Space>
                    <Search placeholder="Search tasks..." onSearch={setSearchQuery} style={{ width: 300 }} />
                    <Select placeholder="Status" allowClear style={{ width: 150 }} onChange={setStatusFilter}>
                        {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'].map(s =>
                            <Option key={s} value={s}>{s}</Option>)}
                    </Select>
                    <Select placeholder="Priority" allowClear style={{ width: 150 }} onChange={setPriorityFilter}>
                        {['LOW', 'MEDIUM', 'HIGH', 'HIGHEST', 'CRITICAL'].map(p =>
                            <Option key={p} value={p}>{p}</Option>)}
                    </Select>
                </Space>
                <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsCreateModalOpen(true)}>
                    Create Task
                </Button>
            </Space>

            <Table
                columns={columns}
                dataSource={data}
                loading={isLoading}
                rowKey="id"
                onRow={(record) => ({ onClick: () => setSelectedTask(record), style: { cursor: 'pointer' } })}
            />

            <CreateTaskModal
                open={isCreateModalOpen}
                projectId={projectId}
                onCancel={() => setIsCreateModalOpen(false)}
                onSuccess={() => { refetch(); setIsCreateModalOpen(false); }}
            />

            {selectedTask && (
                <TaskDetailDrawer
                    task={selectedTask}
                    open={!!selectedTask}
                    onClose={() => setSelectedTask(null)}
                    onUpdate={refetch}
                />
            )}
        </div>
    );
};

export default TaskList;
