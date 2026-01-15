import React, { useState } from 'react';
import {
    Modal,
    Form,
    Input,
    Select,
    InputNumber,
    Button,
    Space,
    List,
    Card,
    message,
    Popconfirm,
} from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import axios from '@/services/axios';

interface Board {
    id: string;
    name: string;
    type: string;
    swimlaneType: string;
    columns: BoardColumn[];
}

interface BoardColumn {
    id: string;
    name: string;
    position: number;
    wipLimit: number | null;
    mappedStatus: string;
}

interface BoardSettingsProps {
    board: Board;
    visible: boolean;
    onClose: () => void;
    onUpdate: () => void;
}

const SWIMLANE_TYPES = [
    { value: 'NONE', label: 'No Swimlanes' },
    { value: 'ASSIGNEE', label: 'By Assignee' },
    { value: 'PRIORITY', label: 'By Priority' },
    { value: 'EPIC', label: 'By Epic' },
];

const BoardSettings: React.FC<BoardSettingsProps> = ({
    board,
    visible,
    onClose,
    onUpdate,
}) => {
    const [form] = Form.useForm();
    const [editingColumn, setEditingColumn] = useState<BoardColumn | null>(null);

    const handleUpdateBoard = async (values: any) => {
        try {
            await axios.put(`/api/v1/boards/${board.id}`, values);
            message.success('Board updated successfully');
            onUpdate();
            onClose();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update board');
        }
    };

    const handleUpdateColumn = async (columnId: string, values: any) => {
        try {
            await axios.put(`/api/v1/boards/${board.id}/columns/${columnId}`, values);
            message.success('Column updated successfully');
            setEditingColumn(null);
            onUpdate();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update column');
        }
    };

    const handleDeleteColumn = async (columnId: string) => {
        try {
            await axios.delete(`/api/v1/boards/${board.id}/columns/${columnId}`);
            message.success('Column deleted successfully');
            onUpdate();
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to delete column');
        }
    };

    return (
        <Modal
            title="Board Settings"
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <Card title="Board Configuration" size="small">
                    <Form
                        form={form}
                        layout="vertical"
                        initialValues={{
                            name: board.name,
                            swimlaneType: board.swimlaneType,
                        }}
                        onFinish={handleUpdateBoard}
                    >
                        <Form.Item
                            name="name"
                            label="Board Name"
                            rules={[{ required: true, message: 'Please enter board name' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item name="swimlaneType" label="Swimlane Type">
                            <Select options={SWIMLANE_TYPES} />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit">
                                Update Board
                            </Button>
                        </Form.Item>
                    </Form>
                </Card>

                <Card title="Columns" size="small">
                    <List
                        dataSource={board.columns}
                        renderItem={(column) => (
                            <List.Item
                                actions={[
                                    <Button
                                        type="text"
                                        icon={<EditOutlined />}
                                        onClick={() => setEditingColumn(column)}
                                    />,
                                    <Popconfirm
                                        title="Delete column?"
                                        description="This will not delete tasks, only the column."
                                        onConfirm={() => handleDeleteColumn(column.id)}
                                    >
                                        <Button type="text" danger icon={<DeleteOutlined />} />
                                    </Popconfirm>,
                                ]}
                            >
                                <List.Item.Meta
                                    title={column.name}
                                    description={`Status: ${column.mappedStatus} | WIP Limit: ${column.wipLimit || 'None'}`}
                                />
                            </List.Item>
                        )}
                    />
                </Card>
            </Space>

            {editingColumn && (
                <Modal
                    title="Edit Column"
                    open={!!editingColumn}
                    onCancel={() => setEditingColumn(null)}
                    footer={null}
                >
                    <Form
                        layout="vertical"
                        initialValues={{
                            name: editingColumn.name,
                            wipLimit: editingColumn.wipLimit,
                        }}
                        onFinish={(values) => handleUpdateColumn(editingColumn.id, values)}
                    >
                        <Form.Item
                            name="name"
                            label="Column Name"
                            rules={[{ required: true, message: 'Please enter column name' }]}
                        >
                            <Input />
                        </Form.Item>

                        <Form.Item name="wipLimit" label="WIP Limit">
                            <InputNumber
                                min={0}
                                placeholder="No limit"
                                style={{ width: '100%' }}
                            />
                        </Form.Item>

                        <Form.Item>
                            <Space>
                                <Button type="primary" htmlType="submit">
                                    Update
                                </Button>
                                <Button onClick={() => setEditingColumn(null)}>
                                    Cancel
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Modal>
            )}
        </Modal>
    );
};

export default BoardSettings;
