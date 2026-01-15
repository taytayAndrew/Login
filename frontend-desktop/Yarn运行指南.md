# 🚀 Tauri 桌面应用运行指南 (Yarn 版本)

## 📋 运行步骤

### 第一步：检查环境 ✅

你的环境已经准备好了：
- ✅ Node.js v22.12.0
- ✅ Yarn v1.22.22  
- ✅ Rust v1.91.1
- ✅ Cargo v1.91.1

### 第二步：安装 Tauri CLI

```bash
# 全局安装 Tauri CLI
yarn global add @tauri-apps/cli

# 验证安装
tauri --version
```

### 第三步：进入项目目录并安装依赖

```bash
# 进入桌面应用目录
cd frontend-desktop

# 安装依赖
yarn install
```

### 第四步：启动后端服务

```bash
# 在新的终端窗口中，进入后端目录
cd spring-boot-demo

# 启动 Spring Boot 服务
mvn spring-boot:run
```

**等待后端启动完成，看到类似信息：**
```
Started SpringBootDemoApplication in 3.456 seconds (JVM running for 4.123)
```

### 第五步：启动桌面应用

```bash
# 回到桌面应用目录
cd frontend-desktop

# 启动开发模式
yarn tauri:dev
```

## 🎯 一键运行方案

### 方案1：使用自动化脚本

```bash
# Windows 用户
./setup.bat        # 首次运行，配置环境
./快速运行.bat      # 日常开发，快速启动
```

### 方案2：手动命令

```bash
# 终端1：启动后端
cd spring-boot-demo
mvn spring-boot:run

# 终端2：启动桌面应用
cd frontend-desktop
yarn tauri:dev
```

## 📱 应用功能

启动成功后，你将看到：

1. **登录界面**
   - 默认账号：admin / 123456
   - 现代化的登录表单

2. **主界面**
   - Dashboard：系统概览
   - 用户管理：CRUD 操作
   - 设置：应用配置

3. **桌面功能**
   - 系统通知
   - 离线缓存
   - 网络状态监控

## 🛠️ 开发命令

```bash
# 开发模式（热重载）
yarn tauri:dev

# 构建生产版本
yarn tauri:build

# 仅启动前端开发服务器
yarn dev

# 构建前端
yarn build
```

## 🔧 故障排除

### 问题1：Tauri CLI 未找到

```bash
# 解决方案
yarn global add @tauri-apps/cli
# 或者
npm install -g @tauri-apps/cli
```

### 问题2：Rust 编译错误

```bash
# 更新 Rust
rustup update

# 清理缓存
cd src-tauri
cargo clean
cd ..
yarn tauri:dev
```

### 问题3：后端连接失败

检查：
- Spring Boot 是否在 localhost:8080 运行
- 防火墙设置
- 网络连接

### 问题4：依赖安装失败

```bash
# 清理缓存
yarn cache clean

# 删除 node_modules 重新安装
rm -rf node_modules yarn.lock
yarn install
```

## 📊 性能优化

### 开发模式优化
- 使用 `yarn tauri:dev` 而不是分别启动
- 启用热重载功能
- 使用浏览器开发者工具调试

### 构建优化
- 生产构建：`yarn tauri:build`
- 体积优化：约 10MB 安装包
- 启动速度：< 2 秒

## 🎨 自定义配置

### 修改窗口大小
编辑 `src-tauri/tauri.conf.json`：
```json
{
  "tauri": {
    "windows": [{
      "width": 1400,
      "height": 900
    }]
  }
}
```

### 修改应用图标
替换 `src-tauri/icons/` 目录下的图标文件

### 修改应用名称
编辑 `src-tauri/tauri.conf.json`：
```json
{
  "package": {
    "productName": "你的应用名称"
  }
}
```

## 🚀 部署发布

### Windows 发布
```bash
yarn tauri:build
# 输出：src-tauri/target/release/user-management-desktop.exe
```

### 跨平台构建
```bash
# 构建所有平台
yarn tauri:build --target all

# 构建特定平台
yarn tauri:build --target x86_64-pc-windows-msvc  # Windows
yarn tauri:build --target x86_64-apple-darwin     # macOS
yarn tauri:build --target x86_64-unknown-linux-gnu # Linux
```

## 📚 学习资源

- [Tauri 官方文档](https://tauri.app/)
- [React 官方文档](https://react.dev/)
- [Ant Design 组件库](https://ant.design/)
- [Yarn 包管理器](https://yarnpkg.com/)

## 💡 开发技巧

1. **调试前端**：右键 → 检查元素
2. **调试 Rust**：查看终端输出
3. **热重载**：修改 React 代码自动刷新
4. **Rust 重启**：修改 Rust 代码需要重启 `tauri:dev`

---

**🎉 现在你可以开始使用 Tauri 桌面应用了！**

记住：
- 先启动后端 (`mvn spring-boot:run`)
- 再启动桌面应用 (`yarn tauri:dev`)
- 享受现代化的桌面应用体验！