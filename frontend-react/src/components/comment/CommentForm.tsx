import React, { useState } from 'react';
import { Input, Button, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import axios from '../../services/axios';

const { TextArea } = Input;

interface CommentFormProps {
    taskId: string;
    onCommentAdded: () => void;
}

const CommentForm: React.FC<CommentFormProps> = ({ taskId, onCommentAdded }) => {
    const [content, setContent] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!content.trim()) {
            message.warning('Please enter a comment');
            return;
        }

        setSubmitting(true);
        try {
            await axios.post(`/api/v1/tasks/${taskId}/comments`, { content });
            message.success('Comment added');
            setContent('');
            onCommentAdded();
        } catch (error) {
            message.error('Failed to add comment');
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
            handleSubmit();
        }
    };

    return (
        <div style={{ marginBottom: '16px' }}>
            <TextArea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a comment... (Ctrl+Enter to submit, use @[userId] to mention)"
                autoSize={{ minRows: 2, maxRows: 6 }}
                style={{ marginBottom: '8px' }}
            />
            <div style={{ textAlign: 'right' }}>
                <Button
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleSubmit}
                    loading={submitting}
                    disabled={!content.trim()}
                >
                    Comment
                </Button>
            </div>
        </div>
    );
};

export default CommentForm;
