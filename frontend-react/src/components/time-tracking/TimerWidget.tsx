import React, { useState, useEffect } from 'react';
import { Card, Button, Typography, Space, message, Select } from 'antd';
import { PlayCircleOutlined, PauseCircleOutlined, StopOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Text, Title } = Typography;

interface Task {
    id: string;
    title: string;
    identifier: string;
}

interface TimeEntry {
    id: number;
    task: Task;
    startTime: string;
    isRunning: boolean;
    pausedAt: string | null;
    pausedDuration: number;
}

interface TimerWidgetProps {
    userId: number;
    availableTasks?: Task[];
}

const TimerWidget: React.FC<TimerWidgetProps> = ({ userId, availableTasks = [] }) => {
    const [runningTimer, setRunningTimer] = useState<TimeEntry | null>(null);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    // 加载正在运行的计时器
    useEffect(() => {
        loadRunningTimer();
    }, [userId]);

    // 更新计时器显示
    useEffect(() => {
        if (!runningTimer || !runningTimer.isRunning || runningTimer.pausedAt) {
            return;
        }

        const interval = setInterval(() => {
            const startTime = new Date(runningTimer.startTime).getTime();
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000) - (runningTimer.pausedDuration * 60);
            setElapsedTime(elapsed);
        }, 1000);

        return () => clearInterval(interval);
    }, [runningTimer]);

    const loadRunningTimer = async () => {
        try {
            const response = await axios.get(`/api/v1/time-tracking/timer/running`, {
                params: { userId }
            });
            if (response.data) {
                setRunningTimer(response.data);
                const startTime = new Date(response.data.startTime).getTime();
                const now = Date.now();
                const elapsed = Math.floor((now - startTime) / 1000) - (response.data.pausedDuration * 60);
                setElapsedTime(elapsed);
            }
        } catch (error: any) {
            if (error.response?.status !== 204) {
                console.error('Failed to load running timer:', error);
            }
        }
    };

    const handleStart = async () => {
        if (!selectedTaskId) {
            message.warning('请选择一个任务');
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('/api/v1/time-tracking/timer/start', null, {
                params: { taskId: selectedTaskId, userId }
            });
            setRunningTimer(response.data);
            setElapsedTime(0);
            message.success('计时器已启动');
        } catch (error: any) {
            message.error(error.response?.data?.message || '启动计时器失败');
        } finally {
            setLoading(false);
        }
    };

    const handleStop = async () => {
        setLoading(true);
        try {
            await axios.post('/api/v1/time-tracking/timer/stop', null, {
                params: { userId }
            });
            setRunningTimer(null);
            setElapsedTime(0);
            message.success('计时器已停止，工时已记录');
        } catch (error: any) {
            message.error(error.response?.data?.message || '停止计时器失败');
        } finally {
            setLoading(false);
        }
    };

    const handlePause = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/v1/time-tracking/timer/pause', null, {
                params: { userId }
            });
            setRunningTimer(response.data);
            message.success('计时器已暂停');
        } catch (error: any) {
            message.error(error.response?.data?.message || '暂停计时器失败');
        } finally {
            setLoading(false);
        }
    };

    const handleResume = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/api/v1/time-tracking/timer/resume', null, {
                params: { userId }
            });
            setRunningTimer(response.data);
            message.success('计时器已恢复');
        } catch (error: any) {
            message.error(error.response?.data?.message || '恢复计时器失败');
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <Card
            title={
                <Space>
                    <ClockCircleOutlined />
                    <span>计时器</span>
                </Space>
            }
            style={{ width: '100%', maxWidth: 400 }}
        >
            {runningTimer ? (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <Text type="secondary">当前任务</Text>
                        <Title level={5} style={{ margin: '8px 0' }}>
                            {runningTimer.task.identifier} - {runningTimer.task.title}
                        </Title>
                    </div>

                    <div style={{ textAlign: 'center' }}>
                        <Title level={2} style={{ margin: 0, fontFamily: 'monospace' }}>
                            {formatTime(elapsedTime)}
                        </Title>
                        {runningTimer.pausedAt && (
                            <Text type="warning">已暂停</Text>
                        )}
                    </div>

                    <Space style={{ width: '100%', justifyContent: 'center' }}>
                        {runningTimer.pausedAt ? (
                            <Button
                                type="primary"
                                icon={<PlayCircleOutlined />}
                                onClick={handleResume}
                                loading={loading}
                            >
                                恢复
                            </Button>
                        ) : (
                            <Button
                                icon={<PauseCircleOutlined />}
                                onClick={handlePause}
                                loading={loading}
                            >
                                暂停
                            </Button>
                        )}
                        <Button
                            danger
                            icon={<StopOutlined />}
                            onClick={handleStop}
                            loading={loading}
                        >
                            停止
                        </Button>
                    </Space>
                </Space>
            ) : (
                <Space direction="vertical" style={{ width: '100%' }} size="large">
                    <div>
                        <Text type="secondary">选择任务</Text>
                        <Select
                            style={{ width: '100%', marginTop: 8 }}
                            placeholder="选择要计时的任务"
                            value={selectedTaskId}
                            onChange={setSelectedTaskId}
                            showSearch
                            optionFilterProp="children"
                        >
                            {availableTasks.map(task => (
                                <Select.Option key={task.id} value={task.id}>
                                    {task.identifier} - {task.title}
                                </Select.Option>
                            ))}
                        </Select>
                    </div>

                    <Button
                        type="primary"
                        icon={<PlayCircleOutlined />}
                        onClick={handleStart}
                        loading={loading}
                        disabled={!selectedTaskId}
                        block
                    >
                        开始计时
                    </Button>
                </Space>
            )}
        </Card>
    );
};

export default TimerWidget;
