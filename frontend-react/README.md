# Spring Boot Demo - React 前端

这是一个基于 Vite + React + Ant Design 的前端项目，用于与 Spring Boot 后端进行交互。

## 🚀 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 启动开发服务器

```bash
npm run dev
```

前端将在 `http://localhost:5173` 运行（Vite 默认端口）

### 3. 确保后端服务运行

后端服务应该在 `http://localhost:8080` 运行

```bash
# 在 spring-boot-demo 目录下
cd ../spring-boot-demo
mvn spring-boot:run
```

## 📁 项目结构

```
src/
├── components/          # 公共组件
│   ├── Layout.jsx      # 布局组件
│   ├── ProtectedRoute.jsx  # 路由保护组件
│   └── ChangePasswordModal.jsx  # 修改密码模态框
├── config/             # 配置文件
│   └── api.js          # API 配置
├── contexts/           # React Context
│   └── AuthContext.jsx  # 认证上下文
├── pages/              # 页面组件
│   ├── Login.jsx       # 登录页面
│   ├── Register.jsx    # 注册页面
│   ├── Home.jsx       # 首页
│   ├── UserList.jsx   # 用户列表
│   └── UserDetail.jsx # 用户详情/编辑
├── services/           # API 服务
│   └── api.js          # API 封装
├── App.jsx             # 主应用组件
└── main.jsx            # 入口文件
```

## ✨ 功能特性

- ✅ 用户注册/登录
- ✅ Token 认证管理
- ✅ 用户列表展示
- ✅ 用户创建/编辑/删除
- ✅ 用户搜索功能
- ✅ 修改密码
- ✅ 路由保护
- ✅ 响应式设计

## 🛠️ 技术栈

- **React 19** - UI 框架
- **Vite** - 构建工具
- **React Router** - 路由管理
- **Ant Design** - UI 组件库
- **Axios** - HTTP 客户端

## 📝 API 配置

默认 API 地址：`http://localhost:8080`

如需修改，编辑 `src/config/api.js`：

```javascript
export const API_BASE_URL = 'http://your-backend-url:8080';
```

## 🐛 常见问题

### 1. CORS 错误

确保后端已配置 CORS，允许前端域名访问。

### 2. 无法连接后端

- 检查后端服务是否运行
- 检查 API_BASE_URL 配置是否正确
- 查看浏览器控制台错误信息

### 3. Token 失效

Token 失效后会自动跳转到登录页面。

## 📦 构建生产版本

```bash
npm run build
```

构建文件将输出到 `dist` 目录。

## 🎨 UI 预览

- 登录/注册页面：渐变背景，卡片式设计
- 主界面：侧边栏导航，顶部用户信息
- 用户管理：表格展示，搜索过滤，模态框操作

## 📄 License

MIT
