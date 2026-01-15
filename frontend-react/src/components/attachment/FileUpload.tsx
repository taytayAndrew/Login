import React, { useState } from 'react';
import { Upload, Button, message, Input, Modal, Form } from 'antd';
import { UploadOutlined, InboxOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import axios from 'axios';

const { Dragger } = Upload;
const { TextArea } = Input;

interface FileUploadProps {
    taskId: string;
    userId: number;
    onUploadSuccess?: () => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ taskId, userId, onUploadSuccess }) => {
    const [uploading, setUploading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [form] = Form.useForm();

    const handleUpload = async (values: any) => {
        if (!selectedFile) {
            message.error('请选择文件');
            return;
        }

        const formData = new FormData();
        formData.append('file', selectedFile);

        setUploading(true);
        try {
            await axios.post('/api/v1/attachments/upload', formData, {
                params: {
                    taskId,
                    userId,
                    description: values.description
                },
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            message.success('文件上传成功');
            setIsModalVisible(false);
            setSelectedFile(null);
            form.resetFields();
            onUploadSuccess?.();
        } catch (error: any) {
            message.error(error.response?.data?.message || '上传失败');
        } finally {
            setUploading(false);
        }
    };

    const uploadProps: UploadProps = {
        beforeUpload: (file) => {
            // 检查文件大小（10MB）
            const isLt10M = file.size / 1024 / 1024 < 10;
            if (!isLt10M) {
                message.error('文件大小不能超过10MB');
                return false;
            }

            setSelectedFile(file);
            setIsModalVisible(true);
            return false; // 阻止自动上传
        },
        showUploadList: false,
        multiple: false
    };

    return (
        <>
            <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
                <p className="ant-upload-hint">
                    支持单个文件上传，文件大小不超过10MB
                </p>
            </Dragger>

            <Modal
                title="上传文件"
                open={isModalVisible}
                onOk={() => form.submit()}
                onCancel={() => {
                    setIsModalVisible(false);
                    setSelectedFile(null);
                    form.resetFields();
                }}
                confirmLoading={uploading}
                okText="上传"
                cancelText="取消"
            >
                <Form form={form} layout="vertical" onFinish={handleUpload}>
                    <Form.Item label="文件">
                        <div style={{ padding: '8px 12px', background: '#f5f5f5', borderRadius: 4 }}>
                            {selectedFile?.name}
                        </div>
                    </Form.Item>

                    <Form.Item
                        name="description"
                        label="描述"
                        rules={[{ max: 500, message: '描述不能超过500字符' }]}
                    >
                        <TextArea
                            rows={3}
                            placeholder="添加文件描述（可选）"
                            maxLength={500}
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </>
    );
};

export default FileUpload;
