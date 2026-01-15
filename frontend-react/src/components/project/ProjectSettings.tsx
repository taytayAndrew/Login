import React, { useEffect } from 'react';
import { Card, Form, Input, Select, Button, Space, message, Spin, DatePicker } from 'antd';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { Option } = Select;

interface ProjectFormValues {
    name: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}

const ProjectSettings: React.FC = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const navigate = useNavigate();
    const [form] = Form.useForm();

    const { data: project, isLoading } = useQuery({
        queryKey: ['project', projectId],
        queryFn: async () => {
            const response = await axios.get(`/api/v1/projects/${projectId}`);
            return response.data;
        },
    });

    useEffect(() => {
        if (project) {
            form.setFieldsValue({
                name: project.name,
                description: project.description,
                startDate: project.startDate ? dayjs(project.startDate) : undefined,
                endDate: project.endDate ? dayjs(project.endDate) : undefined,
            });
        }
    }, [project, form]);

    const updateMutation = useMutation({
        mutationFn: async (values: ProjectFormValues) => {
            const payload = {
                ...values,
                startDate: values.startDate ? dayjs(values.startDate).format('YYYY-MM-DD') : null,
                endDate: values.endDate ? dayjs(values.endDate).format('YYYY-MM-DD') : null,
            };
            const response = await axios.put(`/api/v1/projects/${projectId}`, payload);
            return response.data;
        },
        onSuccess: () => {
            message.success('Project updated successfully');
        },
        onError: (error: any) => {
            const errorMessage = error.response?.data?.message || 'Failed to update project';
            message.error(errorMessage);
        },
    });

    const handleSubmit = (values: ProjectFormValues) => {
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
            <h1>Project Settings</h1>

            <Card title="General Information">
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleSubmit}
                >
                    <Form.Item label="Project Key">
                        <Input value={project?.key} disabled />
                    </Form.Item>

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

                    <Form.Item label="Methodology">
                        <Input value={project?.methodology} disabled />
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
                            placeholder="Enter project description"
                        />
                    </Form.Item>

                    <Space size="large" style={{ width: '100%' }}>
                        <Form.Item
                            name="startDate"
                            label="Start Date"
                            style={{ flex: 1 }}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>

                        <Form.Item
                            name="endDate"
                            label="End Date"
                            style={{ flex: 1 }}
                        >
                            <DatePicker style={{ width: '100%' }} />
                        </Form.Item>
                    </Space>

                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={updateMutation.isPending}
                            >
                                Save Changes
                            </Button>
                            <Button onClick={() => navigate(`/projects/${projectId}`)}>
                                Cancel
                            </Button>
                        </Space>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ProjectSettings;
