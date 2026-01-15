import React, { useEffect } from 'react';
import { Card, Form, Input, Button, Space, message, Spin } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

const { TextArea } = Input;

interface WorkspaceFormValues {
    name: string;
    description?: string;
}

const WorkspaceSettings: React.FC = () => {
    const { workspaceId } = useParams<{ workspaceId: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { data: workspace, isLoading } = useQuery({
        queryKey: ['workspace', workspaceId],
        queryFn: async () => {
            const response = await axios.get(`/api/v1/workspaces/${workspaceId}`);
            return response.data;
        },
    });

    useEffect(() => {
        if (workspace) {
            form.setFieldsValue({
                name: workspace.name,
                description: workspace.description,
            });
        }
    }, [workspace, form]);

    const updateMutation = useMutation({
        mutationFn: async (values: WorkspaceFormValues) => {
            const response = await axios.put(`/api/v1/workspaces/${workspaceId}`, values);
            return response.data;
        },
        onSuccess: () => {
            message.success('Workspace updated successfully');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update workspace';
            message.error(errorMessage);
        },
    });

    const handleSubmit = (values: WorkspaceFormValues) => {
        updateMutation.mutate(values);
    };

    if (isLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
            <h1>Workspace Settings</h1>

            <Card title="General Information">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item
                        name="name"
                        label="Workspace Name"
                        rules={[
                            { required: true, message: 'Please enter workspace name' },
                            { min: 2, max: 100, message: 'Name must be between 2 and 100 characters' },
                        ]}
                    >
                        <Input placeholder="Enter workspace name" />
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="Description"
                        rules={[
                            { max: 500, message: 'Description cannot exceed 500 characters' },
                        ]}
                    >
                        <TextArea
                            rows={4}
                            placeholder="Enter workspace description"
                        />
                    </Form.Item>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={updateMutation.isPending}
                            >
                                Save Changes
                            </Button>
                            <Button onClick={() => navigate(`/workspaces/${workspaceId}`)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default WorkspaceSettings;
