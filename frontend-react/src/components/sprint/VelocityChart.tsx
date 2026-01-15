import React, { useState, useEffect } from 'react';
import { Card, Spin, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import axios from '@/services/axios';

interface VelocityChartProps {
    projectId: string;
}

const VelocityChart: React.FC<VelocityChartProps> = ({ projectId }) => {
    const [sprints, setSprints] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadCompletedSprints();
    }, [projectId]);

    const loadCompletedSprints = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/sprints/project/${projectId}/status/COMPLETED`);
            setSprints(response.data);
        } catch (error) {
            console.error('Failed to load completed sprints:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card>
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin size="large" />
                </div>
            </Card>
        );
    }

    if (sprints.length === 0) {
        return (
            <Card>
                <Empty description="No completed sprints available" />
            </Card>
        );
    }

    const averageVelocity = sprints.length > 0
        ? Math.round(sprints.reduce((sum, s) => sum + (s.velocity || 0), 0) / sprints.length)
        : 0;

    const option = {
        title: {
            text: 'Team Velocity',
            subtext: `Average: ${averageVelocity} SP`,
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow',
            },
            formatter: (params: any) => {
                const data = params[0];
                return `${data.name}<br/>Velocity: ${data.value} SP`;
            },
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            data: sprints.map(s => s.name),
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
                data: sprints.map(s => s.velocity || 0),
                itemStyle: {
                    color: '#5470c6',
                },
                markLine: {
                    data: [
                        {
                            type: 'average',
                            name: 'Average',
                            label: {
                                formatter: 'Avg: {c} SP',
                            },
                        },
                    ],
                    lineStyle: {
                        color: '#91cc75',
                        type: 'dashed',
                    },
                },
            },
        ],
    };

    return (
        <Card>
            <ReactECharts option={option} style={{ height: '400px' }} />
        </Card>
    );
};

export default VelocityChart;
