import React from 'react';
import { Modal, Form, Input, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const { TextArea } = Input;

interface CreateWorkspaceModalProps {
    open: boolean;
    onCancel: () => void;
    onSuccess: () => void;
}

interface WorkspaceFormValues {
    name: string;
    description?: string;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ open, onCancel, onSuccess }) => {
    const [form] = Form.useForm();

    const createMutation = useMutation({
        mutationFn: async (values: WorkspaceFormValues) => {
            const response = await axios.post('/api/v1/workspaces', values);
            return response.data;
        },
        onSuccess: () => {
            form.resetFields();
            onSuccess();
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to create workspace';
            message.error(errorMessage);
        },
    });

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
            title="Create New Workspace"
            open={open}
            onOk={handleOk}
            onCancel={handleCancel}
            confirmLoading={createMutation.isPending}
            okText="Create"
            cancelText="Cancel"
        >
            <Form
                form={form}
                layout="vertical"
                name="createWorkspace"
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
                        placeholder="Enter workspace description (optional)"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateWorkspaceModal;
