use tauri::command;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct User {
    pub id: Option<i32>,
    pub name: String,
    pub email: String,
    pub age: i32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct LoginRequest {
    pub username: String,
    pub password: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApiResponse<T> {
    pub success: bool,
    pub message: String,
    pub data: Option<T>,
    pub code: i32,
}

// HTTP客户端实例
fn get_http_client() -> reqwest::Client {
    reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(30))
        .build()
        .unwrap()
}

// 获取基础URL
fn get_base_url() -> String {
    "http://localhost:8080".to_string()
}

#[command]
pub async fn login(request: LoginRequest) -> Result<ApiResponse<HashMap<String, String>>, String> {
    let client = get_http_client();
    let url = format!("{}/auth/login", get_base_url());
    
    let response = client
        .post(&url)
        .json(&request)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if response.status().is_success() {
        let api_response: ApiResponse<HashMap<String, String>> = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        Ok(api_response)
    } else {
        Err(format!("登录失败: HTTP {}", response.status()))
    }
}

#[command]
pub async fn get_users(token: String) -> Result<ApiResponse<Vec<User>>, String> {
    let client = get_http_client();
    let url = format!("{}/users", get_base_url());
    
    let response = client
        .get(&url)
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if response.status().is_success() {
        let api_response: ApiResponse<Vec<User>> = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        Ok(api_response)
    } else {
        Err(format!("获取用户列表失败: HTTP {}", response.status()))
    }
}

#[command]
pub async fn create_user(token: String, user: User) -> Result<ApiResponse<User>, String> {
    let client = get_http_client();
    let url = format!("{}/users", get_base_url());
    
    let response = client
        .post(&url)
        .header("Authorization", format!("Bearer {}", token))
        .json(&user)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if response.status().is_success() {
        let api_response: ApiResponse<User> = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        Ok(api_response)
    } else {
        Err(format!("创建用户失败: HTTP {}", response.status()))
    }
}

#[command]
pub async fn update_user(token: String, id: i32, user: User) -> Result<ApiResponse<User>, String> {
    let client = get_http_client();
    let url = format!("{}/users/{}", get_base_url(), id);
    
    let response = client
        .put(&url)
        .header("Authorization", format!("Bearer {}", token))
        .json(&user)
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if response.status().is_success() {
        let api_response: ApiResponse<User> = response
            .json()
            .await
            .map_err(|e| format!("解析响应失败: {}", e))?;
        Ok(api_response)
    } else {
        Err(format!("更新用户失败: HTTP {}", response.status()))
    }
}

#[command]
pub async fn delete_user(token: String, id: i32) -> Result<ApiResponse<()>, String> {
    let client = get_http_client();
    let url = format!("{}/users/{}", get_base_url(), id);
    
    let response = client
        .delete(&url)
        .header("Authorization", format!("Bearer {}", token))
        .send()
        .await
        .map_err(|e| format!("网络请求失败: {}", e))?;

    if response.status().is_success() {
        Ok(ApiResponse {
            success: true,
            message: "删除成功".to_string(),
            data: None,
            code: 200,
        })
    } else {
        Err(format!("删除用户失败: HTTP {}", response.status()))
    }
}

#[command]
pub fn show_notification(title: &str, body: &str) -> Result<(), String> {
    tauri::api::notification::Notification::new("com.example.user-management")
        .title(title)
        .body(body)
        .show()
        .map_err(|e| format!("显示通知失败: {}", e))?;
    
    Ok(())
}

#[command]
pub fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[command]
pub async fn check_server_status() -> Result<bool, String> {
    let client = get_http_client();
    let url = format!("{}/health", get_base_url());
    
    match client.get(&url).send().await {
        Ok(response) => Ok(response.status().is_success()),
        Err(_) => Ok(false),
    }
}

// 本地存储相关命令
#[command]
pub async fn save_to_local_storage(key: String, value: String) -> Result<(), String> {
    use tauri::api::path::app_data_dir;
    use std::fs;
    
    let app_data_dir = app_data_dir(&tauri::Config::default())
        .ok_or("无法获取应用数据目录")?;
    
    let storage_dir = app_data_dir.join("storage");
    fs::create_dir_all(&storage_dir)
        .map_err(|e| format!("创建存储目录失败: {}", e))?;
    
    let file_path = storage_dir.join(format!("{}.txt", key));
    fs::write(file_path, value)
        .map_err(|e| format!("写入文件失败: {}", e))?;
    
    Ok(())
}

#[command]
pub async fn load_from_local_storage(key: String) -> Result<String, String> {
    use tauri::api::path::app_data_dir;
    use std::fs;
    
    let app_data_dir = app_data_dir(&tauri::Config::default())
        .ok_or("无法获取应用数据目录")?;
    
    let file_path = app_data_dir.join("storage").join(format!("{}.txt", key));
    
    if !file_path.exists() {
        return Err("文件不存在".to_string());
    }
    
    fs::read_to_string(file_path)
        .map_err(|e| format!("读取文件失败: {}", e))
}