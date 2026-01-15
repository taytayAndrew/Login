import React, { useState, useEffect } from 'react';
import { Layout, Menu, Badge, Space, Typography, Button, message } from 'antd';
import {
    UserOutlined,
    DashboardOutlined,
    SettingOutlined,
    WifiOutlined,
    DisconnectOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';
import UserList from './components/UserList';
import Dashboard from './components/Dashboard';
import Settings from './components/Settings';
import LoginForm from './components/LoginForm';
import TauriAPI from './services/tauriAPI';
import './App.css';

const { Header, Sider, Content } = Layout;
const { Text } = Typography;

function App() {
    const [selectedKey, setSelectedKey] = useState('dashboard');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [serverStatus, setServerStatus] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [appVersion, setAppVersion] = useState('1.0.0');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        initializeApp();
        setupNetworkListeners();
        checkServerStatus();

        // 定期检查服务器状态
        const interval = setInterval(checkServerStatus, 30000); // 30秒检查一次

        return () => {
            clearInterval(interval);
        };
    }, []);

    const initializeApp = async () => {
        try {
            // 获取应用版本
            const version = await TauriAPI.getAppVersion();
            setAppVersion(version);

            // 检查是否已登录
            const authenticated = TauriAPI.isAuthenticated();
            setIsAuthenticated(authenticated);

            if (authenticated) {
                message.success('欢迎回来！');
            }
        } catch (error) {
            console.error('初始化应用失败:', error);
        } finally {
            setLoading(false);
        }
    };

    const setupNetworkListeners = () => {
        const handleOnline = () => {
            setIsOnline(true);
            message.success('网络已连接');
            checkServerStatus();
        };

        const handleOffline = () => {
            setIsOnline(false);
            setServerStatus(false);
            message.warning('网络已断开，切换到离线模式');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    };

    const checkServerStatus = async () => {
        if (!isOnline) {
            setServerStatus(false);
            return;
        }

        try {
            const status = await TauriAPI.checkServerStatus();
            setServerStatus(status);
        } catch (error) {
            setServerStatus(false);
        }
    };

    const handleLogin = async (username, password) => {
        try {
            const result = await TauriAPI.login(username, password);
            if (result.success) {
                setIsAuthenticated(true);
                message.success('登录成功');
                return true;
            } else {
                message.error(result.message || '登录失败');
                return false;
            }
        } catch (error) {
            message.error('登录失败，请稍后重试');
            return false;
        }
    };

    const handleLogout = () => {
        TauriAPI.clearToken();
        setIsAuthenticated(false);
        setSelectedKey('dashboard');
        message.success('已退出登录');
    };

    const menuItems = [
        {
            key: 'dashboard',
            icon: <DashboardOutlined />,
            label: 'Dashboard'
        },
        {
            key: 'users',
            icon: <UserOutlined />,
            label: '用户管理'
        },
        {
            key: 'settings',
            icon: <SettingOutlined />,
            label: '设置'
        }
    ];

    const renderContent = () => {
        if (loading) {
            return <div style={{ textAlign: 'center', padding: '50px' }}>加载中...</div>;
        }

        switch (selectedKey) {
            case 'dashboard':
                return <Dashboard isOnline={isOnline} serverStatus={serverStatus} />;
            case 'users':
                return <UserList isOnline={isOnline} serverStatus={serverStatus} />;
            case 'settings':
                return <Settings appVersion={appVersion} />;
            default:
                return <Dashboard isOnline={isOnline} serverStatus={serverStatus} />;
        }
    };

    const getStatusColor = () => {
        if (!isOnline) return '#ff4d4f'; // 红色：离线
        if (!serverStatus) return '#faad14'; // 橙色：网络在线但服务器离线
        return '#52c41a'; // 绿色：全部在线
    };

    const getStatusText = () => {
        if (!isOnline) return '离线模式';
        if (!serverStatus) return '服务器离线';
        return '在线';
    };

    // 如果未登录，显示登录表单
    if (!isAuthenticated) {
        return (
            <div style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            }}>
                <LoginForm onLogin={handleLogin} />
            </div>
        );
    }

    return (
        <Layout style={{ height: '100vh' }}>
            <Header style={{
                background: '#001529',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0 24px'
            }}>
                <div style={{ color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                    用户管理系统 v{appVersion}
                </div>
                <Space>
                    <Badge
                        color={getStatusColor()}
                        text={
                            <Text style={{ color: 'white' }}>
                                {isOnline ? <WifiOutlined /> : <DisconnectOutlined />}
                                {' '}{getStatusText()}
                            </Text>
                        }
                    />
                    <Button
                        type="link"
                        style={{ color: 'white' }}
                        onClick={handleLogout}
                    >
                        退出登录
                    </Button>
                </Space>
            </Header>
            <Layout>
                <Sider width={200} style={{ background: '#fff' }}>
                    <Menu
                        mode="inline"
                        selectedKeys={[selectedKey]}
                        items={menuItems}
                        onClick={({ key }) => setSelectedKey(key)}
                        style={{ height: '100%', borderRight: 0 }}
                    />
                </Sider>
                <Layout style={{ padding: '24px' }}>
                    <Content style={{
                        background: '#fff',
                        padding: 24,
                        margin: 0,
                        minHeight: 280,
                        borderRadius: '8px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                    }}>
                        {renderContent()}
                    </Content>
                </Layout>
            </Layout>
        </Layout>
    );
}

export default App;