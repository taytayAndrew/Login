# 📖 企业项目管理系统 - 完整使用指南

## 🎯 系统概述

这是一个功能完整的企业级项目管理系统，支持敏捷开发流程（Scrum/Kanban），包含以下核心功能：

### ✨ 核心功能模块

1. **工作空间管理** - 多租户隔离
2. **项目管理** - 项目创建、配置、归档
3. **任务管理** - 任务创建、分配、状态跟踪
4. **看板管理** - 可视化工作流
5. **迭代管理** - Sprint规划和执行
6. **Backlog管理** - 需求池和Epic管理
7. **协作功能** - 评论、@提醒、通知
8. **报表仪表板** - 燃尽图、速度图、任务分布
9. **时间跟踪** - 工时记录和统计
10. **里程碑管理** - 项目关键节点
11. **任务依赖** - 任务关系管理
12. **Webhook集成** - 第三方系统集成

---

## 🚀 第一步：启动系统

### 1. 启动后端

```bash
cd spring-boot-demo
mvn spring-boot:run
```

后端启动在：**http://localhost:8080**

### 2. 启动前端

```bash
cd frontend-react
npm install  # 首次运行
npm run dev
```

前端启动在：**http://localhost:5173**

### 3. 验证启动

- 访问 http://localhost:8080/swagger-ui.html 查看API文档
- 访问 http://localhost:5173 打开前端界面

---

## 👤 第二步：用户注册和登录

### 注册新用户

1. 打开前端页面 http://localhost:5173
2. 点击"注册"按钮
3. 填写信息：
   - 用户名：admin
   - 邮箱：admin@example.com
   - 密码：admin123
4. 点击"注册"

### 登录系统

1. 使用刚注册的账号登录
2. 系统会返回JWT Token
3. Token会自动保存在浏览器中

### API方式注册/登录

```bash
# 注册
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'

# 登录
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

---

## 🏢 第三步：创建工作空间

工作空间是多租户隔离的顶层容器，每个组织/团队有独立的工作空间。

### 通过前端创建

1. 登录后，点击"创建工作空间"
2. 填写信息：
   - 名称：我的团队
   - 标识符：my-team（唯一）
   - 描述：团队协作空间
3. 点击"创建"

### 通过API创建

```bash
curl -X POST http://localhost:8080/api/v1/workspaces \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "我的团队",
    "slug": "my-team",
    "description": "团队协作空间"
  }'
```

### 邀请成员

```bash
curl -X POST http://localhost:8080/api/v1/workspaces/{workspaceId}/members \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "userId": 2,
    "role": "MEMBER"
  }'
```

角色类型：
- `OWNER` - 所有者
- `ADMIN` - 管理员
- `MEMBER` - 普通成员
- `GUEST` - 访客

---

## 📁 第四步：创建项目

### 通过前端创建

1. 进入工作空间
2. 点击"新建项目"
3. 填写信息：
   - 项目名称：电商平台开发
   - 项目标识：ecommerce
   - 描述：在线购物平台
   - 项目类型：SCRUM
4. 点击"创建"

### 通过API创建

```bash
curl -X POST http://localhost:8080/api/v1/projects \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "电商平台开发",
    "key": "ECOM",
    "description": "在线购物平台",
    "workspaceId": 1,
    "projectType": "SCRUM"
  }'
```

项目类型：
- `SCRUM` - Scrum敏捷开发
- `KANBAN` - 看板方法
- `WATERFALL` - 瀑布模型

---

## 📝 第五步：创建任务

### 通过前端创建

1. 进入项目
2. 点击"新建任务"
3. 填写信息：
   - 标题：实现用户登录功能
   - 描述：支持邮箱和手机号登录
   - 任务类型：FEATURE
   - 优先级：HIGH
   - 预估工时：8小时
4. 分配给成员
5. 点击"创建"

### 通过API创建

```bash
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "实现用户登录功能",
    "description": "支持邮箱和手机号登录",
    "projectId": 1,
    "taskType": "FEATURE",
    "priority": "HIGH",
    "estimatedHours": 8,
    "assigneeId": 2
  }'
```

任务类型：
- `FEATURE` - 新功能
- `BUG` - 缺陷
- `IMPROVEMENT` - 改进
- `TASK` - 普通任务

优先级：
- `CRITICAL` - 紧急
- `HIGH` - 高
- `MEDIUM` - 中
- `LOW` - 低

---

## 📊 第六步：使用看板

### 查看看板

1. 进入项目
2. 点击"看板"标签
3. 看到默认列：待办、进行中、已完成

### 拖拽任务

1. 在看板上拖拽任务卡片
2. 任务状态自动更新
3. 系统记录状态变更历史

### 自定义看板列

```bash
# 创建自定义列
curl -X POST http://localhost:8080/api/v1/boards/{boardId}/columns \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "代码审查",
    "position": 2,
    "wipLimit": 5
  }'
```

WIP限制（Work In Progress）：限制该列最多容纳的任务数。

---

## 🏃 第七步：Sprint管理（Scrum项目）

### 创建Sprint

```bash
curl -X POST http://localhost:8080/api/v1/sprints \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sprint 1",
    "projectId": 1,
    "goal": "完成用户认证模块",
    "startDate": "2026-01-15",
    "endDate": "2026-01-29",
    "capacity": 80
  }'
```

### 添加任务到Sprint

```bash
curl -X POST http://localhost:8080/api/v1/sprints/{sprintId}/tasks/{taskId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 启动Sprint

```bash
curl -X POST http://localhost:8080/api/v1/sprints/{sprintId}/start \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 完成Sprint

```bash
curl -X POST http://localhost:8080/api/v1/sprints/{sprintId}/complete \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 📚 第八步：Backlog管理

### 创建Epic（史诗）

Epic是大型功能的集合，包含多个任务。

```bash
curl -X POST http://localhost:8080/api/v1/epics \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "用户管理模块",
    "description": "完整的用户管理功能",
    "projectId": 1,
    "color": "#1890ff"
  }'
```

### 将任务添加到Epic

```bash
curl -X POST http://localhost:8080/api/v1/epics/{epicId}/tasks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1
  }'
```

### 查看Backlog

```bash
curl -X GET http://localhost:8080/api/v1/projects/{projectId}/backlog \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Backlog优先级排序

```bash
curl -X POST http://localhost:8080/api/v1/backlog/reorder \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "newPosition": 0
  }'
```

---

## 💬 第九步：协作功能

### 添加评论

```bash
curl -X POST http://localhost:8080/api/v1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "content": "这个功能需要考虑安全性问题"
  }'
```

### @提醒用户

```bash
curl -X POST http://localhost:8080/api/v1/comments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "content": "@张三 请review这个任务",
    "mentionedUserIds": [2]
  }'
```

### 查看通知

```bash
# 获取未读通知
curl -X GET http://localhost:8080/api/v1/notifications/unread \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# 标记为已读
curl -X PUT http://localhost:8080/api/v1/notifications/{notificationId}/read \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

通知类型：
- `TASK_ASSIGNED` - 任务分配
- `TASK_UPDATED` - 任务更新
- `TASK_COMMENTED` - 任务评论
- `MENTIONED` - 被@提醒
- `SPRINT_STARTED` - Sprint开始
- `SPRINT_COMPLETED` - Sprint完成
- 等12种类型

---

## 📈 第十步：查看报表和仪表板

### 项目仪表板

```bash
curl -X GET http://localhost:8080/api/v1/reports/projects/{projectId}/dashboard \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

返回数据：
- 总任务数
- 已完成任务数
- 进行中任务数
- 逾期任务数
- 团队成员数
- 平均完成时间

### 燃尽图（Burndown Chart）

```bash
curl -X GET http://localhost:8080/api/v1/reports/sprints/{sprintId}/burndown \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

显示：
- 理想燃尽线
- 实际燃尽线
- 每日剩余工作量

### 速度图（Velocity Chart）

```bash
curl -X GET http://localhost:8080/api/v1/reports/projects/{projectId}/velocity?sprintCount=6 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

显示：
- 最近N个Sprint的完成速度
- 计划故事点 vs 实际完成故事点

### 任务分布图

```bash
curl -X GET http://localhost:8080/api/v1/reports/projects/{projectId}/task-distribution \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

显示：
- 按状态分布
- 按类型分布
- 按优先级分布
- 按成员分布

---

## ⏱️ 第十一步：时间跟踪

### 记录工时

```bash
curl -X POST http://localhost:8080/api/v1/time-entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 1,
    "hours": 4,
    "date": "2026-01-15",
    "description": "实现登录API"
  }'
```

### 查看任务工时

```bash
curl -X GET http://localhost:8080/api/v1/tasks/{taskId}/time-entries \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 查看用户工时统计

```bash
curl -X GET http://localhost:8080/api/v1/users/{userId}/time-entries?startDate=2026-01-01&endDate=2026-01-31 \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🎯 第十二步：里程碑管理

### 创建里程碑

```bash
curl -X POST http://localhost:8080/api/v1/milestones \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "MVP版本发布",
    "projectId": 1,
    "dueDate": "2026-03-01",
    "description": "最小可行产品"
  }'
```

### 关联任务到里程碑

```bash
curl -X PUT http://localhost:8080/api/v1/tasks/{taskId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "milestoneId": 1
  }'
```

### 查看里程碑进度

```bash
curl -X GET http://localhost:8080/api/v1/milestones/{milestoneId} \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔗 第十三步：任务依赖管理

### 创建任务依赖

```bash
curl -X POST http://localhost:8080/api/v1/task-dependencies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": 2,
    "dependsOnTaskId": 1,
    "dependencyType": "FINISH_TO_START"
  }'
```

依赖类型：
- `FINISH_TO_START` - 前置任务完成后才能开始
- `START_TO_START` - 前置任务开始后才能开始
- `FINISH_TO_FINISH` - 前置任务完成后才能完成
- `START_TO_FINISH` - 前置任务开始后才能完成

### 查看任务依赖关系

```bash
curl -X GET http://localhost:8080/api/v1/tasks/{taskId}/dependencies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

---

## 🔔 第十四步：Webhook集成

### 创建Webhook

```bash
curl -X POST http://localhost:8080/api/v1/webhooks \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Slack通知",
    "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
    "events": ["TASK_CREATED", "TASK_COMPLETED"],
    "projectId": 1,
    "secret": "your-secret-key"
  }'
```

支持的事件：
- `TASK_CREATED` - 任务创建
- `TASK_UPDATED` - 任务更新
- `TASK_COMPLETED` - 任务完成
- `TASK_DELETED` - 任务删除
- `SPRINT_STARTED` - Sprint开始
- `SPRINT_COMPLETED` - Sprint完成
- `COMMENT_ADDED` - 评论添加

### Webhook负载格式

```json
{
  "event": "TASK_CREATED",
  "timestamp": "2026-01-15T10:30:00Z",
  "data": {
    "taskId": 1,
    "title": "实现用户登录功能",
    "projectId": 1,
    "createdBy": "admin"
  }
}
```

---

## 🎨 前端界面导航

### 主要页面

1. **仪表板** (`/dashboard`)
   - 项目概览
   - 最近活动
   - 待办任务

2. **项目列表** (`/projects`)
   - 所有项目
   - 项目搜索和筛选

3. **项目详情** (`/projects/:id`)
   - 任务列表
   - 看板视图
   - Sprint管理
   - Backlog
   - 报表

4. **任务详情** (`/tasks/:id`)
   - 任务信息
   - 评论区
   - 工时记录
   - 附件列表

5. **团队管理** (`/team`)
   - 成员列表
   - 权限管理

6. **个人中心** (`/profile`)
   - 个人信息
   - 通知设置
   - 工时统计

---

## 🔐 权限说明

### 工作空间级别

| 角色 | 权限 |
|------|------|
| OWNER | 所有权限 |
| ADMIN | 管理项目、成员 |
| MEMBER | 创建任务、评论 |
| GUEST | 只读访问 |

### 项目级别

| 角色 | 权限 |
|------|------|
| PROJECT_LEAD | 项目所有权限 |
| DEVELOPER | 任务CRUD、评论 |
| VIEWER | 只读 |

---

## 📱 实时功能

系统支持WebSocket实时推送：

### 连接WebSocket

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8080', {
  auth: {
    token: 'YOUR_JWT_TOKEN'
  }
});

// 监听任务更新
socket.on('task:updated', (data) => {
  console.log('任务更新:', data);
});

// 监听新评论
socket.on('comment:added', (data) => {
  console.log('新评论:', data);
});

// 监听通知
socket.on('notification:new', (data) => {
  console.log('新通知:', data);
});
```

---

## 🎯 典型工作流程

### Scrum团队工作流

1. **Sprint规划会议**
   - 从Backlog选择任务
   - 创建新Sprint
   - 添加任务到Sprint
   - 设置Sprint目标

2. **每日站会**
   - 查看看板
   - 更新任务状态
   - 记录工时

3. **开发过程**
   - 拖拽任务到"进行中"
   - 添加评论和更新
   - @提醒相关人员
   - 记录工时

4. **Sprint评审**
   - 查看燃尽图
   - 统计完成情况
   - 完成Sprint

5. **Sprint回顾**
   - 查看速度图
   - 分析团队表现

### Kanban团队工作流

1. **持续流动**
   - 任务从Backlog进入看板
   - 遵守WIP限制
   - 持续交付

2. **优先级管理**
   - 定期整理Backlog
   - 调整任务优先级

3. **度量改进**
   - 监控周期时间
   - 优化流程

---

## 🛠️ 高级功能

### 批量操作

```bash
# 批量更新任务状态
curl -X PUT http://localhost:8080/api/v1/tasks/batch \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "taskIds": [1, 2, 3],
    "status": "IN_PROGRESS"
  }'
```

### 任务搜索

```bash
curl -X GET "http://localhost:8080/api/v1/tasks/search?q=登录&projectId=1&status=TODO" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### 导出数据

```bash
# 导出项目报表
curl -X GET http://localhost:8080/api/v1/reports/projects/{projectId}/export?format=excel \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  --output report.xlsx
```

---

## 📞 获取帮助

### API文档

访问 Swagger UI：http://localhost:8080/swagger-ui.html

### 健康检查

```bash
curl http://localhost:8080/actuator/health
```

### 日志查看

后端日志位置：`spring-boot-demo/logs/`

---

## 🎉 开始使用

现在你已经了解了系统的所有功能！建议按以下顺序开始：

1. ✅ 注册登录
2. ✅ 创建工作空间
3. ✅ 创建第一个项目
4. ✅ 添加几个任务
5. ✅ 在看板上拖拽任务
6. ✅ 创建Sprint（如果是Scrum项目）
7. ✅ 查看仪表板和报表

祝你使用愉快！🚀
