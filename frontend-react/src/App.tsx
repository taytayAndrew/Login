/**
 * Main App Component with React Query and Router
 */

import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConfigProvider, theme } from 'antd';
import { useEffect } from 'react';
import { useAppStore } from '@/store/appStore';
import { websocketService } from '@/services/websocket';
import { useAuthStore } from '@/store/authStore';
import './App.css';

// Create React Query client
const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

function App() {
    const appTheme = useAppStore(state => state.theme);
    const { isAuthenticated, token } = useAuthStore();

    // Initialize WebSocket connection when authenticated
    useEffect(() => {
        if (isAuthenticated && token) {
            websocketService.connect(token);
        } else {
            websocketService.disconnect();
        }

        return () => {
            websocketService.disconnect();
        };
    }, [isAuthenticated, token]);

    return (
        <QueryClientProvider client={queryClient}>
            <ConfigProvider
                theme={{
                    algorithm: appTheme === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
                    token: {
                        colorPrimary: '#1890ff',
                        borderRadius: 6,
                    },
                }}
            >
                <BrowserRouter>
                    <div className="app">
                        <h1>Enterprise Project Management System</h1>
                        <p>Frontend infrastructure setup complete!</p>
                        <p>Theme: {appTheme}</p>
                        <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
                    </div>
                </BrowserRouter>
            </ConfigProvider>
        </QueryClientProvider>
    );
}

export default App;
