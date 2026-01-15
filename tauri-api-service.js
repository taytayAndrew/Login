import { invoke } from '@tauri-apps/api/tauri';

class TauriAPI {
    constructor() {
        this.token = localStorage.getItem('token') || '';
    }

    // 设置Token
    setToken(token) {
        this.token = token;
        localStorage.setItem('token', token);
    }

    // 清除Token
    clearToken() {
        this.token = '';
        localStorage.removeItem('token');
    }

    // 登录
    async login(username, password) {
        try {
            const result = await invoke('login', {
                request: { username, password }
            });
            
            if (result.success && result.data?.token) {
                this.setToken(result.data.token);
                await this.showNotification('登录成功', '欢迎使用用户管理系统');
            }
            
            return result;
        } catch (error) {
            console.error('登录失败:', error);
            return {
                success: false,
                message: error,
                data: null,
                code: 500
            };
        }
    }

    // 获取用户列表
    async getUsers() {
        try {
            const result = await invoke('get_users', { token: this.token });
            return result;
        } catch (error) {
            console.error('获取用户列表失败:', error);
            return {
                success: false,
                message: error,
                data: null,
                code: 500
            };
        }
    }

    // 创建用户
    async createUser(userData) {
        try {
            const result = await invoke('create_user', {
                token: this.token,
                user: userData
            });
            
            if (result.success) {
                await this.showNotification('成功', '用户创建成功');
            }
            
            return result;
        } catch (error) {
            console.error('创建用户失败:', error);
            return {
                success: false,
                message: error,
                data: null,
                code: 500
            };
        }
    }

    // 更新用户
    async updateUser(id, userData) {
        try {
            const result = await invoke('update_user', {
                token: this.token,
                id: id,
                user: userData
            });
            
            if (result.success) {
                await this.showNotification('成功', '用户更新成功');
            }
            
            return result;
        } catch (error) {
            console.error('更新用户失败:', error);
            return {
                success: false,
                message: error,
                data: null,
                code: 500
            };
        }
    }

    // 删除用户
    async deleteUser(id) {
        try {
            const result = await invoke('delete_user', {
                token: this.token,
                id: id
            });
            
            if (result.success) {
                await this.showNotification('成功', '用户删除成功');
            }
            
            return result;
        } catch (error) {
            console.error('删除用户失败:', error);
            return {
                success: false,
                message: error,
                data: null,
                code: 500
            };
        }
    }

    // 显示通知
    async showNotification(title, body) {
        try {
            await invoke('show_notification', { title, body });
        } catch (error) {
            console.error('显示通知失败:', error);
        }
    }

    // 获取应用版本
    async getAppVersion() {
        try {
            return await invoke('get_app_version');
        } catch (error) {
            console.error('获取版本失败:', error);
            return '1.0.0';
        }
    }

    // 检查服务器状态
    async checkServerStatus() {
        try {
            return await invoke('check_server_status');
        } catch (error) {
            console.error('检查服务器状态失败:', error);
            return false;
        }
    }

    // 保存到本地存储
    async saveToLocalStorage(key, value) {
        try {
            await invoke('save_to_local_storage', {
                key,
                value: JSON.stringify(value)
            });
            return true;
        } catch (error) {
            console.error('保存到本地存储失败:', error);
            return false;
        }
    }

    // 从本地存储加载
    async loadFromLocalStorage(key) {
        try {
            const value = await invoke('load_from_local_storage', { key });
            return JSON.parse(value);
        } catch (error) {
            console.error('从本地存储加载失败:', error);
            return null;
        }
    }

    // 检查网络状态
    isOnline() {
        return navigator.onLine;
    }

    // 获取当前Token
    getToken() {
        return this.token;
    }

    // 检查是否已登录
    isAuthenticated() {
        return !!this.token;
    }
}

export default new TauriAPI();