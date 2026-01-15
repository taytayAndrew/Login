import React, { useState, useEffect } from 'react';
import { List, Card, Button, Space, Tag, Popconfirm, message, Modal, Input, Typography } from 'antd';
import { DownloadOutlined, DeleteOutlined, FileOutlined, EditOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Text } = Typography;
const { TextArea } = Input;

interface Attachment {
    id: number;
    fileName: string;
    fileSize: number;
    mimeType: string;
    description: string;
    uploadedBy: {
        id: number;
        username: string;
    };
    uploadedAt: string;
    version: number;
}

interface AttachmentListProps {
    taskId: string;
    onRefresh?: number;
}

const AttachmentList: React.FC<AttachmentListProps> = ({ taskId, onRefresh }) => {
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [editDescription, setEditDescription] = useState('');

    useEffect(() => {
        loadAttachments();
    }, [taskId, onRefresh]);

    const loadAttachments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/attachments/task/${taskId}`);
            setAttachments(response.data);
        } catch (error) {
            message.error('加载附件失败');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (attachment: Attachment) => {
        try {
            const response = await axios.get(`/api/v1/attachments/${attachment.id}/download`, {
                responseType: 'blob'
            });

            // 创建下载链接
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', attachment.fileName);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);

            message.success('下载成功');
        } catch (error: any) {
            message.error(error.response?.data?.message || '下载失败');
        }
    };

    const handleDelete = async (attachmentId: number) => {
        try {
            await axios.delete(`/api/v1/attachments/${attachmentId}`);
            message.success('附件已删除');
            loadAttachments();
        } catch (error: any) {
            message.error(error.response?.data?.message || '删除失败');
        }
    };

    const handleUpdateDescription = async (attachmentId: number) => {
        try {
            await axios.put(`/api/v1/attachments/${attachmentId}/description`, null, {
                params: { description: editDescription }
            });
            message.success('描述已更新');
            setEditingId(null);
            setEditDescription('');
            loadAttachments();
        } catch (error: any) {
            message.error(error.response?.data?.message || '更新失败');
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return '🖼️';
        if (mimeType.startsWith('video/')) return '🎥';
        if (mimeType.startsWith('audio/')) return '🎵';
        if (mimeType.includes('pdf')) return '📄';
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝';
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊';
        if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
        return '📎';
    };

    return (
        <Card title={`附件 (${attachments.length})`} size="small">
            <List
                loading={loading}
                dataSource={attachments}
                locale={{ emptyText: '暂无附件' }}
                renderItem={(attachment) => (
                    <List.Item
                        key={attachment.id}
                        actions={[
                            <Button
                                type="link"
                                icon={<DownloadOutlined />}
                                onClick={() => handleDownload(attachment)}
                            >
                                下载
                            </Button>,
                            <Button
                                type="link"
                                icon={<EditOutlined />}
                                onClick={() => {
                                    setEditingId(attachment.id);
                                    setEditDescription(attachment.description || '');
                                }}
                            >
                                编辑
                            </Button>,
                            <Popconfirm
                                title="确定要删除这个附件吗？"
                                onConfirm={() => handleDelete(attachment.id)}
                                okText="确定"
                                cancelText="取消"
                            >
                                <Button type="link" danger icon={<DeleteOutlined />}>
                                    删除
                                </Button>
                            </Popconfirm>
                        ]}
                    >
                        <List.Item.Meta
                            avatar={<span style={{ fontSize: 32 }}>{getFileIcon(attachment.mimeType)}</span>}
                            title={
                                <Space>
                                    <FileOutlined />
                                    <span>{attachment.fileName}</span>
                                    <Tag color="blue">v{attachment.version}</Tag>
                                </Space>
                            }
                            description={
                                <Space direction="vertical" size={0} style={{ width: '100%' }}>
                                    {editingId === attachment.id ? (
                                        <Space direction="vertical" style={{ width: '100%' }}>
                                            <TextArea
                                                value={editDescription}
                                                onChange={(e) => setEditDescription(e.target.value)}
                                                rows={2}
                                                maxLength={500}
                                            />
                                            <Space>
                                                <Button
                                                    type="primary"
                                                    size="small"
                                                    onClick={() => handleUpdateDescription(attachment.id)}
                                                >
                                                    保存
                                                </Button>
                                                <Button
                                                    size="small"
                                                    onClick={() => {
                                                        setEditingId(null);
                                                        setEditDescription('');
                                                    }}
                                                >
                                                    取消
                                                </Button>
                                            </Space>
                                        </Space>
                                    ) : (
                                        <>
                                            {attachment.description && (
                                                <Text type="secondary">{attachment.description}</Text>
                                            )}
                                            <Space size="large" style={{ fontSize: 12, color: '#999' }}>
                                                <span>大小: {formatFileSize(attachment.fileSize)}</span>
                                                <span>上传者: {attachment.uploadedBy.username}</span>
                                                <span>时间: {dayjs(attachment.uploadedAt).format('YYYY-MM-DD HH:mm')}</span>
                                            </Space>
                                        </>
                                    )}
                                </Space>
                            }
                        />
                    </List.Item>
                )}
            />
        </Card>
    );
};

export default AttachmentList;
