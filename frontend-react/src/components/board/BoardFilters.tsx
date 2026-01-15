import React from 'react';
import { Card, Select, Input, Space, Button } from 'antd';
import { SearchOutlined, FilterOutlined, ClearOutlined } from '@ant-design/icons';

const { Search } = Input;

interface BoardFiltersProps {
    onFilterChange?: (filters: any) => void;
    onSearch?: (value: string) => void;
}

const PRIORITY_OPTIONS = [
    { label: 'All Priorities', value: '' },
    { label: 'Critical', value: 'CRITICAL' },
    { label: 'High', value: 'HIGH' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'Low', value: 'LOW' },
];

const BoardFilters: React.FC<BoardFiltersProps> = ({
    onFilterChange,
    onSearch,
}) => {
    const [filters, setFilters] = React.useState({
        priority: '',
        assignee: '',
        search: '',
    });

    const handleFilterChange = (key: string, value: any) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        if (onFilterChange) {
            onFilterChange(newFilters);
        }
    };

    const handleClearFilters = () => {
        const clearedFilters = {
            priority: '',
            assignee: '',
            search: '',
        };
        setFilters(clearedFilters);
        if (onFilterChange) {
            onFilterChange(clearedFilters);
        }
    };

    return (
        <Card size="small" style={{ marginBottom: 16 }}>
            <Space wrap>
                <Search
                    placeholder="Search tasks..."
                    allowClear
                    prefix={<SearchOutlined />}
                    style={{ width: 250 }}
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    onSearch={onSearch}
                />

                <Select
                    placeholder="Filter by priority"
                    style={{ width: 150 }}
                    value={filters.priority}
                    onChange={(value) => handleFilterChange('priority', value)}
                    options={PRIORITY_OPTIONS}
                />

                <Button
                    icon={<ClearOutlined />}
                    onClick={handleClearFilters}
                >
                    Clear Filters
                </Button>
            </Space>
        </Card>
    );
};

export default BoardFilters;
