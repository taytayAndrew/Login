import React, { useState } from 'react';
import { Modal, Card, Row, Col, Button, Space, Typography, Avatar, List, message } from 'antd';
import { TrophyOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

interface EstimationPokerProps {
    visible: boolean;
    task: any;
    participants: any[];
    onClose: () => void;
    onEstimate: (storyPoints: number) => void;
}

const fibonacciSequence = [0, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89];

const EstimationPoker: React.FC<EstimationPokerProps> = ({
    visible,
    task,
    participants,
    onClose,
    onEstimate,
}) => {
    const [selectedValue, setSelectedValue] = useState<number | null>(null);
    const [revealed, setRevealed] = useState(false);
    const [votes, setVotes] = useState<Record<string, number>>({});

    const handleVote = (value: number) => {
        setSelectedValue(value);
        // In a real implementation, this would send the vote to the server
        setVotes({ ...votes, currentUser: value });
    };

    const handleReveal = () => {
        setRevealed(true);
    };

    const handleReset = () => {
        setSelectedValue(null);
        setRevealed(false);
        setVotes({});
    };

    const handleConfirm = () => {
        if (selectedValue !== null) {
            onEstimate(selectedValue);
            message.success(`Task estimated at ${selectedValue} story points`);
            handleReset();
            onClose();
        }
    };

    const calculateAverage = () => {
        const values = Object.values(votes);
        if (values.length === 0) return 0;
        return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    };

    return (
        <Modal
            title="Planning Poker - Estimation Session"
            open={visible}
            onCancel={onClose}
            width={800}
            footer={[
                <Button key="reset" onClick={handleReset}>
                    Reset
                </Button>,
                <Button key="reveal" type="primary" onClick={handleReveal} disabled={revealed}>
                    Reveal Cards
                </Button>,
                <Button key="confirm" type="primary" onClick={handleConfirm} disabled={!revealed}>
                    Confirm Estimate
                </Button>,
            ]}
        >
            <Space direction="vertical" style={{ width: '100%' }} size="large">
                {/* Task Info */}
                <Card size="small">
                    <Title level={5}>{task?.identifier}: {task?.title}</Title>
                    {task?.description && <Text type="secondary">{task.description}</Text>}
                </Card>

                {/* Voting Cards */}
                <div>
                    <Title level={5}>Select Your Estimate:</Title>
                    <Row gutter={[8, 8]}>
                        {fibonacciSequence.map((value) => (
                            <Col key={value} span={4}>
                                <Card
                                    hoverable
                                    onClick={() => handleVote(value)}
                                    style={{
                                        textAlign: 'center',
                                        backgroundColor: selectedValue === value ? '#1890ff' : '#fff',
                                        color: selectedValue === value ? '#fff' : '#000',
                                        cursor: 'pointer',
                                        border: selectedValue === value ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                    }}
                                >
                                    <Title level={3} style={{ margin: 0, color: selectedValue === value ? '#fff' : '#000' }}>
                                        {value}
                                    </Title>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </div>

                {/* Participants */}
                <div>
                    <Title level={5}>Participants:</Title>
                    <List
                        dataSource={participants}
                        renderItem={(participant: any) => (
                            <List.Item>
                                <Space>
                                    <Avatar src={participant.avatar}>{participant.username?.[0]?.toUpperCase()}</Avatar>
                                    <Text>{participant.username}</Text>
                                    {revealed && votes[participant.id] !== undefined && (
                                        <Card size="small" style={{ minWidth: '50px', textAlign: 'center' }}>
                                            <Text strong>{votes[participant.id]}</Text>
                                        </Card>
                                    )}
                                    {!revealed && votes[participant.id] !== undefined && (
                                        <Card size="small" style={{ minWidth: '50px', textAlign: 'center', backgroundColor: '#52c41a' }}>
                                            <Text style={{ color: '#fff' }}>✓</Text>
                                        </Card>
                                    )}
                                </Space>
                            </List.Item>
                        )}
                    />
                </div>

                {/* Results */}
                {revealed && Object.keys(votes).length > 0 && (
                    <Card>
                        <Space direction="vertical" style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Text strong>Average Estimate:</Text>
                                <Title level={3} style={{ margin: 0 }}>
                                    <TrophyOutlined style={{ color: '#faad14' }} /> {calculateAverage()} SP
                                </Title>
                            </div>
                            <Text type="secondary">
                                Range: {Math.min(...Object.values(votes))} - {Math.max(...Object.values(votes))} story points
                            </Text>
                        </Space>
                    </Card>
                )}
            </Space>
        </Modal>
    );
};

export default EstimationPoker;
