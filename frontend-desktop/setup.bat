@echo off
chcp 65001 >nul
echo ========================================
echo    用户管理系统桌面版 - 环境配置 (Yarn)
echo ========================================
echo.

echo [1/5] 检查 Node.js 环境...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js 未安装，请先安装 Node.js
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
) else (
    echo ✅ Node.js 已安装
    node --version
)
echo.

echo [2/5] 检查 Yarn 环境...
yarn --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Yarn 未安装，正在安装...
    npm install -g yarn
    if %errorlevel% neq 0 (
        echo ❌ Yarn 安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ Yarn 已安装
    yarn --version
)
echo.

echo [3/5] 检查 Rust 环境...
rustc --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Rust 未安装，请先安装 Rust
    echo 下载地址: https://rustup.rs/
    pause
    exit /b 1
) else (
    echo ✅ Rust 已安装
    rustc --version
)
echo.

echo [4/5] 检查 Tauri CLI...
tauri --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  Tauri CLI 未安装，正在安装...
    yarn global add @tauri-apps/cli
    if %errorlevel% neq 0 (
        echo ❌ Tauri CLI 安装失败
        pause
        exit /b 1
    )
) else (
    echo ✅ Tauri CLI 已安装
    tauri --version
)
echo.

echo [5/5] 安装项目依赖...
yarn install
if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
) else (
    echo ✅ 依赖安装成功
)
echo.

echo [6/6] 首次构建 Rust 依赖...
echo 注意：首次构建可能需要几分钟时间...
yarn tauri build --debug
if %errorlevel% neq 0 (
    echo ❌ 构建失败
    pause
    exit /b 1
) else (
    echo ✅ 构建成功
)
echo.

echo ========================================
echo           🎉 环境配置完成！
echo ========================================
echo.
echo 接下来的步骤：
echo 1. 启动后端服务 (Spring Boot)
echo    cd ../spring-boot-demo
echo    mvn spring-boot:run
echo.
echo 2. 启动桌面应用开发模式
echo    yarn tauri:dev
echo.
echo 更多信息请查看 README.md 和 开发指南.md
echo.
pause