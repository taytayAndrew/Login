import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    Select,
    Switch,
    Button,
    Space,
    Card,
    message,
    Divider,
    Typography,
} from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import axios from '@/services/axios';

const { TextArea } = Input;
const { Title } = Typography;

interface CustomField {
    id: string;
    name: string;
    fieldType: string;
    description?: string;
    options?: string;
    required: boolean;
    defaultValue?: string;
}

interface CustomFieldEditorProps {
    projectId: string;
}

const FIELD_TYPES = [
    { value: 'TEXT', label: 'Text', description: 'Single line text' },
    { value: 'TEXTAREA', label: 'Text Area', description: 'Multi-line text' },
    { value: 'NUMBER', label: 'Number', description: 'Numeric value' },
    { value: 'DATE', label: 'Date', description: 'Date value' },
    { value: 'DATETIME', label: 'Date Time', description: 'Date and time value' },
    { value: 'SELECT', label: 'Select', description: 'Single selection from options' },
    { value: 'MULTI_SELECT', label: 'Multi Select', description: 'Multiple selections from options' },
    { value: 'CHECKBOX', label: 'Checkbox', description: 'Boolean value' },
    { value: 'URL', label: 'URL', description: 'Web address' },
    { value: 'EMAIL', label: 'Email', description: 'Email address' },
];

const CustomFieldEditor: React.FC<CustomFieldEditorProps> = ({ projectId }) => {
    const [form] = Form.useForm();
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [selectedFieldType, setSelectedFieldType] = useState<string>('TEXT');

    useEffect(() => {
        loadCustomFields();
    }, [projectId]);

    const loadCustomFields = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`/api/v1/custom-fields/project/${projectId}`);
            setCustomFields(response.data);
        } catch (error) {
            message.error('Failed to load custom fields');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (values: any) => {
        try {
            const response = await axios.post('/api/v1/custom-fields', {
                projectId,
                ...values,
            });

            setCustomFields([...customFields, response.data]);
            form.resetFields();
            setShowCreateForm(false);
            message.success('Custom field created successfully');
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to create custom field');
        }
    };

    const handleDelete = async (fieldId: string) => {
        try {
            await axios.delete(`/api/v1/custom-fields/${fieldId}`);
            setCustomFields(customFields.filter(f => f.id !== fieldId));
            message.success('Custom field deleted successfully');
        } catch (error) {
            message.error('Failed to delete custom field');
        }
    };

    const requiresOptions = (fieldType: string) => {
        return fieldType === 'SELECT' || fieldType === 'MULTI_SELECT';
    };

    return (
        <div>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Title level={4}>Custom Fields</Title>
                    {!showCreateForm && (
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => setShowCreateForm(true)}
                        >
                            Add Custom Field
                        </Button>
                    )}
                </div>

                {showCreateForm && (
                    <Card title="Create Custom Field" size="small">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreate}
                            initialValues={{ required: false, fieldType: 'TEXT' }}
                        >
                            <Form.Item
                                name="name"
                                label="Field Name"
                                rules={[{ required: true, message: 'Please enter field name' }]}
                            >
                                <Input placeholder="e.g., Story Points, Environment" />
                            </Form.Item>

                            <Form.Item
                                name="fieldType"
                                label="Field Type"
                                rules={[{ required: true }]}
                            >
                                <Select
                                    options={FIELD_TYPES}
                                    onChange={setSelectedFieldType}
                                    placeholder="Select field type"
                                />
                            </Form.Item>

                            <Form.Item name="description" label="Description">
                                <TextArea
                                    rows={2}
                                    placeholder="Optional description for this field"
                                />
                            </Form.Item>

                            {requiresOptions(selectedFieldType) && (
                                <Form.Item
                                    name="options"
                                    label="Options (comma-separated)"
                                    rules={[{ required: true, message: 'Please enter options' }]}
                                >
                                    <Input placeholder="e.g., Low, Medium, High" />
                                </Form.Item>
                            )}

                            <Form.Item name="defaultValue" label="Default Value">
                                <Input placeholder="Optional default value" />
                            </Form.Item>

                            <Form.Item name="required" label="Required" valuePropName="checked">
                                <Switch />
                            </Form.Item>

                            <Form.Item>
                                <Space>
                                    <Button type="primary" htmlType="submit">
                                        Create
                                    </Button>
                                    <Button onClick={() => {
                                        form.resetFields();
                                        setShowCreateForm(false);
                                    }}>
                                        Cancel
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                )}

                <Divider />

                <Space direction="vertical" style={{ width: '100%' }}>
                    {customFields.length === 0 ? (
                        <Card>
                            <Typography.Text type="secondary">
                                No custom fields defined. Click "Add Custom Field" to create one.
                            </Typography.Text>
                        </Card>
                    ) : (
                        customFields.map((field) => (
                            <Card
                                key={field.id}
                                size="small"
                                extra={
                                    <Button
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => handleDelete(field.id)}
                                    />
                                }
                            >
                                <Space direction="vertical" style={{ width: '100%' }}>
                                    <div>
                                        <strong>{field.name}</strong>
                                        {field.required && (
                                            <span style={{ color: 'red', marginLeft: 4 }}>*</span>
                                        )}
                                    </div>
                                    <Typography.Text type="secondary">
                                        Type: {FIELD_TYPES.find(t => t.value === field.fieldType)?.label}
                                    </Typography.Text>
                                    {field.description && (
                                        <Typography.Text type="secondary">
                                            {field.description}
                                        </Typography.Text>
                                    )}
                                    {field.options && (
                                        <Typography.Text type="secondary">
                                            Options: {field.options}
                                        </Typography.Text>
                                    )}
                                    {field.defaultValue && (
                                        <Typography.Text type="secondary">
                                            Default: {field.defaultValue}
                                        </Typography.Text>
                                    )}
                                </Space>
                            </Card>
                        ))
                    )}
                </Space>
            </Space>
        </div>
    );
};

export default CustomFieldEditor;
