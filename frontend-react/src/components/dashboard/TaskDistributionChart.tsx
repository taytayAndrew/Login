import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Empty, Radio } from 'antd';
import ReactECharts from 'echarts-for-react';
import axios from '../../services/axios';

interface TaskDistributionChartProps {
    projectId: string;
}

const TaskDistributionChart: React.FC<TaskDistributionChartProps> = ({ projectId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [distributionBy, setDistributionBy] = useState('status');

    useEffect(() => {
        fetchDistributionData();
    }, [projectId, distributionBy]);

    const fetchDistributionData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/task-distribution`, {
                params: { by: distributionBy },
            });
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load task distribution');
            console.error('Error fetching distribution:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card title="Task Distribution">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin />
                </div>
            </Card>
        );
    }

    if (!data || Object.keys(data).length === 0) {
        return (
            <Card title="Task Distribution">
                <Empty description="No distribution data available" />
            </Card>
        );
    }

    const chartData = Object.entries(data).map(([name, value]) => ({
        name,
        value,
    }));

    const colorMap: Record<string, string> = {
        TODO: '#faad14',
        IN_PROGRESS: '#1890ff',
        DONE: '#52c41a',
        BLOCKED: '#ff4d4f',
        CRITICAL: '#ff4d4f',
        HIGH: '#ff7a45',
        MEDIUM: '#1890ff',
        LOW: '#52c41a',
    };

    const option = {
        title: {
            text: `Task Distribution by ${distributionBy.charAt(0).toUpperCase() + distributionBy.slice(1)}`,
            left: 'center',
        },
        tooltip: {
            trigger: 'item',
            formatter: '{b}: {c} ({d}%)',
        },
        legend: {
            orient: 'vertical',
            left: 'left',
            bottom: 20,
        },
        series: [
            {
                name: 'Tasks',
                type: 'pie',
                radius: ['40%', '70%'],
                avoidLabelOverlap: false,
                itemStyle: {
                    borderRadius: 10,
                    borderColor: '#fff',
                    borderWidth: 2,
                },
                label: {
                    show: true,
                    formatter: '{b}: {c}',
                },
                emphasis: {
                    label: {
                        show: true,
                        fontSize: 16,
                        fontWeight: 'bold',
                    },
                },
                data: chartData.map((item) => ({
                    ...item,
                    itemStyle: {
                        color: colorMap[item.name] || '#1890ff',
                    },
                })),
            },
        ],
    };

    return (
        <Card
            title="Task Distribution"
            extra={
                <Radio.Group value={distributionBy} onChange={(e) => setDistributionBy(e.target.value)}>
                    <Radio.Button value="status">Status</Radio.Button>
                    <Radio.Button value="priority">Priority</Radio.Button>
                    <Radio.Button value="assignee">Assignee</Radio.Button>
                </Radio.Group>
            }
        >
            <ReactECharts option={option} style={{ height: '400px' }} />
        </Card>
    );
};

export default TaskDistributionChart;
