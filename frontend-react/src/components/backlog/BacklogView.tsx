import React, { useState, useEffect } from 'react';
import { Card, Spin, message, Empty, Button } from 'antd';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PlusOutlined } from '@ant-design/icons';
import axios from '../../services/axios';
import BacklogFilters from './BacklogFilters';
import SortableTaskItem from './SortableTaskItem';
import { Task } from '../../types';

interface BacklogViewProps {
    projectId: string;
}

const BacklogView: React.FC<BacklogViewProps> = ({ projectId }) => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        epicId: undefined as string | undefined,
        assigneeId: undefined as string | undefined,
        search: '',
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    useEffect(() => {
        fetchBacklog();
    }, [projectId]);

    useEffect(() => {
        applyFilters();
    }, [tasks, filters]);

    const fetchBacklog = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/backlog`);
            if (response.data.success) {
                setTasks(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load backlog');
            console.error('Error fetching backlog:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...tasks];

        if (filters.epicId) {
            filtered = filtered.filter(task => task.epic?.id === filters.epicId);
        }

        if (filters.assigneeId) {
            filtered = filtered.filter(task => task.assignee?.id === filters.assigneeId);
        }

        if (filters.search) {
            const searchLower = filters.search.toLowerCase();
            filtered = filtered.filter(task =>
                task.title.toLowerCase().includes(searchLower) ||
                task.identifier.toLowerCase().includes(searchLower) ||
                (task.description && task.description.toLowerCase().includes(searchLower))
            );
        }

        setFilteredTasks(filtered);
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            const oldIndex = filteredTasks.findIndex(task => task.id === active.id);
            const newIndex = filteredTasks.findIndex(task => task.id === over.id);

            const newOrder = arrayMove(filteredTasks, oldIndex, newIndex);
            setFilteredTasks(newOrder);

            // Send reorder request to backend
            try {
                const taskIds = newOrder.map(task => task.id);
                await axios.post('/api/v1/backlog/reorder', taskIds, {
                    params: { projectId }
                });
                message.success('Backlog reordered successfully');
                fetchBacklog(); // Refresh to get updated priorities
            } catch (error) {
                message.error('Failed to reorder backlog');
                console.error('Error reordering backlog:', error);
                // Revert on error
                setFilteredTasks(filteredTasks);
            }
        }
    };

    const handleFilterChange = (newFilters: any) => {
        setFilters(newFilters);
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" />
            </div>
        );
    }

    return (
        <div style={{ padding: '24px' }}>
            <Card
                title="Product Backlog"
                extra={
                    <Button type="primary" icon={<PlusOutlined />}>
                        Create Task
                    </Button>
                }
            >
                <BacklogFilters
                    projectId={projectId}
                    filters={filters}
                    onFilterChange={handleFilterChange}
                />

                {filteredTasks.length === 0 ? (
                    <Empty
                        description="No backlog items"
                        style={{ marginTop: '40px' }}
                    />
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                    >
                        <SortableContext
                            items={filteredTasks.map(task => task.id)}
                            strategy={verticalListSortingStrategy}
                        >
                            <div style={{ marginTop: '16px' }}>
                                {filteredTasks.map((task) => (
                                    <SortableTaskItem key={task.id} task={task} />
                                ))}
                            </div>
                        </SortableContext>
                    </DndContext>
                )}
            </Card>
        </div>
    );
};

export default BacklogView;
