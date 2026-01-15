# 🚀 快速启动指南

## 📋 前置要求

在启动系统之前，请确保已安装：

### 必需组件
1. ✅ **JDK 17+** - Java开发环境
2. ✅ **Maven 3.6+** - 项目构建工具
3. ✅ **MySQL 8.0+** - 数据库
4. ✅ **Node.js 18+** - 前端运行环境
5. ✅ **npm 或 yarn** - 前端包管理器

### 可选组件（系统会自动降级）
- Redis（缓存，可选）
- Elasticsearch（搜索，可选）
- RabbitMQ（消息队列，可选）
- MinIO（文件存储，可选）

## 🔧 第一步：准备数据库

### 1. 启动MySQL

确保MySQL服务正在运行：
```bash
# Windows
net start MySQL80

# Linux/Mac
sudo systemctl start mysql
# 或
sudo service mysql start
```

### 2. 创建数据库

```sql
-- 登录MySQL
mysql -u root -p

-- 创建数据库
CREATE DATABASE demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 验证
SHOW DATABASES;
USE demo;
```

### 3. 检查配置

编辑 `spring-boot-demo/src/main/resources/application-dev.properties`：

```properties
# 确认数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/demo?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC&characterEncoding=utf-8
spring.datasource.username=root
spring.datasource.password=你的MySQL密码
```

## 🚀 第二步：启动后端

### 方式1：使用Maven（推荐）

```bash
# 进入后端目录
cd spring-boot-demo

# 清理并编译（首次运行）
mvn clean install -DskipTests

# 启动应用
mvn spring-boot:run
```

### 方式2：使用IDE

1. 用IntelliJ IDEA或Eclipse打开 `spring-boot-demo` 项目
2. 找到 `src/main/java/org/example/SpringBootDemoApplication.java`
3. 右键 → Run 'SpringBootDemoApplication'

### 验证后端启动成功

看到以下日志表示启动成功：
```
Started SpringBootDemoApplication in X.XXX seconds
```

访问：
- **API地址**：http://localhost:8080
- **Swagger文档**：http://localhost:8080/swagger-ui.html
- **健康检查**：http://localhost:8080/actuator/health

## 🎨 第三步：启动前端

### 1. 安装依赖

```bash
# 进入前端目录
cd frontend-react

# 安装依赖（首次运行）
npm install
# 或使用yarn
yarn install
```

### 2. 安装额外依赖

```bash
# 安装图表库
npm install echarts echarts-for-react

# 安装拖拽库
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# 安装日期库
npm install dayjs
```

### 3. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

### 验证前端启动成功

看到以下信息：
```
VITE v5.x.x  ready in XXX ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

访问：http://localhost:5173

## ✅ 第四步：验证系统

### 1. 检查后端API

打开浏览器访问：http://localhost:8080/swagger-ui.html

应该能看到完整的API文档。

### 2. 检查前端页面

打开浏览器访问：http://localhost:5173

应该能看到登录页面。

### 3. 测试注册和登录

#### 注册新用户
```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "admin123"
  }'
```

#### 登录
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

成功后会返回JWT token。

## 🐛 常见问题

### 问题1：数据库连接失败

**错误信息**：`Communications link failure`

**解决方案**：
1. 确认MySQL正在运行
2. 检查数据库名称、用户名、密码
3. 确认端口3306未被占用

### 问题2：端口被占用

**错误信息**：`Port 8080 is already in use`

**解决方案**：
```bash
# Windows - 查找占用端口的进程
netstat -ano | findstr :8080
taskkill /PID <进程ID> /F

# Linux/Mac
lsof -i :8080
kill -9 <进程ID>
```

或修改端口：
```properties
# application-dev.properties
server.port=8081
```

### 问题3：前端无法连接后端

**解决方案**：
1. 确认后端已启动（http://localhost:8080/actuator/health）
2. 检查CORS配置
3. 检查前端API配置文件

### 问题4：Flyway迁移失败

**错误信息**：`Flyway migration failed`

**解决方案**：
```sql
-- 清空数据库重新开始
DROP DATABASE demo;
CREATE DATABASE demo CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

### 问题5：Redis连接失败（可选）

**解决方案**：
系统会自动降级，不影响核心功能。如需使用Redis：
```bash
# Windows - 启动Redis
redis-server

# Linux/Mac
sudo systemctl start redis
```

## 📝 启动检查清单

- [ ] MySQL已启动并创建了demo数据库
- [ ] 后端配置文件中的数据库密码正确
- [ ] 后端成功启动（http://localhost:8080/swagger-ui.html 可访问）
- [ ] 前端依赖已安装
- [ ] 前端成功启动（http://localhost:5173 可访问）
- [ ] 可以成功注册和登录

## 🎉 启动成功！

如果所有步骤都完成，您现在可以：
1. 访问前端：http://localhost:5173
2. 查看API文档：http://localhost:8080/swagger-ui.html
3. 开始使用系统！

继续阅读 `USER_GUIDE.md` 了解如何使用系统。
