import React, { useState } from 'react';
import { Card, Table, Button, Space, Tag, Modal, Form, Select, Input, message, Popconfirm } from 'antd';
import { PlusOutlined, DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

const { Option } = Select;

interface ProjectMember {
    id: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    role: 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';
    joinedAt: string;
}

const ProjectMemberManagement: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const queryClient = useQueryClient();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingMember, setEditingMember] = useState<ProjectMember | null>(null);
    const [form] = Form.useForm();

    const { data: members, isLoading } = useQuery({
        queryKey: ['projectMembers', projectId],
        queryFn: async () => {
            const response = await axios.get(`/api/v1/projects/${projectId}/members`);
            return response.data;
        },
    });

    const addMemberMutation = useMutation({
        mutationFn: async (values: { userId: number; role: string }) => {
            const response = await axios.post(`/api/v1/projects/${projectId}/members`, values);
            return response.data;
        },
        onSuccess: () => {
            message.success('Member added successfully');
            queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
            setIsAddModalOpen(false);
            form.resetFields();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to add member');
        },
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: number; role: string }) => {
            const response = await axios.put(`/api/v1/projects/${projectId}/members/${userId}`, { role });
            return response.data;
        },
        onSuccess: () => {
            message.success('Member role updated successfully');
            queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
            setEditingMember(null);
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to update member role');
        },
    });

    const removeMemberMutation = useMutation({
        mutationFn: async (userId: number) => {
            await axios.delete(`/api/v1/projects/${projectId}/members/${userId}`);
        },
        onSuccess: () => {
            message.success('Member removed successfully');
            queryClient.invalidateQueries({ queryKey: ['projectMembers', projectId] });
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to remove member');
        },
    });

    const handleAddMember = () => {
        form.validateFields().then((values) => {
            addMemberMutation.mutate(values);
        });
    };

    const handleUpdateRole = (member: ProjectMember, newRole: string) => {
        updateRoleMutation.mutate({ userId: member.user.id, role: newRole });
    };

    const getRoleColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return 'red';
            case 'MANAGER': return 'orange';
            case 'MEMBER': return 'blue';
            case 'VIEWER': return 'default';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: ['user', 'name'],
            key: 'name',
        },
        {
            title: 'Email',
            dataIndex: ['user', 'email'],
            key: 'email',
        },
        {
            title: 'Role',
            dataIndex: 'role',
            key: 'role',
            render: (role: string) => <Tag color={getRoleColor(role)}>{role}</Tag>,
        },
        {
            title: 'Joined',
            dataIndex: 'joinedAt',
            key: 'joinedAt',
            render: (date: string) => new Date(date).toLocaleDateString(),
        },
        {
            title: 'Actions',
            key: 'actions',
            render: (_: any, record: ProjectMember) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => setEditingMember(record)}
                    >
                        Change Role
                    </Button>
                    <Popconfirm
                        title="Remove member"
                        description="Are you sure you want to remove this member?"
                        onConfirm={() => removeMemberMutation.mutate(record.user.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                        >
                            Remove
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title="Project Members"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsAddModalOpen(true)}
                    >
                        Add Member
                    </Button>
                }
            >
                <Table
                    columns={columns}
                    dataSource={members}
                    loading={isLoading}
                    rowKey="id"
                />
            </Card>

            <Modal
                title="Add Member"
                open={isAddModalOpen}
                onOk={handleAddMember}
                onCancel={() => {
                    setIsAddModalOpen(false);
                    form.resetFields();
                }}
                confirmLoading={addMemberMutation.isPending}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="userId"
                        label="User ID"
                        rules={[{ required: true, message: 'Please enter user ID' }]}
                    >
                        <Input type="number" placeholder="Enter user ID" />
                    </Form.Item>
                    <Form.Item
                        name="role"
                        label="Role"
                        rules={[{ required: true, message: 'Please select a role' }]}
                    >
                        <Select placeholder="Select role">
                            <Option value="ADMIN">Admin</Option>
                            <Option value="MANAGER">Manager</Option>
                            <Option value="MEMBER">Member</Option>
                            <Option value="VIEWER">Viewer</Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="Change Member Role"
                open={!!editingMember}
                onOk={() => {
                    if (editingMember) {
                        const newRole = form.getFieldValue('newRole');
                        handleUpdateRole(editingMember, newRole);
                    }
                }}
                onCancel={() => setEditingMember(null)}
                confirmLoading={updateRoleMutation.isPending}
            >
                {editingMember && (
                    <Form form={form} layout="vertical">
                        <p>Change role for: <strong>{editingMember.user.name}</strong></p>
                        <Form.Item
                            name="newRole"
                            label="New Role"
                            initialValue={editingMember.role}
                            rules={[{ required: true, message: 'Please select a role' }]}
                        >
                            <Select>
                                <Option value="ADMIN">Admin</Option>
                                <Option value="MANAGER">Manager</Option>
                                <Option value="MEMBER">Member</Option>
                                <Option value="VIEWER">Viewer</Option>
                            </Select>
                        </Form.Item>
                    </Form>
                )}
            </Modal>
        </div>
    );
};

export default ProjectMemberManagement;
