import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Empty } from 'antd';
import ReactECharts from 'echarts-for-react';
import axios from '../../services/axios';

interface BurndownChartProps {
    sprintId: string;
}

const BurndownChart: React.FC<BurndownChartProps> = ({ sprintId }) => {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchBurndownData();
    }, [sprintId]);

    const fetchBurndownData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/sprints/${sprintId}/burndown`);
            if (response.data.success) {
                setData(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load burndown chart');
            console.error('Error fetching burndown:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Card title="Burndown Chart">
                <div style={{ textAlign: 'center', padding: '50px' }}>
                    <Spin />
                </div>
            </Card>
        );
    }

    if (!data || !data.data || data.data.length === 0) {
        return (
            <Card title="Burndown Chart">
                <Empty description="No burndown data available" />
            </Card>
        );
    }

    const dates = data.data.map((d: any) => new Date(d.date).toLocaleDateString());
    const remaining = data.data.map((d: any) => d.remaining);
    const ideal = data.data.map((d: any) => d.ideal);

    const option = {
        title: {
            text: `${data.sprintName} - Burndown Chart`,
            left: 'center',
        },
        tooltip: {
            trigger: 'axis',
            formatter: (params: any) => {
                let result = `${params[0].axisValue}<br/>`;
                params.forEach((param: any) => {
                    result += `${param.marker} ${param.seriesName}: ${param.value} SP<br/>`;
                });
                return result;
            },
        },
        legend: {
            data: ['Remaining', 'Ideal'],
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
            data: dates,
            name: 'Date',
        },
        yAxis: {
            type: 'value',
            name: 'Story Points',
            min: 0,
        },
        series: [
            {
                name: 'Remaining',
                type: 'line',
                data: remaining,
                itemStyle: { color: '#1890ff' },
                lineStyle: { width: 3 },
                symbol: 'circle',
                symbolSize: 8,
            },
            {
                name: 'Ideal',
                type: 'line',
                data: ideal,
                itemStyle: { color: '#52c41a' },
                lineStyle: { type: 'dashed', width: 2 },
                symbol: 'none',
            },
        ],
    };

    return (
        <Card title="Burndown Chart">
            <ReactECharts option={option} style={{ height: '400px' }} />
            <div style={{ textAlign: 'center', marginTop: '16px' }}>
                <span style={{ fontSize: '16px', fontWeight: 500 }}>
                    Total Story Points: {data.totalStoryPoints}
                </span>
            </div>
        </Card>
    );
};

export default BurndownChart;
