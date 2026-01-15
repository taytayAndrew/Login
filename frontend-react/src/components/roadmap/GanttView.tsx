import React, { useState, useEffect } from 'react';
import { Card, Table, Tag, DatePicker, Space, message } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface Task {
    id: string;
    identifier: string;
    title: string;
    status: string;
    priority: string;
    assignee: {
        username: string;
    } | null;
    startDate: string | null;
    dueDate: string | null;
    estimatedHours: number | null;
    milestone: {
        id: number;
        name: string;
        color: string;
    } | null;
}

interface GanttViewProps {
    projectId: number;
}

const GanttView: React.FC<GanttViewProps> = ({ projectId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().startOf('month'),
        dayjs().endOf('month').add(2, 'month')
    ]);

    useEffect(() => {
        loadTasks();
    }, [projectId]);

    const loadTasks = async () => {
        setLoading(true);
        try {
            // 这里应该调用获取项目任务的API
            const response = await axios.get(`/api/v1/projects/${projectId}/tasks`);
            setTasks(response.data.content || response.data);
        } catch (error) {
            message.error('加载任务失败');
        } finally {
            setLoading(false);
        }
    };

    const calculateBarPosition = (startDate: string | null, dueDate: string | null) => {
        if (!startDate || !dueDate) return null;

        const start = dayjs(startDate);
        const end = dayjs(dueDate);
        const rangeStart = dateRange[0];
        const rangeEnd = dateRange[1];

        // 计算总天数
        const totalDays = rangeEnd.diff(rangeStart, 'day');

        // 计算任务开始位置（百分比）
        const startOffset = start.diff(rangeStart, 'day');
        const startPercent = (startOffset / totalDays) * 100;

        // 计算任务持续时间（百分比）
        const duration = end.diff(start, 'day');
        const durationPercent = (duration / totalDays) * 100;

        return {
            left: `${Math.max(0, startPercent)}%`,
            width: `${Math.min(100 - startPercent, durationPercent)}%`
        };
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            TODO: '#d9d9d9',
            IN_PROGRESS: '#1890ff',
            DONE: '#52c41a',
            BLOCKED: '#ff4d4f'
        };
        return colors[status] || '#d9d9d9';
    };

    const renderGanttBar = (task: Task) => {
        const position = calculateBarPosition(task.startDate, task.dueDate);

        if (!position) {
            return <span style={{ color: '#999', fontSize: 12 }}>未设置日期</span>;
        }

        return (
            <div style={{ position: 'relative', height: 24, width: '100%' }}>
                <div
                    style={{
                        position: 'absolute',
                        left: position.left,
                        width: position.width,
                        height: 20,
                        backgroundColor: task.milestone?.color || getStatusColor(task.status),
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 11,
                        color: '#fff',
                        fontWeight: 500,
                        minWidth: 2
                    }}
                    title={`${task.identifier}: ${dayjs(task.startDate).format('MM/DD')} - ${dayjs(task.dueDate).format('MM/DD')}`}
                >
                    {parseFloat(position.width) > 10 && task.identifier}
                </div>
            </div>
        );
    };

    const columns: ColumnsType<Task> = [
        {
            title: '任务',
            key: 'task',
            width: 300,
            fixed: 'left',
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Tag color="blue">{record.identifier}</Tag>
                    <span style={{ fontSize: 13 }}>{record.title}</span>
                    {record.milestone && (
                        <Tag color={record.milestone.color} style={{ fontSize: 11 }}>
                            {record.milestone.name}
                        </Tag>
                    )}
                </Space>
            ),
        },
        {
            title: '负责人',
            dataIndex: ['assignee', 'username'],
            key: 'assignee',
            width: 100,
            render: (username: string) => username || '-',
        },
        {
            title: '工期',
            key: 'duration',
            width: 80,
            render: (_, record) => {
                if (!record.startDate || !record.dueDate) return '-';
                const days = dayjs(record.dueDate).diff(dayjs(record.startDate), 'day');
                return `${days}天`;
            },
        },
        {
            title: (
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>时间线</span>
                    <RangePicker
                        size="small"
                        value={dateRange}
                        onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
                        format="YYYY-MM-DD"
                    />
                </div>
            ),
            key: 'gantt',
            render: (_, record) => renderGanttBar(record),
        },
    ];

    // 生成时间刻度
    const renderTimeScale = () => {
        const months: string[] = [];
        let current = dateRange[0].clone();

        while (current.isBefore(dateRange[1]) || current.isSame(dateRange[1], 'month')) {
            months.push(current.format('YYYY-MM'));
            current = current.add(1, 'month');
        }

        return (
            <div style={{ display: 'flex', borderBottom: '1px solid #f0f0f0', padding: '8px 0' }}>
                {months.map((month, index) => (
                    <div
                        key={index}
                        style={{
                            flex: 1,
                            textAlign: 'center',
                            fontSize: 12,
                            color: '#666',
                            borderRight: index < months.length - 1 ? '1px solid #f0f0f0' : 'none'
                        }}
                    >
                        {month}
                    </div>
                ))}
            </div>
        );
    };

    return (
        <Card title="甘特图">
            <Table
                columns={columns}
                dataSource={tasks}
                rowKey="id"
                loading={loading}
                pagination={{
                    pageSize: 20,
                    showTotal: (total) => `共 ${total} 个任务`,
                }}
                scroll={{ x: 1200 }}
            />
        </Card>
    );
};

export default GanttView;
