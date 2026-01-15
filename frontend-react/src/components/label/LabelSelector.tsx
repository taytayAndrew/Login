import React, { useState, useEffect } from 'react';
import { Select, Tag, Button, Input, ColorPicker, Space, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { Color } from 'antd/es/color-picker';
import axios from '@/services/axios';

interface Label {
    id: string;
    name: string;
    color: string;
    projectId: string;
}

interface LabelSelectorProps {
    projectId: string;
    value?: string[];
    onChange?: (labelIds: string[]) => void;
    disabled?: boolean;
}

const LabelSelector: React.FC<LabelSelectorProps> = ({
    projectId,
    value = [],
    onChange,
    disabled = false,
}) => {
    const [labels, setLabels] = useState<Label[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newLabelName, setNewLabelName] = useState('');
    const [newLabelColor, setNewLabelColor] = useState<string>('#1890ff');

    useEffect(() => {
        loadLabels();
    }, [projectId]);

    const loadLabels = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/labels/project/${projectId}`);
            setLabels(response.data);
        } catch (error) {
            message.error('Failed to load labels');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateLabel = async () => {
        if (!newLabelName.trim()) {
            message.warning('Please enter a label name');
            return;
        }

        try {
            const response = await axios.post('/api/v1/labels', {
                projectId,
                name: newLabelName.trim(),
                color: newLabelColor,
            });

            setLabels([...labels, response.data]);
            setNewLabelName('');
            setNewLabelColor('#1890ff');
            setShowCreateForm(false);
            message.success('Label created successfully');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create label');
        }
    };

    const handleColorChange = (color: Color) => {
        setNewLabelColor(color.toHexString());
    };

    const tagRender = (props: any) => {
        const { label: labelId, closable, onClose } = props;
        const label = labels.find(l => l.id === labelId);

        if (!label) return null;

        return (
            <Tag
                color={label.color}
                closable={closable}
                onClose={onClose}
                style={{ marginRight: 3 }}
            >
                {label.name}
            </Tag>
        );
    };

    return (
        <div>
            <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select labels"
                value={value}
                onChange={onChange}
                loading={loading}
                disabled={disabled}
                tagRender={tagRender}
                dropdownRender={(menu) => (
                    <>
                        {menu}
                        {!showCreateForm ? (
                            <Button
                                type="text"
                                icon={<PlusOutlined />}
                                onClick={() => setShowCreateForm(true)}
                                style={{ width: '100%', textAlign: 'left' }}
                            >
                                Create new label
                            </Button>
                        ) : (
                            <div style={{ padding: '8px' }}>
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <Input
                                        placeholder="Label name"
                                        value={newLabelName}
                                        onChange={(e) => setNewLabelName(e.target.value)}
                                        onPressEnter={handleCreateLabel}
                                    />
                                    <Space>
                                        <ColorPicker
                                            value={newLabelColor}
                                            onChange={handleColorChange}
                                        />
                                        <Button type="primary" size="small" onClick={handleCreateLabel}>
                                            Create
                                        </Button>
                                        <Button size="small" onClick={() => setShowCreateForm(false)}>
                                            Cancel
                                        </Button>
                                    </Space>
                                </Space>
                            </div>
                        )}
                    </>
                )}
            >
                {labels.map((label) => (
                    <Select.Option key={label.id} value={label.id}>
                        <Tag color={label.color}>{label.name}</Tag>
                    </Select.Option>
                ))}
            </Select>
        </div>
    );
};

export default LabelSelector;
