import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Button, Space, Select, Typography } from 'antd';
import { PlusOutlined, SettingOutlined } from '@ant-design/icons';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import axios from '@/services/axios';
import BoardColumn from './BoardColumn';
import BoardSettings from './BoardSettings';

const { Title } = Typography;

interface Board {
    id: string;
    name: string;
    type: string;
    swimlaneType: string;
    columns: BoardColumnType[];
}

interface BoardColumnType {
    id: string;
    name: string;
    position: number;
    wipLimit: number | null;
    mappedStatus: string;
    taskCount?: number;
}

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

interface BoardViewProps {
    projectId: string;
}

const BoardView: React.FC<BoardViewProps> = ({ projectId }) => {
    const [boards, setBoards] = useState<Board[]>([]);
    const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [taskCounts, setTaskCounts] = useState<Record<string, number>>({});

    useEffect(() => {
        loadBoards();
    }, [projectId]);

    useEffect(() => {
        if (selectedBoard) {
            loadTasks();
            loadTaskCounts();
        }
    }, [selectedBoard]);

    const loadBoards = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/boards/project/${projectId}`);
            setBoards(response.data);
            if (response.data.length > 0) {
                setSelectedBoard(response.data[0]);
            }
        } catch (error) {
            message.error('Failed to load boards');
        } finally {
            setLoading(false);
        }
    };

    const loadTasks = async () => {
        if (!selectedBoard) return;

        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/tasks`);
            setTasks(response.data);
        } catch (error) {
            message.error('Failed to load tasks');
        }
    };

    const loadTaskCounts = async () => {
        if (!selectedBoard) return;

        try {
            const response = await axios.get(`/api/v1/boards/${selectedBoard.id}/columns/task-counts`);
            setTaskCounts(response.data);
        } catch (error) {
            console.error('Failed to load task counts:', error);
        }
    };

    const handleDragEnd = async (result: DropResult) => {
        const { destination, source, draggableId, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === 'COLUMN') {
            // Reorder columns
            const newColumns = Array.from(selectedBoard!.columns);
            const [removed] = newColumns.splice(source.index, 1);
            newColumns.splice(destination.index, 0, removed);

            const updatedBoard = { ...selectedBoard!, columns: newColumns };
            setSelectedBoard(updatedBoard);

            try {
                await axios.post(`/api/v1/boards/${selectedBoard!.id}/columns/reorder`, {
                    columnIds: newColumns.map(col => col.id),
                });
                message.success('Columns reordered');
            } catch (error) {
                message.error('Failed to reorder columns');
                loadBoards(); // Reload to reset state
            }
        } else {
            // Move task between columns
            const targetColumnId = destination.droppableId;

            try {
                await axios.post(
                    `/api/v1/boards/${selectedBoard!.id}/tasks/${draggableId}/move`,
                    { targetColumnId }
                );

                // Update local state
                const updatedTasks = tasks.map(task => {
                    if (task.id === draggableId) {
                        const targetColumn = selectedBoard!.columns.find(col => col.id === targetColumnId);
                        return { ...task, status: targetColumn!.mappedStatus };
                    }
                    return task;
                });
                setTasks(updatedTasks);
                loadTaskCounts();
                message.success('Task moved');
            } catch (error) {
                message.error('Failed to move task');
                loadTasks(); // Reload to reset state
            }
        }
    };

    const getTasksForColumn = (columnId: string): Task[] => {
        const column = selectedBoard?.columns.find(col => col.id === columnId);
        if (!column) return [];

        return tasks.filter(task => task.status === column.mappedStatus);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (boards.length === 0) {
        return (
            <Card>
                <Typography.Text type="secondary">
                    No boards found. Create a board to get started.
                </Typography.Text>
            </Card>
        );
    }

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Space>
                    <Title level={4} style={{ margin: 0 }}>Board:</Title>
                    <Select
                        style={{ width: 200 }}
                        value={selectedBoard?.id}
                        onChange={(value) => {
                            const board = boards.find(b => b.id === value);
                            setSelectedBoard(board || null);
                        }}
                        options={boards.map(board => ({
                            label: board.name,
                            value: board.id,
                        }))}
                    />
                </Space>
                <Space>
                    <Button
                        icon={<SettingOutlined />}
                        onClick={() => setShowSettings(true)}
                    >
                        Settings
                    </Button>
                    <Button type="primary" icon={<PlusOutlined />}>
                        Add Column
                    </Button>
                </Space>
            </div>

            {selectedBoard && (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="board" direction="horizontal" type="COLUMN">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                style={{
                                    display: 'flex',
                                    gap: '16px',
                                    overflowX: 'auto',
                                    padding: '8px',
                                    flex: 1,
                                }}
                            >
                                {selectedBoard.columns.map((column, index) => (
                                    <Draggable
                                        key={column.id}
                                        draggableId={column.id}
                                        index={index}
                                    >
                                        {(provided) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                style={{
                                                    ...provided.draggableProps.style,
                                                    minWidth: '300px',
                                                }}
                                            >
                                                <BoardColumn
                                                    column={column}
                                                    tasks={getTasksForColumn(column.id)}
                                                    taskCount={taskCounts[column.id] || 0}
                                                    dragHandleProps={provided.dragHandleProps}
                                                />
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}

            {showSettings && selectedBoard && (
                <BoardSettings
                    board={selectedBoard}
                    visible={showSettings}
                    onClose={() => setShowSettings(false)}
                    onUpdate={loadBoards}
                />
            )}
        </div>
    );
};

export default BoardView;
