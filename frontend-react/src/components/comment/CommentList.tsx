import React, { useState, useEffect } from 'react';
import { List, Spin, Empty, message } from 'antd';
import axios from '../../services/axios';
import CommentItem from './CommentItem';
import CommentForm from './CommentForm';

interface Comment {
    id: string;
    content: string;
    author: {
        id: number;
        username: string;
        avatar?: string;
    };
    mentionedUsers?: any[];
    edited: boolean;
    createdAt: string;
    updatedAt: string;
}

interface CommentListProps {
    taskId: string;
}

const CommentList: React.FC<CommentListProps> = ({ taskId }) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchComments();
    }, [taskId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await axios.get(`/api/v1/tasks/${taskId}/comments`);
            if (response.data.success) {
                setComments(response.data.data);
            }
        } catch (error) {
            message.error('Failed to load comments');
            console.error('Error fetching comments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCommentAdded = () => {
        fetchComments();
    };

    const handleCommentUpdated = () => {
        fetchComments();
    };

    const handleCommentDeleted = async (commentId: string) => {
        try {
            await axios.delete(`/api/v1/comments/${commentId}`);
            message.success('Comment deleted');
            fetchComments();
        } catch (error) {
            message.error('Failed to delete comment');
            console.error('Error deleting comment:', error);
        }
    };

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '20px' }}>
                <Spin />
            </div>
        );
    }

    return (
        <div>
            <CommentForm taskId={taskId} onCommentAdded={handleCommentAdded} />

            {comments.length === 0 ? (
                <Empty description="No comments yet" style={{ marginTop: '20px' }} />
            ) : (
                <List
                    dataSource={comments}
                    renderItem={(comment) => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            onUpdate={handleCommentUpdated}
                            onDelete={handleCommentDeleted}
                        />
                    )}
                    style={{ marginTop: '16px' }}
                />
            )}
        </div>
    );
};

export default CommentList;
