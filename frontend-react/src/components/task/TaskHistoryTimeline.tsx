import React from 'react';
import { Timeline, Typography, Empty } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';

const { Text } = Typography;

interface HistoryEntry {
    id: string;
    fieldName: string;
    oldValue: string;
    newValue: string;
    changedBy: { name: string };
    changedAt: string;
}

interface TaskHistoryTimelineProps {
    history: HistoryEntry[];
}

const TaskHistoryTimeline: React.FC<TaskHistoryTimelineProps> = ({ history }) => {
    if (!history || history.length === 0) {
        return <Empty description="No history available" />;
    }

    const items = history.map((entry) => ({
        key: entry.id,
        dot: <ClockCircleOutlined />,
        children: (
            <div>
                <Text strong>{entry.changedBy.name}</Text>
                <Text> changed </Text>
                <Text code>{entry.fieldName}</Text>
                <div style={{ marginTop: 4 }}>
                    <Text type="secondary">From: </Text>
                    <Text delete>{entry.oldValue || 'empty'}</Text>
                    <Text type="secondary"> → To: </Text>
                    <Text mark>{entry.newValue}</Text>
                </div>
                <div style={{ marginTop: 4 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                        {new Date(entry.changedAt).toLocaleString()}
                    </Text>
                </div>
            </div>
        ),
    }));

    return <Timeline items={items} />;
};

export default TaskHistoryTimeline;
