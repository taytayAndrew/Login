import React from 'react';
import { Card, Badge, Typography, Space, Tag } from 'antd';
import { Droppable, Draggable, DraggableProvidedDragHandleProps } from 'react-beautiful-dnd';
import { WarningOutlined, DragOutlined } from '@ant-design/icons';
import BoardCard from './BoardCard';

const { Text } = Typography;

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

interface BoardColumnProps {
    column: {
        id: string;
        name: string;
        wipLimit: number | null;
        mappedStatus: string;
    };
    tasks: Task[];
    taskCount: number;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
}

const BoardColumn: React.FC<BoardColumnProps> = ({
    column,
    tasks,
    taskCount,
    dragHandleProps,
}) => {
    const isOverLimit = column.wipLimit !== null && taskCount >= column.wipLimit;
    const isNearLimit = column.wipLimit !== null && taskCount >= column.wipLimit * 0.8;

    return (
        <Card
            size="small"
            title={
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                        <span {...dragHandleProps} style={{ cursor: 'grab' }}>
                            <DragOutlined />
                        </span>
                        <Text strong>{column.name}</Text>
                        <Badge
                            count={taskCount}
                            style={{
                                backgroundColor: isOverLimit ? '#ff4d4f' : isNearLimit ? '#faad14' : '#52c41a',
                            }}
                        />
                    </Space>
                    {column.wipLimit !== null && (
                        <Space size={4}>
                            {isOverLimit && (
                                <Tag color="error" icon={<WarningOutlined />}>
                                    WIP Limit
                                </Tag>
                            )}
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                Limit: {column.wipLimit}
                            </Text>
                        </Space>
                    )}
                </div>
            }
            style={{
                minWidth: '300px',
                maxWidth: '300px',
                backgroundColor: isOverLimit ? '#fff1f0' : '#fff',
                border: isOverLimit ? '2px solid #ff4d4f' : '1px solid #d9d9d9',
            }}
            bodyStyle={{
                padding: '8px',
                minHeight: '400px',
                maxHeight: '70vh',
                overflowY: 'auto',
            }}
        >
            <Droppable droppableId={column.id} type="TASK">
                {(provided, snapshot) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        style={{
                            minHeight: '100px',
                            backgroundColor: snapshot.isDraggingOver ? '#e6f7ff' : 'transparent',
                            borderRadius: '4px',
                            padding: '4px',
                        }}
                    >
                        {tasks.map((task, index) => (
                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                        style={{
                                            ...provided.draggableProps.style,
                                            marginBottom: '8px',
                                        }}
                                    >
                                        <BoardCard task={task} isDragging={snapshot.isDragging} />
                                    </div>
                                )}
                            </Draggable>
                        ))}
                        {provided.placeholder}
                    </div>
                )}
            </Droppable>
        </Card>
    );
};

export default BoardColumn;
