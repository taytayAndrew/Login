@echo off
chcp 65001 >nul
echo ========================================
echo      用户管理系统桌面版 - 快速启动
echo ========================================
echo.

echo 🚀 正在启动桌面应用...
echo.
echo 请确保：
echo 1. 后端服务已启动 (localhost:8080)
echo 2. 已完成环境配置 (运行过 setup.bat)
echo.

echo 启动中，请稍候...
yarn tauri:dev

pause