# 企业项目管理系统 - 前端应用

## 项目简介

这是企业项目管理系统的前端应用，使用React 19和TypeScript构建，提供直观的用户界面和流畅的交互体验。

## 技术栈

- **框架**: React 19
- **语言**: TypeScript
- **UI库**: Ant Design 5.x
- **状态管理**: Zustand
- **数据获取**: React Query (TanStack Query)
- **HTTP客户端**: Axios
- **图表库**: ECharts
- **拖拽**: @dnd-kit
- **构建工具**: Vite
- **包管理器**: npm / yarn

## 核心功能

### 项目管理
- ✅ 工作区和项目管理
- ✅ 多方法论支持（Scrum/Kanban/Waterfall）
- ✅ 项目仪表板

### 任务管理
- ✅ 任务列表和详情
- ✅ 任务创建和编辑
- ✅ 标签和自定义字段
- ✅ 任务搜索和过滤

### 看板视图
- ✅ 拖拽式看板
- ✅ WIP限制
- ✅ 泳道分组
- ✅ 实时更新

### Sprint管理
- ✅ Sprint规划
- ✅ Sprint看板
- ✅ 燃尽图
- ✅ 速度图

### 协作功能
- ✅ 评论系统
- ✅ @提及通知
- ✅ 附件上传
- ✅ 实时通知

### 数据可视化
- ✅ 项目仪表板
- ✅ 燃尽图
- ✅ 速度图
- ✅ 任务分布图
- ✅ 工作量趋势图

### 时间管理
- ✅ 计时器组件
- ✅ 工时表
- ✅ 资源分配视图

### 路线图
- ✅ 时间线视图
- ✅ 甘特图
- ✅ 依赖关系图

## 快速开始

### 环境要求

- Node.js 18+ 
- npm 9+ 或 yarn 1.22+

### 安装依赖

使用npm：
```bash
npm install
```

使用yarn：
```bash
yarn install
```

### 开发环境

启动开发服务器：
```bash
npm run dev
# 或
yarn dev
```

应用将在 http://localhost:3000 启动

### 生产构建

构建生产版本：
```bash
npm run build
# 或
yarn build
```

预览生产构建：
```bash
npm run preview
# 或
yarn preview
```

## 项目结构

```
frontend-react/
├── public/                  # 静态资源
├── src/
│   ├── components/         # React组件
│   │   ├── task/          # 任务相关组件
│   │   ├── board/         # 看板组件
│   │   ├── sprint/        # Sprint组件
│   │   ├── backlog/       # Backlog组件
│   │   ├── comment/       # 评论组件
│   │   ├── notification/  # 通知组件
│   │   ├── dashboard/     # 仪表板组件
│   │   ├── time-tracking/ # 时间跟踪组件
│   │   ├── roadmap/       # 路线图组件
│   │   └── attachment/    # 附件组件
│   ├── pages/             # 页面组件
│   ├── hooks/             # 自定义Hooks
│   ├── services/          # API服务
│   ├── store/             # 状态管理
│   ├── types/             # TypeScript类型
│   ├── utils/             # 工具函数
│   ├── App.tsx            # 根组件
│   └── main.tsx           # 入口文件
├── .env.development       # 开发环境变量
├── .env.production        # 生产环境变量
├── package.json
├── tsconfig.json
├── vite.config.js
└── README.md
```

## 环境配置

### 开发环境 (.env.development)

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
VITE_WS_URL=ws://localhost:8080/ws
```

### 生产环境 (.env.production)

```env
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_WS_URL=wss://api.yourdomain.com/ws
```

## 主要依赖

### 核心依赖
```json
{
  "react": "^19.0.0",
  "react-dom": "^19.0.0",
  "typescript": "^5.0.0",
  "antd": "^5.0.0",
  "axios": "^1.6.0",
  "@tanstack/react-query": "^5.0.0",
  "zustand": "^4.4.0"
}
```

### 可视化和交互
```json
{
  "echarts": "^5.4.0",
  "echarts-for-react": "^3.0.0",
  "@dnd-kit/core": "^6.0.0",
  "@dnd-kit/sortable": "^7.0.0"
}
```

### 工具库
```json
{
  "dayjs": "^1.11.0",
  "lodash": "^4.17.0"
}
```

## 代码规范

### ESLint配置

项目使用ESLint进行代码检查：
```bash
npm run lint
# 或
yarn lint
```

### Prettier配置

代码格式化：
```bash
npm run format
# 或
yarn format
```

## 组件使用示例

### 任务列表
```tsx
import TaskList from './components/task/TaskList';

<TaskList projectId={projectId} />
```

### 看板视图
```tsx
import BoardView from './components/board/BoardView';

<BoardView boardId={boardId} />
```

### 计时器
```tsx
import TimerWidget from './components/time-tracking/TimerWidget';

<TimerWidget userId={userId} availableTasks={tasks} />
```

### 燃尽图
```tsx
import BurndownChart from './components/dashboard/BurndownChart';

<BurndownChart sprintId={sprintId} />
```

## API集成

### Axios配置

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
});

// 请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // 处理未授权
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### React Query使用

```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['tasks', projectId],
  queryFn: () => fetchTasks(projectId),
});
```

## 状态管理

### Zustand Store示例

```typescript
import { create } from 'zustand';

interface UserStore {
  user: User | null;
  setUser: (user: User) => void;
  logout: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  logout: () => set({ user: null }),
}));
```

## 性能优化

### 代码分割
```typescript
import { lazy, Suspense } from 'react';

const Dashboard = lazy(() => import('./pages/Dashboard'));

<Suspense fallback={<Loading />}>
  <Dashboard />
</Suspense>
```

### 图片懒加载
```typescript
<img loading="lazy" src={imageUrl} alt="description" />
```

### React.memo
```typescript
const TaskCard = React.memo(({ task }) => {
  return <div>{task.title}</div>;
});
```

## 测试

运行测试：
```bash
npm run test
# 或
yarn test
```

## 部署

### 构建优化

1. 启用生产模式
2. 代码压缩
3. Tree shaking
4. 资源优化

### Nginx配置示例

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    root /var/www/project-management;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 浏览器支持

- Chrome (最新版)
- Firefox (最新版)
- Safari (最新版)
- Edge (最新版)

## 故障排查

### 常见问题

1. **API请求失败**
   - 检查后端服务是否运行
   - 验证API地址配置
   - 检查CORS设置

2. **组件不渲染**
   - 检查控制台错误
   - 验证数据格式
   - 检查组件props

3. **样式问题**
   - 清除浏览器缓存
   - 检查CSS导入
   - 验证Ant Design版本

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 更新日志

### v1.0.0 (2024-01-15)
- ✅ 初始版本发布
- ✅ 完整的UI组件库
- ✅ 响应式设计
- ✅ 数据可视化
- ✅ 实时更新
