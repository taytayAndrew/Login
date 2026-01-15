import React, { useState } from 'react';
import { Table, Tag, Space, DatePicker, Select, Input, Card, Typography, Tooltip } from 'antd';
import { SearchOutlined, FilterOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

interface AuditLog {
    id: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    action: 'CREATE' | 'UPDATE' | 'DELETE' | 'LOGIN' | 'LOGOUT' | 'PERMISSION_CHANGE' | 'ROLE_ASSIGN' | 'ROLE_REMOVE';
    entityType: string;
    entityId: string;
    entityName: string;
    oldValue?: string;
    newValue?: string;
    ipAddress?: string;
    userAgent?: string;
    timestamp: string;
}

interface AuditLogViewerProps {
    entityType?: string;
    entityId?: string;
}

const AuditLogViewer: React.FC<AuditLogViewerProps> = ({ entityType, entityId }) => {
    const [loading, setLoading] = useState(false);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [filters, setFilters] = useState({
        action: undefined as string | undefined,
        entityType: entityType,
        startDate: undefined as string | undefined,
        endDate: undefined as string | undefined,
    });

    const actionColors: Record<string, string> = {
        CREATE: 'green',
        UPDATE: 'blue',
        DELETE: 'red',
        LOGIN: 'cyan',
        LOGOUT: 'default',
        PERMISSION_CHANGE: 'orange',
        ROLE_ASSIGN: 'purple',
        ROLE_REMOVE: 'magenta',
    };

    const columns: ColumnsType<AuditLog> = [
        {
            title: 'Timestamp',
            dataIndex: 'timestamp',
            key: 'timestamp',
            width: 180,
            render: (timestamp: string) => dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss'),
            sorter: (a, b) => dayjs(a.timestamp).unix() - dayjs(b.timestamp).unix(),
            defaultSortOrder: 'descend',
        },
        {
            title: 'User',
            dataIndex: ['user', 'name'],
            key: 'user',
            width: 150,
            render: (name: string, record: AuditLog) => (
                <Tooltip title={record.user.email}>
                    <span>{name}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            width: 120,
            render: (action: string) => (
                <Tag color={actionColors[action] || 'default'}>{action}</Tag>
            ),
            filters: [
                { text: 'CREATE', value: 'CREATE' },
                { text: 'UPDATE', value: 'UPDATE' },
                { text: 'DELETE', value: 'DELETE' },
                { text: 'LOGIN', value: 'LOGIN' },
                { text: 'LOGOUT', value: 'LOGOUT' },
            ],
            onFilter: (value, record) => record.action === value,
        },
        {
            title: 'Entity Type',
            dataIndex: 'entityType',
            key: 'entityType',
            width: 120,
        },
        {
            title: 'Entity',
            dataIndex: 'entityName',
            key: 'entityName',
            width: 200,
            render: (name: string, record: AuditLog) => (
                <Tooltip title={`ID: ${record.entityId}`}>
                    <span>{name}</span>
                </Tooltip>
            ),
        },
        {
            title: 'Changes',
            key: 'changes',
            render: (_, record: AuditLog) => (
                <Space direction="vertical" size="small">
                    {record.oldValue && (
                        <div>
                            <Tag color="red">Old</Tag>
                            <Tooltip title={record.oldValue}>
                                <span style={{ fontSize: '12px' }}>
                                    {record.oldValue.length > 50
                                        ? record.oldValue.substring(0, 50) + '...'
                                        : record.oldValue}
                                </span>
                            </Tooltip>
                        </div>
                    )}
                    {record.newValue && (
                        <div>
                            <Tag color="green">New</Tag>
                            <Tooltip title={record.newValue}>
                                <span style={{ fontSize: '12px' }}>
                                    {record.newValue.length > 50
                                        ? record.newValue.substring(0, 50) + '...'
                                        : record.newValue}
                                </span>
                            </Tooltip>
                        </div>
                    )}
                </Space>
            ),
        },
        {
            title: 'IP Address',
            dataIndex: 'ipAddress',
            key: 'ipAddress',
            width: 130,
        },
    ];

    const handleSearch = () => {
        setLoading(true);
        // TODO: Implement API call to fetch audit logs
        // Example: GET /api/v1/audit-logs/search?action=CREATE&entityType=Task&startDate=...&endDate=...
        setTimeout(() => {
            setLoading(false);
        }, 1000);
    };

    return (
        <Card>
            <Title level={4}>Audit Log</Title>

            <Space style={{ marginBottom: 16 }} wrap>
                <Select
                    placeholder="Action"
                    style={{ width: 150 }}
                    allowClear
                    value={filters.action}
                    onChange={(value) => setFilters({ ...filters, action: value })}
                >
                    <Option value="CREATE">CREATE</Option>
                    <Option value="UPDATE">UPDATE</Option>
                    <Option value="DELETE">DELETE</Option>
                    <Option value="LOGIN">LOGIN</Option>
                    <Option value="LOGOUT">LOGOUT</Option>
                </Select>

                {!entityType && (
                    <Input
                        placeholder="Entity Type"
                        style={{ width: 150 }}
                        value={filters.entityType}
                        onChange={(e) => setFilters({ ...filters, entityType: e.target.value })}
                    />
                )}

                <RangePicker
                    showTime
                    onChange={(dates) => {
                        if (dates) {
                            setFilters({
                                ...filters,
                                startDate: dates[0]?.toISOString(),
                                endDate: dates[1]?.toISOString(),
                            });
                        } else {
                            setFilters({
                                ...filters,
                                startDate: undefined,
                                endDate: undefined,
                            });
                        }
                    }}
                />

                <Space>
                    <SearchOutlined onClick={handleSearch} style={{ cursor: 'pointer', fontSize: 18 }} />
                    <FilterOutlined style={{ cursor: 'pointer', fontSize: 18 }} />
                </Space>
            </Space>

            <Table
                columns={columns}
                dataSource={auditLogs}
                loading={loading}
                rowKey="id"
                pagination={{
                    pageSize: 20,
                    showSizeChanger: true,
                    showTotal: (total) => `Total ${total} items`,
                }}
                scroll={{ x: 1200 }}
            />
        </Card>
    );
};

export default AuditLogViewer;
