import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Empty, Select } from 'antd';
import ReactECharts from 'echarts-for-react';
import axios from '../../services/axios';

const { Option } = Select;

interface VelocityChartProps {
    projectId: string;
}

const VelocityChart: React.FC<VelocityChartProps> = ({ projectId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [sprintCount, setSprintCount] = useState(6);

    useEffect(() => {
        fetchVelocityData();
    }, [projectId, sprintCount]);

    const fetchVelocityData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/velocity`, {
                params: { sprintCount },
            });
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load velocity chart');
            console.error('Error fetching velocity:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card title="Velocity Chart">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin />
                </div>
            </Card>
        );
    }

    if (!data || !data.data || data.data.length === 0) {
        return (
            <Card title="Velocity Chart">
                <Empty description="No velocity data available" />
            </Card>
        );
    }

    const sprintNames = data.data.map((d: any) => d.sprintName);
    const velocities = data.data.map((d: any) => d.velocity);
    const avgVelocity = data.averageVelocity;

    const option = {
        title: {
            text: 'Team Velocity',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
            formatter: (params: any) => {
                const param = params[0];
                return `${param.axisValue}<br/>${param.marker} Velocity: ${param.value} SP`;
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: sprintNames,
            name: 'Sprint',
            axisLabel: {
                rotate: 45,
            },
        },
        yAxis: {
            type: 'value',
            name: 'Story Points',
            min: 0,
        },
        series: [
            {
                name: 'Velocity',
                type: 'bar',
                data: velocities,
                itemStyle: {
                    color: '#1890ff',
                },
                markLine: {
                    data: [
                        {
                            type: 'average',
                            name: 'Average',
                            label: {
                                formatter: `Avg: ${avgVelocity.toFixed(1)} SP`,
                            },
                        },
                    ],
                    lineStyle: {
                        color: '#52c41a',
                        type: 'dashed',
                        width: 2,
                    },
                },
            },
        ],
    };

    return (
        <Card
            title="Velocity Chart"
            extra={
                <Select value={sprintCount} onChange={setSprintCount} style={{ width: 120 }}>
                    <Option value={3}>Last 3 sprints</Option>
                    <Option value={6}>Last 6 sprints</Option>
                    <Option value={12}>Last 12 sprints</Option>
                </Select>
            }
        >
            <ReactECharts option={option} style={{ height: '400px' }} />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    Average Velocity: {avgVelocity.toFixed(1)} SP
                </span>
            </div>
        </Card>
    );
};

export default VelocityChart;
