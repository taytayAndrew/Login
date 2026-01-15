import React from 'react';
import { Card, Typography, Divider } from 'antd';
import BoardColumn from './BoardColumn';

const { Title, Text } = Typography;

interface Task {
    id: string;
    taskKey: string;
    title: string;
    status: string;
    priority: string;
    assignee?: {
        id: string;
        username: string;
    };
}

interface BoardColumnType {
    id: string;
    name: string;
    wipLimit: number | null;
    mappedStatus: string;
}

interface SwimlaneViewProps {
    columns: BoardColumnType[];
    tasks: Task[];
    swimlaneType: string;
    taskCounts: Record<string, number>;
}

const SwimlaneView: React.FC<SwimlaneViewProps> = ({
    columns,
    tasks,
    swimlaneType,
    taskCounts,
}) => {
    const groupTasksBySwimlane = (): Map<string, Task[]> => {
        const groups = new Map<string, Task[]>();

        switch (swimlaneType) {
            case 'ASSIGNEE':
                tasks.forEach(task => {
                    const key = task.assignee?.username || 'Unassigned';
                    if (!groups.has(key)) {
                        groups.set(key, []);
                    }
                    groups.get(key)!.push(task);
                });
                break;

            case 'PRIORITY':
                tasks.forEach(task => {
                    const key = task.priority;
                    if (!groups.has(key)) {
                        groups.set(key, []);
                    }
                    groups.get(key)!.push(task);
                });
                break;

            default:
                groups.set('All Tasks', tasks);
        }

        return groups;
    };

    const swimlanes = groupTasksBySwimlane();

    return (
        <div>
            {Array.from(swimlanes.entries()).map(([swimlaneName, swimlaneTasks]) => (
                <div key={swimlaneName} style={{ marginBottom: 24 }}>
                    <Card size="small" style={{ marginBottom: 8 }}>
                        <Title level={5} style={{ margin: 0 }}>
                            {swimlaneName}
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: '14px' }}>
                                ({swimlaneTasks.length} tasks)
                            </Text>
                        </Title>
                    </Card>

                    <div style={{ display: 'flex', gap: '16px', overflowX: 'auto' }}>
                        {columns.map(column => {
                            const columnTasks = swimlaneTasks.filter(
                                task => task.status === column.mappedStatus
                            );
                            return (
                                <BoardColumn
                                    key={column.id}
                                    column={column}
                                    tasks={columnTasks}
                                    taskCount={taskCounts[column.id] || 0}
                                />
                            );
                        })}
                    </div>

                    <Divider />
                </div>
            ))}
        </div>
    );
};

export default SwimlaneView;
