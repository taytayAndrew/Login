import React, { useState, useEffect } from 'react';
import { Table, Card, DatePicker, Space, Button, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;
const { TextArea } = Input;

interface TimeEntry {
    id: number;
    task: {
        id: string;
        title: string;
        identifier: string;
    };
    user: {
        id: number;
        username: string;
    };
    startTime: string;
    endTime: string;
    hoursSpent: number;
    description: string;
    isRunning: boolean;
}

interface TimesheetViewProps {
    userId: number;
    projectId?: number;
}

const TimesheetView: React.FC<TimesheetViewProps> = ({ userId, projectId }) => {
    const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('week'),
        dayjs().endOf('week')
    ]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
    const [form] = Form.useForm();

    useEffect(() => {
        loadTimeEntries();
    }, [userId, dateRange]);

    const loadTimeEntries = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/time-tracking/entries/user/${userId}`, {
                params: {
                    startDate: dateRange[0].toISOString(),
                    endDate: dateRange[1].toISOString()
                }
            });
            setTimeEntries(response.data);
        } catch (error) {
            message.error('加载工时记录失败');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (entry: TimeEntry) => {
        setEditingEntry(entry);
        form.setFieldsValue({
            hoursSpent: Math.floor(entry.hoursSpent / 60),
            description: entry.description
        });
        setIsModalVisible(true);
    };

    const handleDelete = async (entryId: number) => {
        try {
            await axios.delete(`/api/v1/time-tracking/entries/${entryId}`);
            message.success('工时记录已删除');
            loadTimeEntries();
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingEntry) {
                await axios.put(`/api/v1/time-tracking/entries/${editingEntry.id}`, null, {
                    params: {
                        hoursSpent: values.hoursSpent * 60, // 转换为分钟
                        description: values.description
                    }
                });
                message.success('工时记录已更新');
            }
            setIsModalVisible(false);
            setEditingEntry(null);
            form.resetFields();
            loadTimeEntries();
        } catch (error: any) {
            message.error(error.response?.data?.message || '保存失败');
        }
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingEntry(null);
        form.resetFields();
    };

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}m`;
    };

    const calculateTotalHours = (): string => {
        const totalMinutes = timeEntries.reduce((sum, entry) => sum + entry.hoursSpent, 0);
        return formatDuration(totalMinutes);
    };

    const columns: ColumnsType<TimeEntry> = [
        {
            title: '日期',
            dataIndex: 'startTime',
            key: 'date',
            render: (startTime: string) => dayjs(startTime).format('YYYY-MM-DD'),
            sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
        },
        {
            title: '任务',
            key: 'task',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag color="blue">{record.task.identifier}</Tag>
                    <span>{record.task.title}</span>
                </Space>
            ),
        },
        {
            title: '开始时间',
            dataIndex: 'startTime',
            key: 'startTime',
            render: (time: string) => dayjs(time).format('HH:mm'),
        },
        {
            title: '结束时间',
            dataIndex: 'endTime',
            key: 'endTime',
            render: (time: string) => time ? dayjs(time).format('HH:mm') : '-',
        },
        {
            title: '工时',
            dataIndex: 'hoursSpent',
            key: 'hoursSpent',
            render: (minutes: number) => formatDuration(minutes),
            sorter: (a, b) => a.hoursSpent - b.hoursSpent,
        },
        {
            title: '描述',
            dataIndex: 'description',
            key: 'description',
            ellipsis: true,
        },
        {
            title: '状态',
            dataIndex: 'isRunning',
            key: 'isRunning',
            render: (isRunning: boolean) => (
                <Tag color={isRunning ? 'green' : 'default'}>
                    {isRunning ? '运行中' : '已完成'}
                </Tag>
            ),
        },
        {
            title: '操作',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                        disabled={record.isRunning}
                    >
                        编辑
                    </Button>
                    <Popconfirm
                        title="确定要删除这条工时记录吗？"
                        onConfirm={() => handleDelete(record.id)}
                        okText="确定"
                        cancelText="取消"
                    >
                        <Button
                            type="link"
                            danger
                            icon={<DeleteOutlined />}
                            disabled={record.isRunning}
                        >
                            删除
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Card
            title="工时表"
            extra={
                <Space>
                    <RangePicker
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
                        format="YYYY-MM-DD"
                    />
                    <Button type="primary" icon={<PlusOutlined />}>
                        手动添加
                    </Button>
                </Space>
            }
        >
            <Table
                columns={columns}
                dataSource={timeEntries}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 10,
                    showTotal: (total) => `共 ${total} 条记录`,
                }}
                summary={() => (
                    <Table.Summary fixed>
                        <Table.Summary.Row>
                            <Table.Summary.Cell index={0} colSpan={4}>
                                <strong>总计</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={1}>
                                <strong>{calculateTotalHours()}</strong>
                            </Table.Summary.Cell>
                            <Table.Summary.Cell index={2} colSpan={3} />
                        </Table.Summary.Row>
                    </Table.Summary>
                )}
            />

            <Modal
                title="编辑工时记录"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={handleModalCancel}
                okText="保存"
                cancelText="取消"
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="hoursSpent"
                        label="工时（小时）"
                        rules={[{ required: true, message: '请输入工时' }]}
                    >
                        <Input type="number" min={0} step={0.5} />
                    </Form.Item>
                    <Form.Item name="description" label="描述">
                        <TextArea rows={4} placeholder="工作描述..." />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default TimesheetView;
