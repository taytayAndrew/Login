import React, { useState } from 'react';
import { Drawer, Descriptions, Tag, Button, Space, Tabs, Select, message, DatePicker } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';
import TaskHistoryTimeline from './TaskHistoryTimeline';

interface Task {
    id: string;
    identifier: string;
    title: string;
    description?: string;
    type: string;
    status: string;
    priority: string;
    assignee?: { id: number; name: string };
    reporter: { id: number; name: string };
    dueDate?: string;
    startDate?: string;
}

interface TaskDetailDrawerProps {
    task: Task;
    open: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({ task, open, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('details');

    const { data: history } = useQuery({
        queryKey: ['taskHistory', task.id],
        queryFn: async () => {
            const response = await axios.get(`/api/v1/tasks/${task.id}/history`);
            return response.data;
        },
        enabled: activeTab === 'history',
    });

    const updateStatusMutation = useMutation({
        mutationFn: async (status: string) => {
            await axios.put(`/api/v1/tasks/${task.id}/status`, { status });
        },
        onSuccess: () => { message.success('Status updated'); onUpdate(); },
    });

    const updatePriorityMutation = useMutation({
        mutationFn: async (priority: string) => {
            await axios.put(`/api/v1/tasks/${task.id}/priority`, { priority });
        },
        onSuccess: () => { message.success('Priority updated'); onUpdate(); },
    });

    const items = [
        {
            key: 'details',
            label: 'Details',
            children: (
                <Descriptions column={1} bordered>
                    <Descriptions.Item label="ID">{task.identifier}</Descriptions.Item>
                    <Descriptions.Item label="Title">{task.title}</Descriptions.Item>
                    <Descriptions.Item label="Description">{task.description || 'No description'}</Descriptions.Item>
                    <Descriptions.Item label="Type"><Tag>{task.type}</Tag></Descriptions.Item>
                    <Descriptions.Item label="Status">
                        <Select value={task.status} style={{ width: 150 }}
                            onChange={(v) => updateStatusMutation.mutate(v)}>
                            {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE', 'BLOCKED'].map(s =>
                                <Select.Option key={s} value={s}>{s}</Select.Option>)}
                        </Select>
                    </Descriptions.Item>
                    <Descriptions.Item label="Priority">
                        <Select value={task.priority} style={{ width: 150 }}
                            onChange={(v) => updatePriorityMutation.mutate(v)}>
                            {['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST', 'CRITICAL'].map(p =>
                                <Select.Option key={p} value={p}>{p}</Select.Option>)}
                        </Select>
                    </Descriptions.Item>
                    <Descriptions.Item label="Assignee">{task.assignee?.name || 'Unassigned'}</Descriptions.Item>
                    <Descriptions.Item label="Reporter">{task.reporter.name}</Descriptions.Item>
                    <Descriptions.Item label="Start Date">
                        {task.startDate ? dayjs(task.startDate).format('YYYY-MM-DD') : 'Not set'}
                    </Descriptions.Item>
                    <Descriptions.Item label="Due Date">
                        {task.dueDate ? dayjs(task.dueDate).format('YYYY-MM-DD') : 'Not set'}
                    </Descriptions.Item>
                </Descriptions>
            ),
        },
        {
            key: 'history',
            label: 'History',
            children: <TaskHistoryTimeline history={history || []} />,
        },
    ];

    return (
        <Drawer
            title={task.identifier}
            placement="right"
            width={720}
            onClose={onClose}
            open={open}
        >
            <Tabs activeKey={activeTab} onChange={setActiveTab} items={items} />
        </Drawer>
    );
};

export default TaskDetailDrawer;
