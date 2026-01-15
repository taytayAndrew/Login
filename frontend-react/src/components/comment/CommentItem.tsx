import React, { useState } from 'react';
import { Comment, Avatar, Tooltip, Button, Input, message, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import axios from '../../services/axios';

dayjs.extend(relativeTime);

const { TextArea } = Input;

interface CommentItemProps {
    comment: any;
    onUpdate: () => void;
    onDelete: (commentId: string) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, onUpdate, onDelete }) => {
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(comment.content);
    const [saving, setSaving] = useState(false);

    const handleEdit = () => {
        setEditing(true);
        setEditContent(comment.content);
    };

    const handleCancelEdit = () => {
        setEditing(false);
        setEditContent(comment.content);
    };

    const handleSave = async () => {
        if (!editContent.trim()) {
            message.warning('Comment cannot be empty');
            return;
        }

        setSaving(true);
        try {
            await axios.put(`/api/v1/comments/${comment.id}`, { content: editContent });
            message.success('Comment updated');
            setEditing(false);
            onUpdate();
        } catch (error) {
            message.error('Failed to update comment');
            console.error('Error updating comment:', error);
        } finally {
            setSaving(false);
        }
    };

    const actions = [
        <Tooltip title="Edit">
            <Button
                type="text"
                size="small"
                icon={<EditOutlined />}
                onClick={handleEdit}
            />
        </Tooltip>,
        <Popconfirm
            title="Delete comment?"
            onConfirm={() => onDelete(comment.id)}
            okText="Yes"
            cancelText="No"
        >
            <Tooltip title="Delete">
                <Button
                    type="text"
                    size="small"
                    icon={<DeleteOutlined />}
                    danger
                />
            </Tooltip>
        </Popconfirm>,
    ];

    const editActions = [
        <Button
            type="primary"
            size="small"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={saving}
        >
            Save
        </Button>,
        <Button
            size="small"
            icon={<CloseOutlined />}
            onClick={handleCancelEdit}
        >
            Cancel
        </Button>,
    ];

    return (
        <Comment
            author={<span>{comment.author.username}</span>}
            avatar={
                <Avatar src={comment.author.avatar}>
                    {comment.author.username?.[0]?.toUpperCase()}
                </Avatar>
            }
            content={
                editing ? (
                    <TextArea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        autoSize={{ minRows: 2, maxRows: 6 }}
                    />
                ) : (
                    <div>
                        <p style={{ whiteSpace: 'pre-wrap' }}>{comment.content}</p>
                        {comment.edited && (
                            <span style={{ fontSize: '12px', color: '#999' }}>(edited)</span>
                        )}
                    </div>
                )
            }
            datetime={
                <Tooltip title={dayjs(comment.createdAt).format('YYYY-MM-DD HH:mm:ss')}>
                    <span>{dayjs(comment.createdAt).fromNow()}</span>
                </Tooltip>
            }
            actions={editing ? editActions : actions}
        />
    );
};

export default CommentItem;
