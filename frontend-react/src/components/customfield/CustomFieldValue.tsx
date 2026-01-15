import React, { useState, useEffect } from 'react';
import {
    Form,
    Input,
    InputNumber,
    DatePicker,
    Select,
    Checkbox,
    Space,
    Typography,
    message,
} from 'antd';
import dayjs from 'dayjs';
import axios from '@/services/axios';

const { TextArea } = Input;

interface CustomField {
    id: string;
    name: string;
    fieldType: string;
    description?: string;
    options?: string;
    required: boolean;
    defaultValue?: string;
}

interface CustomFieldValueProps {
    taskId: string;
    projectId: string;
    value?: Record<string, string>;
    onChange?: (values: Record<string, string>) => void;
    disabled?: boolean;
}

const CustomFieldValue: React.FC<CustomFieldValueProps> = ({
    taskId,
    projectId,
    value = {},
    onChange,
    disabled = false,
}) => {
    const [customFields, setCustomFields] = useState<CustomField[]>([]);
    const [loading, setLoading] = useState(false);
    const [fieldValues, setFieldValues] = useState<Record<string, string>>(value);

    useEffect(() => {
        loadCustomFields();
        if (taskId) {
            loadFieldValues();
        }
    }, [projectId, taskId]);

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

    const loadFieldValues = async () => {
        try {
            const response = await axios.get(`/api/v1/custom-fields/values/task/${taskId}`);
            setFieldValues(response.data);
        } catch (error) {
            console.error('Failed to load field values:', error);
        }
    };

    const handleFieldChange = async (fieldId: string, newValue: any) => {
        const stringValue = convertToString(newValue);

        try {
            await axios.post('/api/v1/custom-fields/values', {
                taskId,
                customFieldId: fieldId,
                value: stringValue,
            });

            const updatedValues = { ...fieldValues, [fieldId]: stringValue };
            setFieldValues(updatedValues);

            if (onChange) {
                onChange(updatedValues);
            }
        } catch (error: any) {
            message.error(error.response?.data?.message || 'Failed to update field value');
        }
    };

    const convertToString = (value: any): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'boolean') return value.toString();
        if (dayjs.isDayjs(value)) return value.format('YYYY-MM-DD');
        if (Array.isArray(value)) return value.join(',');
        return String(value);
    };

    const renderField = (field: CustomField) => {
        const currentValue = fieldValues[field.id] || field.defaultValue || '';

        switch (field.fieldType) {
            case 'TEXT':
                return (
                    <Input
                        placeholder={`Enter ${field.name}`}
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        disabled={disabled}
                    />
                );

            case 'TEXTAREA':
                return (
                    <TextArea
                        rows={3}
                        placeholder={`Enter ${field.name}`}
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        disabled={disabled}
                    />
                );

            case 'NUMBER':
                return (
                    <InputNumber
                        style={{ width: '100%' }}
                        placeholder={`Enter ${field.name}`}
                        value={currentValue ? parseFloat(currentValue) : undefined}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        disabled={disabled}
                    />
                );

            case 'DATE':
                return (
                    <DatePicker
                        style={{ width: '100%' }}
                        value={currentValue ? dayjs(currentValue) : undefined}
                        onChange={(date) => handleFieldChange(field.id, date)}
                        disabled={disabled}
                    />
                );

            case 'DATETIME':
                return (
                    <DatePicker
                        showTime
                        style={{ width: '100%' }}
                        value={currentValue ? dayjs(currentValue) : undefined}
                        onChange={(date) => handleFieldChange(field.id, date)}
                        disabled={disabled}
                    />
                );

            case 'SELECT':
                const selectOptions = field.options?.split(',').map(opt => ({
                    label: opt.trim(),
                    value: opt.trim(),
                })) || [];
                return (
                    <Select
                        style={{ width: '100%' }}
                        placeholder={`Select ${field.name}`}
                        value={currentValue || undefined}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        options={selectOptions}
                        disabled={disabled}
                    />
                );

            case 'MULTI_SELECT':
                const multiSelectOptions = field.options?.split(',').map(opt => ({
                    label: opt.trim(),
                    value: opt.trim(),
                })) || [];
                return (
                    <Select
                        mode="multiple"
                        style={{ width: '100%' }}
                        placeholder={`Select ${field.name}`}
                        value={currentValue ? currentValue.split(',') : []}
                        onChange={(val) => handleFieldChange(field.id, val)}
                        options={multiSelectOptions}
                        disabled={disabled}
                    />
                );

            case 'CHECKBOX':
                return (
                    <Checkbox
                        checked={currentValue === 'true'}
                        onChange={(e) => handleFieldChange(field.id, e.target.checked)}
                        disabled={disabled}
                    >
                        {field.description || field.name}
                    </Checkbox>
                );

            case 'URL':
                return (
                    <Input
                        type="url"
                        placeholder={`Enter ${field.name}`}
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        disabled={disabled}
                    />
                );

            case 'EMAIL':
                return (
                    <Input
                        type="email"
                        placeholder={`Enter ${field.name}`}
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        disabled={disabled}
                    />
                );

            default:
                return (
                    <Input
                        placeholder={`Enter ${field.name}`}
                        value={currentValue}
                        onChange={(e) => handleFieldChange(field.id, e.target.value)}
                        disabled={disabled}
                    />
                );
        }
    };

    if (customFields.length === 0) {
        return null;
    }

    return (
        <Space direction="vertical" style={{ width: '100%' }} size="middle">
            <Typography.Title level={5}>Custom Fields</Typography.Title>
            {customFields.map((field) => (
                <Form.Item
                    key={field.id}
                    label={
                        <span>
                            {field.name}
                            {field.required && <span style={{ color: 'red', marginLeft: 4 }}>*</span>}
                        </span>
                    }
                    help={field.description}
                >
                    {renderField(field)}
                </Form.Item>
            ))}
        </Space>
    );
};

export default CustomFieldValue;
