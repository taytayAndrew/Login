import React from 'react';
import { Modal, Form, Input, Select, message } from 'antd';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

const { TextArea } = Input;
const { Option } = Select;

interface CreateTaskModalProps {
    open: boolean;
    projectId?: string;
    onCancel: () => void;
    onSuccess: () => void;
}

const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ open, projectId, onCancel, onSuccess }) => {
    const [form] = Form.useForm();

    const createMutation = useMutation({
        mutationFn: async (values: any) => {
            const response = await axios.post('/api/v1/tasks', { ...values, projectId });
            return response.data;
        },
        onSuccess: () => {
            form.resetFields();
            message.success('Task created successfully');
            onSuccess();
        },
        onError: (error: any) => {
            message.error(error.response?.data?.message || 'Failed to create task');
        },
    });

    return (
        <Modal
            title="Create New Task"
            open={open}
            onOk={() => form.validateFields().then(createMutation.mutate)}
            onCancel={() => { form.resetFields(); onCancel(); }}
            confirmLoading={createMutation.isPending}
        >
            <Form form={form} layout="vertical" initialValues={{ type: 'TASK', priority: 'MEDIUM' }}>
                <Form.Item name="title" label="Title" rules={[{ required: true }]}>
                    <Input placeholder="Enter task title" />
                </Form.Item>
                <Form.Item name="description" label="Description">
                    <TextArea rows={4} placeholder="Enter task description" />
                </Form.Item>
                <Form.Item name="type" label="Type" rules={[{ required: true }]}>
                    <Select>
                        {['TASK', 'STORY', 'BUG', 'EPIC'].map(t => <Option key={t} value={t}>{t}</Option>)}
                    </Select>
                </Form.Item>
                <Form.Item name="priority" label="Priority" rules={[{ required: true }]}>
                    <Select>
                        {['LOWEST', 'LOW', 'MEDIUM', 'HIGH', 'HIGHEST', 'CRITICAL'].map(p =>
                            <Option key={p} value={p}>{p}</Option>)}
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateTaskModal;
