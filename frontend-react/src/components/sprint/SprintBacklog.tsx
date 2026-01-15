import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, message, Modal } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '@/services/axios';

interface Task {
    id: string;
    identifier: string;
    title: string;
    status: string;
    priority: string;
    storyPoints: number;
    assignee?: {
        id: string;
        username: string;
    };
}

interface SprintBacklogProps {
    sprintId: string;
    projectId: string;
    onUpdate: () => void;
}

const SprintBacklog: React.FC<SprintBacklogProps> = ({ sprintId, projectId, onUpdate }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);

    useEffect(() => {
        loadSprintTasks();
    }, [sprintId]);

    const loadSprintTasks = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/sprints/${sprintId}/with-tasks`);
            setTasks(response.data.tasks || []);
        } catch (error) {
            message.error('Failed to load sprint tasks');
        } finally {
            setLoading(false);
        }
    };

    const loadAvailableTasks = async () => {
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/tasks`);
            // Filter out tasks already in sprint
            const available = response.data.filter(
                (task: Task) => !tasks.find(t => t.id === task.id)
            );
            setAvailableTasks(available);
        } catch (error) {
            message.error('Failed to load available tasks');
        }
    };

    const handleAddTasks = async () => {
        try {
            for (const taskId of selectedTaskIds) {
                await axios.post(`/api/v1/sprints/${sprintId}/tasks`, { taskId });
            }
            message.success('Tasks added to sprint');
            setShowAddModal(false);
            setSelectedTaskIds([]);
            loadSprintTasks();
            onUpdate();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to add tasks');
        }
    };

    const handleRemoveTask = async (taskId: string) => {
        try {
            await axios.delete(`/api/v1/sprints/${sprintId}/tasks/${taskId}`);
            message.success('Task removed from sprint');
            loadSprintTasks();
            onUpdate();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to remove task');
        }
    };

    const columns = [
        {
            title: 'ID',
            dataIndex: 'identifier',
            key: 'identifier',
            width: 120,
        },
        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 120,
            render: (status: string) => <Tag>{status}</Tag>,
        },
        {
            title: 'Priority',
            dataIndex: 'priority',
            key: 'priority',
            width: 100,
            render: (priority: string) => <Tag color="orange">{priority}</Tag>,
        },
        {
            title: 'Story Points',
            dataIndex: 'storyPoints',
            key: 'storyPoints',
            width: 120,
        },
        {
            title: 'Assignee',
            dataIndex: 'assignee',
            key: 'assignee',
            width: 150,
            render: (assignee: any) => assignee?.username || 'Unassigned',
        },
        {
            title: 'Actions',
            key: 'actions',
            width: 100,
            render: (_: any, record: Task) => (
                <Button
                    type="text"
                    danger
                    size="small"
                    icon={<DeleteOutlined />}
                    onClick={() => handleRemoveTask(record.id)}
                >
                    Remove
                </Button>
            ),
        },
    ];

    return (
        <div>
            <div style={{ marginBottom: 16 }}>
                <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => {
                        loadAvailableTasks();
                        setShowAddModal(true);
                    }}
                >
                    Add Tasks
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                loading={loading}
                pagination={false}
            />

            <Modal
                title="Add Tasks to Sprint"
                open={showAddModal}
                onCancel={() => {
                    setShowAddModal(false);
                    setSelectedTaskIds([]);
                }}
                onOk={handleAddTasks}
                width={800}
            >
                <Table
                    columns={columns.filter(col => col.key !== 'actions')}
                    dataSource={availableTasks}
                    rowKey="id"
                    rowSelection={{
                        selectedRowKeys: selectedTaskIds,
                        onChange: (keys) => setSelectedTaskIds(keys as string[]),
                    }}
                    pagination={{ pageSize: 10 }}
                />
            </Modal>
        </div>
    );
};

export default SprintBacklog;
