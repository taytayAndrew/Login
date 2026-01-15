#!/bin/bash

echo "========================================"
echo "   用户管理系统桌面版 - 环境配置"
echo "========================================"
echo

echo "[1/5] 检查 Node.js 环境..."
if command -v node &> /dev/null; then
    echo "✅ Node.js 已安装"
    node --version
else
    echo "❌ Node.js 未安装，请先安装 Node.js"
    echo "下载地址: https://nodejs.org/"
    exit 1
fi
echo

echo "[2/5] 检查 Rust 环境..."
if command -v rustc &> /dev/null; then
    echo "✅ Rust 已安装"
    rustc --version
else
    echo "❌ Rust 未安装，请先安装 Rust"
    echo "安装命令: curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh"
    exit 1
fi
echo

echo "[3/5] 检查 Tauri CLI..."
if command -v tauri &> /dev/null; then
    echo "✅ Tauri CLI 已安装"
    tauri --version
else
    echo "⚠️  Tauri CLI 未安装，正在安装..."
    npm install -g @tauri-apps/cli
    if [ $? -ne 0 ]; then
        echo "❌ Tauri CLI 安装失败"
        exit 1
    fi
fi
echo

echo "[4/5] 安装项目依赖..."
npm install
if [ $? -ne 0 ]; then
    echo "❌ 依赖安装失败"
    exit 1
else
    echo "✅ 依赖安装成功"
fi
echo

echo "[5/5] 首次构建 Rust 依赖..."
echo "注意：首次构建可能需要几分钟时间..."
npm run tauri build -- --debug
if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
else
    echo "✅ 构建成功"
fi
echo

echo "========================================"
echo "          🎉 环境配置完成！"
echo "========================================"
echo
echo "接下来的步骤："
echo "1. 启动后端服务 (Spring Boot)"
echo "   cd ../spring-boot-demo"
echo "   mvn spring-boot:run"
echo
echo "2. 启动桌面应用开发模式"
echo "   npm run tauri:dev"
echo
echo "更多信息请查看 README.md 和 开发指南.md"
echo