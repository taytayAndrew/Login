import React, { useState, useEffect } from 'react';
import { Row, Col, Select, Input } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import axios from '../../services/axios';

const { Option } = Select;

interface BacklogFiltersProps {
    projectId: string;
    filters: {
        epicId?: string;
        assigneeId?: string;
        search: string;
    };
    onFilterChange: (filters: any) => void;
}

const BacklogFilters: React.FC<BacklogFiltersProps> = ({ projectId, filters, onFilterChange }) => {
    const [epics, setEpics] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);

    useEffect(() => {
        fetchEpics();
        fetchMembers();
    }, [projectId]);

    const fetchEpics = async () => {
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/epics`);
            if (response.data.success) {
                setEpics(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching epics:', error);
        }
    };

    const fetchMembers = async () => {
        try {
            const response = await axios.get(`/api/v1/projects/${projectId}/members`);
            if (response.data.success) {
                setMembers(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching members:', error);
        }
    };

    const handleEpicChange = (value: string) => {
        onFilterChange({ ...filters, epicId: value || undefined });
    };

    const handleAssigneeChange = (value: string) => {
        onFilterChange({ ...filters, assigneeId: value || undefined });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onFilterChange({ ...filters, search: e.target.value });
    };

    return (
        <Row gutter={16} style={{ marginBottom: '16px' }}>
            <Col span={8}>
                <Select
                    placeholder="Filter by Epic"
                    allowClear
                    style={{ width: '100%' }}
                    value={filters.epicId}
                    onChange={handleEpicChange}
                >
                    {epics.map(epic => (
                        <Option key={epic.id} value={epic.id}>
                            {epic.name}
                        </Option>
                    ))}
                </Select>
            </Col>
            <Col span={8}>
                <Select
                    placeholder="Filter by Assignee"
                    allowClear
                    style={{ width: '100%' }}
                    value={filters.assigneeId}
                    onChange={handleAssigneeChange}
                >
                    {members.map(member => (
                        <Option key={member.user.id} value={member.user.id}>
                            {member.user.username}
                        </Option>
                    ))}
                </Select>
            </Col>
            <Col span={8}>
                <Input
                    placeholder="Search tasks..."
                    prefix={<SearchOutlined />}
                    value={filters.search}
                    onChange={handleSearchChange}
                    allowClear
                />
            </Col>
        </Row>
    );
};

export default BacklogFilters;
