import React, { useState, useEffect } from 'react';
import { Card, Spin, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import axios from '@/services/axios';

interface BurndownChartProps {
    sprintId: string;
}

const BurndownChart: React.FC<BurndownChartProps> = ({ sprintId }) => {
    const [data, setData] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadBurndownData();
    }, [sprintId]);

    const loadBurndownData = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/sprints/${sprintId}/burndown`);
            setData(response.data);
        } catch (error) {
            console.error('Failed to load burndown data:', error);
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

    if (data.length === 0) {
        return (
            <Card>
                <Empty description="No burndown data available" />
            </Card>
        );
    }

    const option = {
        title: {
            text: 'Sprint Burndown Chart',
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'cross',
            },
        },
        legend: {
            data: ['Ideal Burndown', 'Actual Burndown'],
            bottom: 10,
        },
        grid: {
            left: '3%',
            right: '4%',
            bottom: '15%',
            containLabel: true,
        },
        xAxis: {
            type: 'category',
            boundaryGap: false,
            data: data.map(d => `Day ${d.day}`),
            name: 'Sprint Days',
        },
        yAxis: {
            type: 'value',
            name: 'Story Points',
            min: 0,
        },
        series: [
            {
                name: 'Ideal Burndown',
                type: 'line',
                data: data.map(d => d.idealRemaining),
                smooth: true,
                lineStyle: {
                    type: 'dashed',
                    color: '#91cc75',
                },
                itemStyle: {
                    color: '#91cc75',
                },
            },
            {
                name: 'Actual Burndown',
                type: 'line',
                data: data.map(d => d.actualRemaining),
                smooth: true,
                lineStyle: {
                    color: '#5470c6',
                },
                itemStyle: {
                    color: '#5470c6',
                },
                areaStyle: {
                    color: 'rgba(84, 112, 198, 0.1)',
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

export default BurndownChart;
