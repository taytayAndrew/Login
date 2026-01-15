import React, { useState, useEffect } from 'react';
import { Card, Timeline, Tag, Progress, Button, Modal, Form, Input, DatePicker, message, Space } from 'antd';
import { PlusOutlined, CheckCircleOutlined, ClockCircleOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface Milestone {
    id: number;
    name: string;
    description: string;
    startDate: string;
    dueDate: string;
    color: string;
    isCompleted: boolean;
    completedDate: string | null;
    progress: number;
    tasks: any[];
}

interface RoadmapViewProps {
    projectId: number;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ projectId }) => {
    const [milestones, setMilestones] = useState<Milestone[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadMilestones();
    }, [projectId]);

    const loadMilestones = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/milestones/project/${projectId}`);
            setMilestones(response.data);
        } catch (error) {
            message.error('加载里程碑失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateMilestone = async (values: any) => {
        try {
            await axios.post('/api/v1/milestones', null, {
                params: {
                    projectId,
                    name: values.name,
                    description: values.description,
                    startDate: values.dateRange[0].format('YYYY-MM-DD'),
                    dueDate: values.dateRange[1].format('YYYY-MM-DD'),
                    color: values.color || '#1890ff'
                }
            });
            message.success('里程碑创建成功');
            setIsModalVisible(false);
            form.resetFields();
            loadMilestones();
        } catch (error: any) {
            message.error(error.response?.data?.message || '创建失败');
        }
    };

    const handleCompleteMilestone = async (milestoneId: number) => {
        try {
            await axios.post(`/api/v1/milestones/${milestoneId}/complete`);
            message.success('里程碑已完成');
            loadMilestones();
        } catch (error: any) {
            message.error(error.response?.data?.message || '操作失败');
        }
    };

    const getMilestoneStatus = (milestone: Milestone) => {
        if (milestone.isCompleted) {
            return { icon: <CheckCircleOutlined />, color: 'green', text: '已完成' };
        }
        const now = dayjs();
        const dueDate = dayjs(milestone.dueDate);
        if (now.isAfter(dueDate)) {
            return { icon: <WarningOutlined />, color: 'red', text: '已逾期' };
        }
        return { icon: <ClockCircleOutlined />, color: 'blue', text: '进行中' };
    };

    const renderMilestoneItem = (milestone: Milestone) => {
        const status = getMilestoneStatus(milestone);
        const startDate = dayjs(milestone.startDate);
        const dueDate = dayjs(milestone.dueDate);
        const duration = dueDate.diff(startDate, 'day');

        return (
            <div style={{ marginBottom: 24 }}>
                <Card
                    size="small"
                    style={{ borderLeft: `4px solid ${milestone.color}` }}
                    extra={
                        !milestone.isCompleted && (
                            <Button
                                type="link"
                                size="small"
                                onClick={() => handleCompleteMilestone(milestone.id)}
                            >
                                标记完成
                            </Button>
                        )
                    }
                >
                    <Space direction="vertical" style={{ width: '100%' }} size="small">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0 }}>{milestone.name}</h3>
                            <Tag color={status.color} icon={status.icon}>
                                {status.text}
                            </Tag>
                        </div>

                        {milestone.description && (
                            <p style={{ color: '#666', margin: '8px 0' }}>{milestone.description}</p>
                        )}

                        <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#999' }}>
                            <span>开始: {startDate.format('YYYY-MM-DD')}</span>
                            <span>截止: {dueDate.format('YYYY-MM-DD')}</span>
                            <span>持续: {duration}天</span>
                            <span>任务: {milestone.tasks?.length || 0}个</span>
                        </div>

                        <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                <span style={{ fontSize: 12 }}>进度</span>
                                <span style={{ fontSize: 12 }}>{Math.round(milestone.progress)}%</span>
                            </div>
                            <Progress
                                percent={milestone.progress}
                                status={milestone.isCompleted ? 'success' : 'active'}
                                strokeColor={milestone.color}
                            />
                        </div>
                    </Space>
                </Card>
            </div>
        );
    };

    return (
        <div>
            <Card
                title="项目路线图"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        添加里程碑
                    </Button>
                }
            >
                {milestones.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                        暂无里程碑，点击上方按钮创建第一个里程碑
                    </div>
                ) : (
                    <Timeline mode="left">
                        {milestones.map((milestone) => (
                            <Timeline.Item
                                key={milestone.id}
                                color={milestone.isCompleted ? 'green' : milestone.color}
                                label={dayjs(milestone.startDate).format('YYYY-MM-DD')}
                            >
                                {renderMilestoneItem(milestone)}
                            </Timeline.Item>
                        ))}
                    </Timeline>
                )}
            </Card>

            <Modal
                title="创建里程碑"
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                okText="创建"
                cancelText="取消"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateMilestone}>
                    <Form.Item
                        name="name"
                        label="里程碑名称"
                        rules={[{ required: true, message: '请输入里程碑名称' }]}
                    >
                        <Input placeholder="例如：MVP发布" />
                    </Form.Item>

                    <Form.Item name="description" label="描述">
                        <TextArea rows={3} placeholder="里程碑描述..." />
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="时间范围"
                        rules={[{ required: true, message: '请选择时间范围' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item name="color" label="颜色标识">
                        <Input type="color" defaultValue="#1890ff" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default RoadmapView;
