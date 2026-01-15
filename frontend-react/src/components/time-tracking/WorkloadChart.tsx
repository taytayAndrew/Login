import React, { useState, useEffect } from 'react';
import { Card, DatePicker, Space, message, Spin } from 'antd';
import ReactECharts from 'echarts-for-react';
import axios from 'axios';
import dayjs, { Dayjs } from 'dayjs';

const { RangePicker } = DatePicker;

interface WorkloadChartProps {
    userId: number;
    username?: string;
}

const WorkloadChart: React.FC<WorkloadChartProps> = ({ userId, username = 'User' }) => {
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState<{ date: string; hours: number }[]>([]);
    const [dateRange, setDateRange] = useState<[Dayjs, Dayjs]>([
        dayjs().subtract(30, 'day'),
        dayjs()
    ]);

    useEffect(() => {
        loadWorkloadData();
    }, [userId, dateRange]);

    const loadWorkloadData = async () => {
        setLoading(true);
        try {
            const response = await axios.get(
                `/api/v1/time-tracking/stats/user/${userId}/daily`,
                {
                    params: {
                        startDate: dateRange[0].toISOString(),
                        endDate: dateRange[1].toISOString()
                    }
                }
            );

            // 转换数据格式
            const data = Object.entries(response.data).map(([date, minutes]) => ({
                date,
                hours: Math.round((minutes as number) / 60 * 10) / 10 // 转换为小时，保留1位小数
            }));

            // 按日期排序
            data.sort((a, b) => a.date.localeCompare(b.date));

            setChartData(data);
        } catch (error) {
            message.error('加载工作量数据失败');
        } finally {
            setLoading(false);
        }
    };

    const getChartOption = () => {
        const dates = chartData.map(d => d.date);
        const hours = chartData.map(d => d.hours);

        // 计算平均工作量
        const avgHours = hours.length > 0
            ? hours.reduce((sum, h) => sum + h, 0) / hours.length
            : 0;

        return {
            title: {
                text: `${username} 的工作量趋势`,
                left: 'center'
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: any) => {
                    const date = params[0].axisValue;
                    const hours = params[0].data;
                    return `${date}<br/>工作量: ${hours}小时`;
                }
            },
            legend: {
                data: ['每日工作量', '平均工作量'],
                bottom: 0
            },
            grid: {
                left: '3%',
                right: '4%',
                bottom: '10%',
                containLabel: true
            },
            xAxis: {
                type: 'category',
                data: dates,
                axisLabel: {
                    rotate: 45,
                    formatter: (value: string) => dayjs(value).format('MM-DD')
                }
            },
            yAxis: {
                type: 'value',
                name: '工作量（小时）',
                axisLabel: {
                    formatter: '{value}h'
                }
            },
            series: [
                {
                    name: '每日工作量',
                    type: 'bar',
                    data: hours,
                    itemStyle: {
                        color: '#1890ff'
                    },
                    markLine: {
                        data: [
                            {
                                name: '平均工作量',
                                yAxis: avgHours,
                                lineStyle: {
                                    color: '#52c41a',
                                    type: 'dashed'
                                },
                                label: {
                                    formatter: `平均: ${avgHours.toFixed(1)}h`
                                }
                            },
                            {
                                name: '每日8小时',
                                yAxis: 8,
                                lineStyle: {
                                    color: '#faad14',
                                    type: 'dashed'
                                },
                                label: {
                                    formatter: '标准: 8h'
                                }
                            }
                        ]
                    }
                }
            ]
        };
    };

    return (
        <Card
            title="工作量趋势"
            extra={
                <RangePicker
                    value={dateRange}
                    onChange={(dates) => dates && setDateRange(dates as [Dayjs, Dayjs])}
                    format="YYYY-MM-DD"
                />
            }
        >
            {loading ? (
                <div style={{ textAlign: 'center', padding: '50px 0' }}>
                    <Spin size="large" />
                </div>
            ) : (
                <ReactECharts
                    option={getChartOption()}
                    style={{ height: 400 }}
                    notMerge={true}
                    lazyUpdate={true}
                />
            )}
        </Card>
    );
};

export default WorkloadChart;
