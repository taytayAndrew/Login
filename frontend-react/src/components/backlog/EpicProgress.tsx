import React from 'react';
import { Card, Progress, Statistic, Row, Col, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined, SyncOutlined } from '@ant-design/icons';

interface Epic {
  id: string;
  name: string;
  progress: number;
  tasks?: Task[];
}

interface Task {
  id: string;
  status: string;
}

interface EpicProgressProps {
  epic: Epic;
}

const EpicProgress: React.FC<EpicProgressProps> = ({ epic }) => {
  const tasks = epic.tasks || [];
  const completedTasks = tasks.filter(task => task.status === 'DONE').length;
  const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS').length;
  const todoTasks = tasks.filter(task => task.status === 'TODO').length;

  return (
    <Card title={`Epic Progress: ${epic.name}`} size="small">
      <div style={{ marginBottom: '24px' }}>
        <Progress
          percent={epic.progress}
          status={epic.progress === 100 ? 'success' : 'active'}
          strokeWidth={12}
        />
      </div>

      <Row gutter={16}>
        <Col span={8}>
          <Statistic
            title="Completed"
            value={completedTasks}
            suffix={`/ ${tasks.length}`}
            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
            valueStyle={{ color: '#52c41a' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="In Progress"
            value={inProgressTasks}
            prefix={<SyncOutlined spin style={{ color: '#1890ff' }} />}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col span={8}>
          <Statistic
            title="To Do"
            value={todoTasks}
            prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            valueStyle={{ color: '#faad14' }}
          />
        </Col>
      </Row>

      <div style={{ marginTop: '16px' }}>
        <Tag color="blue">Total Tasks: {tasks.length}</Tag>
        <Tag color={epic.progress === 100 ? 'success' : 'processing'}>
          {epic.progress}% Complete
        </Tag>
      </div>
    </Card>
  );
};

export default EpicProgress;
