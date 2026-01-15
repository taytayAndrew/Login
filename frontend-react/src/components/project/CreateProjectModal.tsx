import React, { useState, useEffect } from 'react';
import { Modal, Form, Input, Select, message, Space, Button } from 'antd';
import { SyncOutlined } from '@ant-design/icons';
import { useMutation, useQuery } from '@tanstack/react-query';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface CreateProjectModalProps {
    open: boolean;
    workspaceId?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

interface ProjectFormValues {
    workspaceId: string;
    name: string;
    key: string;
    description?: string;
    methodology: 'SCRUM' | 'KANBAN' | 'TRADITIONAL';
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
    open,
    workspaceId,
    onCancel,
    onSuccess
}) => {
    const [form] = Form.useForm();
    const [generatingKey, setGeneratingKey] = useState(false);

    const { data: workspaces } = useQuery({
        queryKey: ['workspaces'],
        queryFn: async () => {
            const response = await axios.get('/api/v1/workspaces/my');
            return response.data;
        },
        enabled: !workspaceId,
    });

    useEffect(() => {
        if (workspaceId) {
            form.setFieldValue('workspaceId', workspaceId);
        }
    }, [workspaceId, form]);

    const createMutation = useMutation({
        mutationFn: async (values: ProjectFormValues) => {
            const response = await axios.post('/api/v1/projects', values);
            return response.data;
        },
        onSuccess: () => {
            form.resetFields();
            message.success('Project created successfully');
            onSuccess();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to create project';
            message.error(errorMessage);
        },
    });

    const generateProjectKey = async () => {
        const projectName = form.getFieldValue('name');
        if (!projectName) {
            message.warning('Please enter project name first');
            return;
        }

        try {
            setGeneratingKey(true);
            const response = await axios.post('/api/v1/projects/generate-key', { name: projectName });
            form.setFieldValue('key', response.data.key);
        } catch (error) {
            message.error('Failed to generate project key');
        } finally {
            setGeneratingKey(false);
        }
    };

    const handleOk = () => {
        form.validateFields().then((values) => {
            createMutation.mutate(values);
        });
    };

    const handleCancel = () => {
        form.resetFields();
        onCancel();
    };

    return (
        <Modal
            title="Create New Project"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={createMutation.isPending}
            okText="Create"
            cancelText="Cancel"
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                name="createProject"
                initialValues={{ methodology: 'SCRUM' }}
            >
                {!workspaceId && (
                    <Form.Item
                        name="workspaceId"
                        label="Workspace"
                        rules={[{ required: true, message: 'Please select a workspace' }]}
                    >
                        <Select placeholder="Select workspace">
                            {workspaces?.map((ws: any) => (
                                <Option key={ws.id} value={ws.id}>
                                    {ws.name}
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                )}

                <Form.Item
                    name="name"
                    label="Project Name"
                    rules={[
                        { required: true, message: 'Please enter project name' },
                        { min: 2, max: 100, message: 'Name must be between 2 and 100 characters' },
                    ]}
                >
                    <Input placeholder="Enter project name" />
                </Form.Item>

                <Form.Item
                    name="key"
                    label="Project Key"
                    rules={[
                        { required: true, message: 'Please enter project key' },
                        { pattern: /^[A-Z]{2,10}$/, message: 'Key must be 2-10 uppercase letters' },
                    ]}
                    extra="2-10 uppercase letters (e.g., PROJ, DEV)"
                >
                    <Space.Compact style={{ width: '100%' }}>
                        <Input placeholder="Enter project key" style={{ textTransform: 'uppercase' }} />
                        <Button
                            icon={<SyncOutlined />}
                            onClick={generateProjectKey}
                            loading={generatingKey}
                        >
                            Generate
                        </Button>
                    </Space.Compact>
                </Form.Item>

                <Form.Item
                    name="methodology"
                    label="Methodology"
                    rules={[{ required: true, message: 'Please select a methodology' }]}
                >
                    <Select>
                        <Option value="SCRUM">Scrum</Option>
                        <Option value="KANBAN">Kanban</Option>
                        <Option value="TRADITIONAL">Traditional</Option>
                    </Select>
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
                        placeholder="Enter project description (optional)"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateProjectModal;
