import React, { useState, useEffect } from 'react';
import { Card, Select, Button, message, Tag, Space, Modal, Form } from 'antd';
import { PlusOutlined, DeleteOutlined, WarningOutlined } from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';

interface Task {
    id: string;
    identifier: string;
    title: string;
}

interface Dependency {
    id: number;
    predecessor: Task;
    successor: Task;
    type: string;
    lagDays: number;
}

interface DependencyGraphProps {
    projectId: number;
}

const DependencyGraph: React.FC<DependencyGraphProps> = ({ projectId }) => {
    const [dependencies, setDependencies] = useState<Dependency[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [criticalPath, setCriticalPath] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        loadData();
    }, [projectId]);

    const loadData = async () => {
        setLoading(true);
        try {
            // 加载依赖关系
            const depsResponse = await axios.get(`/api/v1/dependencies/project/${projectId}`);
            setDependencies(depsResponse.data);

            // 加载任务列表
            const tasksResponse = await axios.get(`/api/v1/projects/${projectId}/tasks`);
            setTasks(tasksResponse.data.content || tasksResponse.data);

            // 加载关键路径
            const criticalResponse = await axios.get(`/api/v1/dependencies/project/${projectId}/critical-path`);
            setCriticalPath(criticalResponse.data.map((task: Task) => task.id));
        } catch (error) {
            message.error('加载依赖关系失败');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDependency = async (values: any) => {
        try {
            // 检查循环依赖
            const checkResponse = await axios.get('/api/v1/dependencies/check-cycle', {
                params: {
                    predecessorId: values.predecessorId,
                    successorId: values.successorId
                }
            });

            if (checkResponse.data) {
                message.error('创建此依赖会形成循环依赖！');
                return;
            }

            await axios.post('/api/v1/dependencies', null, {
                params: {
                    predecessorId: values.predecessorId,
                    successorId: values.successorId,
                    type: values.type || 'FINISH_TO_START',
                    lagDays: values.lagDays || 0
                }
            });

            message.success('依赖关系创建成功');
            setIsModalVisible(false);
            form.resetFields();
            loadData();
        } catch (error: any) {
            message.error(error.response?.data?.message || '创建失败');
        }
    };

    const handleDeleteDependency = async (dependencyId: number) => {
        try {
            await axios.delete(`/api/v1/dependencies/${dependencyId}`);
            message.success('依赖关系已删除');
            loadData();
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败');
        }
    };

    const getGraphOption = () => {
        // 构建节点
        const nodes = tasks.map(task => ({
            id: task.id,
            name: task.identifier,
            symbolSize: criticalPath.includes(task.id) ? 60 : 40,
            itemStyle: {
                color: criticalPath.includes(task.id) ? '#ff4d4f' : '#1890ff'
            },
            label: {
                show: true,
                formatter: task.identifier
            }
        }));

        // 构建边
        const links = dependencies.map(dep => ({
            source: dep.predecessor.id,
            target: dep.successor.id,
            lineStyle: {
                color: criticalPath.includes(dep.predecessor.id) && criticalPath.includes(dep.successor.id)
                    ? '#ff4d4f'
                    : '#999',
                width: criticalPath.includes(dep.predecessor.id) && criticalPath.includes(dep.successor.id)
                    ? 3
                    : 1
            },
            label: {
                show: dep.lagDays !== 0,
                formatter: `${dep.lagDays > 0 ? '+' : ''}${dep.lagDays}天`
            }
        }));

        return {
            title: {
                text: '任务依赖关系图',
                subtext: '红色表示关键路径',
                left: 'center'
            },
            tooltip: {
                formatter: (params: any) => {
                    if (params.dataType === 'node') {
                        const task = tasks.find(t => t.id === params.data.id);
                        return task ? `${task.identifier}<br/>${task.title}` : '';
                    }
                    return '';
                }
            },
            series: [
                {
                    type: 'graph',
                    layout: 'force',
                    data: nodes,
                    links: links,
                    roam: true,
                    label: {
                        show: true,
                        position: 'inside',
                        fontSize: 12
                    },
                    force: {
                        repulsion: 200,
                        edgeLength: 150
                    },
                    emphasis: {
                        focus: 'adjacency',
                        lineStyle: {
                            width: 3
                        }
                    }
                }
            ]
        };
    };

    const dependencyTypeOptions = [
        { label: '完成-开始 (FS)', value: 'FINISH_TO_START' },
        { label: '开始-开始 (SS)', value: 'START_TO_START' },
        { label: '完成-完成 (FF)', value: 'FINISH_TO_FINISH' },
        { label: '开始-完成 (SF)', value: 'START_TO_FINISH' }
    ];

    return (
        <div>
            <Card
                title="依赖关系"
                extra={
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => setIsModalVisible(true)}
                    >
                        添加依赖
                    </Button>
                }
            >
                {dependencies.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 0', color: '#999' }}>
                        暂无依赖关系
                    </div>
                ) : (
                    <>
                        <ReactECharts
                            option={getGraphOption()}
                            style={{ height: 500 }}
                            notMerge={true}
                            lazyUpdate={true}
                        />

                        <div style={{ marginTop: 24 }}>
                            <h4>依赖关系列表</h4>
                            <Space direction="vertical" style={{ width: '100%' }}>
                                {dependencies.map(dep => (
                                    <Card key={dep.id} size="small">
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                            <Space>
                                                <Tag color="blue">{dep.predecessor.identifier}</Tag>
                                                <span>→</span>
                                                <Tag color="green">{dep.successor.identifier}</Tag>
                                                <Tag>{dep.type}</Tag>
                                                {dep.lagDays !== 0 && (
                                                    <Tag color="orange">
                                                        {dep.lagDays > 0 ? `延迟${dep.lagDays}天` : `提前${-dep.lagDays}天`}
                                                    </Tag>
                                                )}
                                                {criticalPath.includes(dep.predecessor.id) && criticalPath.includes(dep.successor.id) && (
                                                    <Tag color="red" icon={<WarningOutlined />}>
                                                        关键路径
                                                    </Tag>
                                                )}
                                            </Space>
                                            <Button
                                                type="link"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() => handleDeleteDependency(dep.id)}
                                            >
                                                删除
                                            </Button>
                                        </div>
                                    </Card>
                                ))}
                            </Space>
                        </div>
                    </>
                )}
            </Card>

            <Modal
                title="添加依赖关系"
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsModalVisible(false);
                    form.resetFields();
                }}
                okText="创建"
                cancelText="取消"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateDependency}>
                    <Form.Item
                        name="predecessorId"
                        label="前置任务"
                        rules={[{ required: true, message: '请选择前置任务' }]}
                    >
                        <Select
                            showSearch
                            placeholder="选择前置任务"
                            optionFilterProp="children"
                        >
                            {tasks.map(task => (
                                <Select.Option key={task.id} value={task.id}>
                                    {task.identifier} - {task.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="successorId"
                        label="后续任务"
                        rules={[{ required: true, message: '请选择后续任务' }]}
                    >
                        <Select
                            showSearch
                            placeholder="选择后续任务"
                            optionFilterProp="children"
                        >
                            {tasks.map(task => (
                                <Select.Option key={task.id} value={task.id}>
                                    {task.identifier} - {task.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item name="type" label="依赖类型" initialValue="FINISH_TO_START">
                        <Select options={dependencyTypeOptions} />
                    </Form.Item>

                    <Form.Item
                        name="lagDays"
                        label="延迟天数"
                        initialValue={0}
                        tooltip="正数表示延迟，负数表示提前"
                    >
                        <Select>
                            <Select.Option value={-5}>提前5天</Select.Option>
                            <Select.Option value={-3}>提前3天</Select.Option>
                            <Select.Option value={-1}>提前1天</Select.Option>
                            <Select.Option value={0}>无延迟</Select.Option>
                            <Select.Option value={1}>延迟1天</Select.Option>
                            <Select.Option value={3}>延迟3天</Select.Option>
                            <Select.Option value={5}>延迟5天</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default DependencyGraph;
