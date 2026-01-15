import React from 'react';
import { Modal, Form, Input, DatePicker, InputNumber, message } from 'antd';
import axios from '@/services/axios';
import dayjs from 'dayjs';

const { TextArea } = Input;
const { RangePicker } = DatePicker;

interface CreateSprintModalProps {
    visible: boolean;
    projectId: string;
    onClose: () => void;
    onSuccess: () => void;
}

const CreateSprintModal: React.FC<CreateSprintModalProps> = ({
    visible,
    projectId,
    onClose,
    onSuccess,
}) => {
    const [form] = Form.useForm();
    const [loading, setLoading] = React.useState(false);

    const handleSubmit = async (values: any) => {
        try {
            setLoading(true);
            const [startDate, endDate] = values.dateRange;

            await axios.post('/api/v1/sprints', {
                projectId,
                name: values.name,
                goal: values.goal,
                startDate: startDate.format('YYYY-MM-DD'),
                endDate: endDate.format('YYYY-MM-DD'),
                capacity: values.capacity,
            });

            message.success('Sprint created successfully');
            form.resetFields();
            onSuccess();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create sprint');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            title="Create Sprint"
            open={visible}
            onCancel={onClose}
            onOk={() => form.submit()}
            confirmLoading={loading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                onFinish={handleSubmit}
                initialValues={{
                    capacity: 40,
                }}
            >
                <Form.Item
                    name="name"
                    label="Sprint Name"
                    rules={[{ required: true, message: 'Please enter sprint name' }]}
                >
                    <Input placeholder="e.g., Sprint 1, Q1 Sprint" />
                </Form.Item>

                <Form.Item
                    name="goal"
                    label="Sprint Goal"
                    rules={[{ required: true, message: 'Please enter sprint goal' }]}
                >
                    <TextArea
                        rows={3}
                        placeholder="What is the main objective of this sprint?"
                    />
                </Form.Item>

                <Form.Item
                    name="dateRange"
                    label="Sprint Duration"
                    rules={[{ required: true, message: 'Please select sprint dates' }]}
                >
                    <RangePicker
                        style={{ width: '100%' }}
                        format="YYYY-MM-DD"
                        disabledDate={(current) => {
                            return current && current < dayjs().startOf('day');
                        }}
                    />
                </Form.Item>

                <Form.Item
                    name="capacity"
                    label="Team Capacity (Story Points)"
                    rules={[{ required: true, message: 'Please enter team capacity' }]}
                >
                    <InputNumber
                        min={1}
                        max={1000}
                        style={{ width: '100%' }}
                        placeholder="Total story points the team can complete"
                    />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateSprintModal;
