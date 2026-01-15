# Spring Boot 后端项目 - 面试速查手册

> 🎯 **定位**：面试准备 + 技术速查  
> ⚡ **特点**：重点突出、快速定位、实战导向  
> 💼 **适用**：面试前复习、技术难点速查

---

## 🔥 面试必看 - 核心亮点

### 快速定位（30秒找到你要的）

| 面试问题 | 跳转章节 | 关键词 |
|---------|---------|--------|
| 如何解决缓存击穿？ | [→ 缓存击穿](#缓存击穿问题) | 分布式锁、SETNX |
| 权限控制怎么实现？ | [→ RBAC权限](#rbac权限管理) | 自定义注解、拦截器 |
| JWT认证流程？ | [→ JWT认证](#jwt认证流程) | Token生成、验证 |
| 如何防止接口被刷？ | [→ 接口限流](#接口限流) | 固定窗口、Redis |
| 高并发怎么处理？ | [→ 高并发方案](#高并发优化) | 缓存、异步、限流 |
| 缓存一致性问题？ | [→ 缓存一致性](#缓存一致性) | 先更新DB后删缓存 |

---

## 📋 目录

### 第一部分：面试核心（必看）
1. [项目一句话介绍](#项目一句话介绍)
2. [技术栈和架构](#技术栈和架构)
3. [核心技术难点](#核心技术难点)
4. [性能优化方案](#性能优化方案)
5. [面试高频问题](#面试高频问题)

### 第二部分：技术实现（速查）
6. [JWT认证实现](#jwt认证实现)
7. [RBAC权限管理](#rbac权限管理)
8. [Redis缓存方案](#redis缓存方案)
9. [高并发优化](#高并发优化)
10. [关键代码片段](#关键代码片段)

### 第三部分：简历和话术
11. [简历项目描述](#简历项目描述)
12. [面试回答模板](#面试回答模板)

---

## 项目一句话介绍

**30秒版本（电梯演讲）：**
```
这是一个企业级用户管理系统，我负责后端开发。使用Spring Boot + MySQL + Redis，
实现了JWT认证、RBAC权限管理、Redis缓存优化等核心功能。

核心亮点：
• 用Redis分布式锁解决缓存击穿，并发能力提升10倍
• 基于注解的权限控制，代码简洁易维护
• 接口限流防止恶意攻击，系统稳定性提升

支持1000+并发，接口响应<100ms，缓存命中率95%。
```

---

## 技术栈和架构

### 技术栈（面试必问）

**后端核心：**
```
Spring Boot 3.3.4    → 主框架（自动配置、快速开发）
Spring Data JPA      → 数据访问（ORM、Repository）
MySQL 8.0           → 关系型数据库（事务、一致性）
Redis 5.0           → 缓存 + 分布式锁 + 限流
JWT 0.12.3          → 无状态认证
BCrypt              → 密码加密（单向、加盐）
```

**为什么选这些技术？**（面试官会问）
- **Spring Boot**：快速开发，自动配置，适合中小型项目
- **MySQL**：关系型数据库，支持事务，数据一致性好
- **Redis**：内存数据库，读写快，适合缓存和分布式锁
- **JWT**：无状态认证，适合分布式系统，不需要Session

### 系统架构图

```
┌─────────────┐
│   前端      │  React + Ant Design
│  (浏览器)   │
└──────┬──────┘
       │ HTTP + JWT Token
       ↓
┌─────────────────────────────────┐
│      Spring Boot 后端            │
│  ┌──────────────────────────┐  │
│  │  拦截器层                 │  │
│  │  • JWT拦截器（认证）      │  │
│  │  • 权限拦截器（授权）     │  │
│  │  • 限流拦截器（保护）     │  │
│  └──────────┬───────────────┘  │
│             ↓                   │
│  ┌──────────────────────────┐  │
│  │  Controller层（接口）     │  │
│  └──────────┬───────────────┘  │
│             ↓                   │
│  ┌──────────────────────────┐  │
│  │  Service层（业务逻辑）    │  │
│  └──────────┬───────────────┘  │
│             ↓                   │
│  ┌──────────────────────────┐  │
│  │  Repository层（数据访问） │  │
│  └──────────┬───────────────┘  │
└─────────────┼───────────────────┘
              ↓
    ┌─────────┴─────────┐
    ↓                   ↓
┌─────────┐      ┌──────────┐
│  MySQL  │      │  Redis   │
│ (持久化) │      │  (缓存)  │
└─────────┘      └──────────┘
```

---

## 核心技术难点

### 难点1：缓存击穿问题

**⭐⭐⭐⭐⭐ 面试必问**

#### 项目中的热点数据场景

**1. 每日推荐/每日一句（最典型的热点）**
```
场景：首页顶部显示"每日推荐"或"每日一句"
功能：每天更新一条励志语录、系统提示或功能推荐
热点：所有用户看到的是同一条数据

为什么是热点？
• 所有用户登录后都会看到
• 1000个用户 = 1000次查询同一份数据
• 典型的"一对多"热点场景
• 数据每天0点自动更新（缓存自然过期）

实际场景：
• 系统有1000个在线用户
• 每个用户每次刷新页面都要加载"每日推荐"
• 高峰期（上午9-10点）：500个用户同时登录
• 500个请求查询同一条"今日推荐"数据

如果没有缓存：
→ 500次数据库查询（查询同一条数据）
→ 数据库压力大
→ 响应慢（每次50ms）

使用缓存后：
→ 第1次查询数据库，存入Redis（缓存到今天23:59:59）
→ 后续499次从Redis读取（1ms）
→ 数据库压力降低99.8%
→ 响应速度提升50倍

缓存击穿场景：
• 每天0点，缓存自动过期
• 0点刚过，有100个夜猫子用户同时刷新页面
• 100个请求都发现缓存没有（昨天的过期了，今天的还没缓存）
• 100个请求同时查询数据库
→ 虽然查询简单，但100个并发请求仍会造成压力
→ 使用分布式锁，只让第一个请求查数据库
```

**2. Dashboard统计数据（计算密集型热点）**
```
场景：首页Dashboard显示系统统计信息
内容：总用户数、今日新增用户、本周活跃用户等
热点：所有管理员看到的统计数据相同

为什么是热点？
• 管理员每次进入系统都会看Dashboard
• 统计数据计算复杂（COUNT、GROUP BY、日期范围查询）
• 多个管理员同时查看
• 数据不需要实时精确（允许1-2分钟延迟）

实际场景：
• 统计查询：SELECT COUNT(*) FROM users WHERE create_time > today
• 需要扫描全表，耗时500ms
• 3个管理员同时刷新Dashboard
• 3个复杂查询同时执行

如果没有缓存：
→ 每次都要扫描全表
→ 3个查询 × 500ms = 1500ms数据库繁忙
→ 其他请求被阻塞

使用缓存后：
→ 统计数据缓存2分钟
→ 2分钟内只查询1次数据库
→ 数据库压力降低90%

缓存击穿场景：
• 统计数据缓存2分钟过期
• 2分钟后缓存失效
• 此时10个管理员同时刷新Dashboard
• 10个复杂统计查询同时执行
→ 每个查询扫描全表，耗时500ms
→ 数据库CPU飙升到100%
→ 其他正常请求超时
```

**3. 角色权限配置（全局共享数据）**
```
场景：权限拦截器验证用户权限
频率：每个API请求都要验证权限
热点：角色-权限映射关系

为什么是热点？
• 每个请求都要经过权限拦截器
• 需要查询用户的角色和权限（3张表JOIN）
• 角色权限配置很少变化
• 所有用户共享同一份角色权限数据

实际场景：
• 系统有2个角色：ADMIN、USER
• 每个角色有5个权限
• 1000个并发请求 = 1000次权限查询

如果没有缓存：
→ 每次都要JOIN查询3张表
→ 1000次复杂查询
→ 数据库连接池被占满

使用缓存后：
→ 角色权限数据常驻Redis（不设置过期时间）
→ 管理员修改权限时，手动刷新缓存
→ 1000次请求都从Redis读取
→ 数据库压力降低99%

注意：角色权限数据不会自动过期，所以不存在缓存击穿问题
```

#### 问题描述（缓存击穿）
```
以"每日推荐"为例（最典型的场景）：
• "每日推荐"缓存到今天23:59:59
• 每天0点，缓存自动过期
• 0点刚过，有100个夜猫子用户同时刷新页面
• 100个请求都发现缓存没有（昨天的过期了，今天的还没缓存）
• 100个请求同时查询数据库

为什么会同时刷新？
• 0点是自然的时间节点，很多用户会在0点附近刷新
• 有些用户专门等到0点看"今日推荐"
• 前端可能有定时刷新机制

后果：
→ 100个请求同时查询数据库
→ 虽然查询简单，但100个并发仍会造成压力
→ 数据库连接池被占用
→ 其他正常请求被阻塞
→ 系统响应变慢

更严重的场景（Dashboard统计数据）：
• 统计数据缓存2分钟过期
• 2分钟后缓存失效
• 10个管理员同时刷新Dashboard
• 10个统计查询同时执行（每个扫描全表，耗时500ms）
→ 数据库CPU飙升到100%
→ 所有请求超时
→ 系统几乎不可用

这就是典型的"缓存击穿"问题：
热点数据过期 + 多个并发请求 = 数据库压力暴增
```

#### 解决方案：Redis分布式锁

**核心思路：**
```
只让第一个请求查数据库，其他请求等待并从缓存读取
```

**关键代码：**
```java
// 1. 尝试获取锁（SETNX + EXPIRE）
Boolean locked = redisTemplate.opsForValue()
    .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);

if (locked) {
    try {
        // 2. 双重检查缓存
        Object cached = redisService.get(cacheKey);
        if (cached != null) return cached;
        
        // 3. 查询数据库
        User user = userRepository.findById(id).orElse(null);
        
        // 4. 存入缓存（随机过期时间，防止雪崩）
        long expireTime = 60 + new Random().nextInt(30);
        redisService.set(cacheKey, user, expireTime);
        
        return user;
    } finally {
        // 5. 释放锁（验证lockValue，防止误删）
        if (lockValue.equals(redisTemplate.opsForValue().get(lockKey))) {
            redisTemplate.delete(lockKey);
        }
    }
} else {
    // 6. 获取锁失败，等待后重试
    Thread.sleep(100);
    return getUser(id);  // 递归重试
}
```

**执行流程图：**
```
100个用户在0点刚过同时刷新页面，请求"今日推荐"
    ↓
请求1：获取锁成功 → 查询数据库 → 存入缓存 → 释放锁 → 返回推荐
请求2：获取锁失败 → 等待100ms → 重试 → 从缓存读取 → 返回推荐
请求3：获取锁失败 → 等待100ms → 重试 → 从缓存读取 → 返回推荐
...
请求100：获取锁失败 → 等待100ms → 重试 → 从缓存读取 → 返回推荐

结果：
• 数据库查询：1次（只有请求1查询）
• 缓存查询：99次（请求2-100从缓存读取）
• 数据库压力：降低99%
• 所有用户都能正常访问，响应时间<100ms
```

**面试回答要点：**
1. **问题**：热点数据过期时，大量并发请求同时打到数据库
2. **场景举例**：
   - 系统公告：所有用户登录后都会看到，1000个用户同时刷新
   - 统计数据：Dashboard统计信息，多个管理员同时查看
   - 角色权限：每个请求都要验证权限，高频访问
3. **方案**：Redis分布式锁（SETNX）
4. **流程**：第一个请求获锁查DB，其他请求等待读缓存
5. **关键细节**：
   - 锁必须设置过期时间（防死锁）
   - 释放锁要验证lockValue（防误删其他线程的锁）
   - 双重检查缓存（获锁后再检查一次，可能已被其他线程写入）
   - 随机过期时间（防止缓存雪崩）
6. **效果**：DB查询从1000次降到1次，并发能力提升10倍

**面试官可能追问：**
```
Q1：为什么要双重检查缓存？
A：因为在等待获取锁的过程中，可能已经有其他线程查询了数据库并写入缓存。
   获取锁后再检查一次，避免重复查询数据库。

Q2：如果锁一直获取不到怎么办？
A：锁设置了10秒过期时间，最多等待10秒。
   实际上第一个请求查询数据库很快（100ms），其他请求等待100ms后就能读到缓存。

Q3：为什么释放锁要验证lockValue？
A：防止误删其他线程的锁。
   场景：线程A获取锁，执行超时（超过10秒），锁自动过期。
        线程B获取到锁，开始执行。
        线程A执行完成，如果不验证lockValue，会删除线程B的锁。

Q4：为什么用递归重试而不是循环？
A：代码简洁，逻辑清晰。实际项目中可以用循环+最大重试次数，防止无限递归。

Q5：你们项目中哪些数据是热点数据？
A：主要有两类热点数据：
   
   第一是"每日推荐"功能。我们首页有个"每日推荐"模块，每天展示一条励志语录或功能推荐。
   所有用户登录后都会看到，1000个用户就是1000次查询同一份数据。
   这个数据缓存到当天23:59:59，每天0点自动过期。
   如果0点有100个用户同时刷新，100个请求会同时打到数据库，这就是典型的缓存击穿。
   
   第二是Dashboard统计数据。比如总用户数、今日新增等，这些统计查询需要扫描全表，
   计算很耗时（500ms）。多个管理员同时刷新Dashboard，数据库压力很大。
   我们缓存2分钟，因为统计数据不需要实时精确。
   
   这两类数据的共同特点是：所有用户共享、访问频繁、会自然过期。
   所以我用Redis分布式锁解决缓存击穿问题，数据库压力降低了99%。
```

---

### 难点2：RBAC权限管理

**⭐⭐⭐⭐ 面试常问**

#### 权限模型设计

```
用户（User） ←→ 角色（Role） ←→ 权限（Permission）
     N              N:M              N:M

示例：
张三 → 管理员角色 → [USER_READ, USER_WRITE, USER_DELETE]
李四 → 普通用户角色 → [USER_READ]
```

#### 实现方案：自定义注解 + 拦截器

**1. 定义注解**
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    String value();  // 需要的权限名称
}
```

**2. 使用注解**
```java
@DeleteMapping("/users/{id}")
@RequiresPermission("USER_DELETE")  // 需要删除权限
public ApiResponse<Void> deleteUser(@PathVariable Long id) {
    userRepository.deleteById(id);
    return ApiResponse.success("删除成功");
}
```

**3. 权限拦截器**
```java
@Component
public class PermissionInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        // 1. 获取方法上的注解
        RequiresPermission annotation = 
            ((HandlerMethod) handler).getMethodAnnotation(RequiresPermission.class);
        
        if (annotation == null) return true;  // 无权限要求
        
        // 2. 获取需要的权限
        String requiredPermission = annotation.value();
        
        // 3. 获取用户ID（JWT拦截器已设置）
        Long userId = (Long) request.getAttribute("userId");
        
        // 4. 查询用户的所有权限
        User user = userRepository.findByIdWithRoles(userId).orElseThrow();
        Set<String> userPermissions = user.getRoles().stream()
            .flatMap(role -> role.getPermissions().stream())
            .map(Permission::getName)
            .collect(Collectors.toSet());
        
        // 5. 判断是否有权限
        if (!userPermissions.contains(requiredPermission)) {
            response.setStatus(403);
            response.getWriter().write("{\"message\":\"权限不足\"}");
            return false;
        }
        
        return true;
    }
}
```

**面试回答要点：**
1. **模型**：RBAC（用户-角色-权限）
2. **实现**：自定义注解 + 拦截器
3. **优势**：
   - 代码解耦（权限逻辑与业务分离）
   - 易于维护（新增权限只需加注解）
   - 灵活性高（支持方法级控制）
4. **数据库**：5张表（users、roles、permissions、user_roles、role_permissions）

---

### 难点3：接口限流

**⭐⭐⭐ 面试常问**

#### 问题场景
```
登录接口被暴力破解 → 1秒内1000次请求
注册接口被恶意注册 → 短时间大量垃圾账号
```

#### 解决方案：固定窗口限流算法

**核心思路：**
```
使用Redis记录请求次数，超过限制则拒绝
```

**关键代码：**
```java
// 1. 定义限流注解
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    int limit() default 10;      // 限制次数
    long window() default 60;    // 时间窗口（秒）
}

// 2. 使用注解
@PostMapping("/auth/login")
@RateLimit(limit = 5, window = 60)  // 1分钟最多5次
public ApiResponse<LoginResponse> login(...) {
    // 登录逻辑
}

// 3. 限流实现
public boolean tryRateLimit(String key, int limit, long windowSeconds) {
    // 获取当前计数
    Object countObj = redisTemplate.opsForValue().get(key);
    int count = countObj == null ? 0 : Integer.parseInt(countObj.toString());
    
    if (count >= limit) {
        return false;  // 超过限制
    }
    
    if (count == 0) {
        // 第一次请求，设置过期时间
        redisTemplate.opsForValue().set(key, 1, windowSeconds, TimeUnit.SECONDS);
    } else {
        // 计数器+1
        redisTemplate.opsForValue().increment(key);
    }
    
    return true;
}
```

**面试回答要点：**
1. **算法**：固定窗口限流
2. **实现**：Redis计数器 + 过期时间
3. **策略**：
   - 已登录用户：按用户ID限流
   - 未登录用户：按IP限流
4. **效果**：成功防止暴力破解和恶意注册

---

### 难点4：缓存一致性问题

**⭐⭐⭐⭐ 面试高频**

#### 问题场景
```
用户修改了个人信息（如年龄）
→ 数据库已更新
→ 但缓存中还是旧数据
→ 其他用户查询时看到的是旧数据
```

#### 解决方案：先更新数据库，再删除缓存

**为什么不是"先删缓存，再更新数据库"？**
```
时间线：
T1：线程A删除缓存
T2：线程B查询，发现缓存没有，查询数据库（旧数据）
T3：线程A更新数据库（新数据）
T4：线程B将旧数据写入缓存

结果：缓存中是旧数据，数据库中是新数据，不一致！
```

**为什么不是"先更新数据库，再更新缓存"？**
```
问题1：如果缓存更新失败，缓存中是旧数据
问题2：很多数据可能不会被查询，更新缓存浪费资源
问题3：如果数据计算复杂（如统计数据），更新缓存成本高
```

**"先更新数据库，再删除缓存"的优势：**
```
时间线：
T1：线程A更新数据库（新数据）
T2：线程A删除缓存
T3：线程B查询，发现缓存没有，查询数据库（新数据）
T4：线程B将新数据写入缓存

结果：缓存和数据库都是新数据，一致！

即使删除缓存失败：
→ 下次查询会从数据库读取新数据
→ 或者缓存过期后自动失效
```

**关键代码：**
```java
@PutMapping("/users/{id}")
public ApiResponse<User> updateUser(@PathVariable Long id, @RequestBody User user) {
    // 1. 更新数据库
    user.setId(id);
    User updated = userRepository.save(user);
    
    // 2. 删除缓存
    String cacheKey = "users:" + id;
    redisService.delete(cacheKey);
    
    // 3. 返回结果
    return ApiResponse.success("更新成功", updated);
}
```

**极端情况处理：**
```
如果删除缓存失败怎么办？

方案1：重试机制
try {
    redisService.delete(cacheKey);
} catch (Exception e) {
    // 重试3次
    for (int i = 0; i < 3; i++) {
        try {
            Thread.sleep(100);
            redisService.delete(cacheKey);
            break;
        } catch (Exception ex) {
            // 继续重试
        }
    }
}

方案2：消息队列异步删除
// 发送消息到MQ
mqService.send("cache-delete", cacheKey);
// MQ消费者异步删除缓存，失败后重试

方案3：设置缓存过期时间
// 即使删除失败，缓存也会在60秒后过期
redisService.set(cacheKey, user, 60);
```

**面试回答要点：**
1. **策略**：先更新数据库，再删除缓存
2. **原因**：
   - 先删缓存：可能导致旧数据被写入缓存
   - 更新缓存：浪费资源，且更新失败会不一致
   - 删除缓存：懒加载，下次查询时自动更新
3. **极端情况**：
   - 删除缓存失败：重试、MQ异步、缓存过期
4. **效果**：保证最终一致性

---

### 难点5：分布式锁的死锁问题

**⭐⭐⭐⭐ 面试常问**

#### 问题场景
```
线程A获取锁后，执行业务逻辑
→ 业务逻辑抛出异常
→ finally块中释放锁的代码没有执行
→ 锁永远不会被释放
→ 其他线程永远获取不到锁
→ 系统死锁
```

#### 解决方案：锁必须设置过期时间

**错误示例（会死锁）：**
```java
// 获取锁（没有设置过期时间）
Boolean locked = redisTemplate.opsForValue().setIfAbsent(lockKey, lockValue);

if (locked) {
    try {
        // 业务逻辑
        doSomething();
    } finally {
        // 如果业务逻辑抛异常，这里可能不会执行
        redisTemplate.delete(lockKey);
    }
}
```

**正确示例（不会死锁）：**
```java
// 获取锁（设置10秒过期时间）
Boolean locked = redisTemplate.opsForValue()
    .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);

if (locked) {
    try {
        // 业务逻辑
        doSomething();
    } finally {
        // 验证lockValue后释放锁
        if (lockValue.equals(redisTemplate.opsForValue().get(lockKey))) {
            redisTemplate.delete(lockKey);
        }
    }
}

// 即使finally不执行，锁也会在10秒后自动过期
```

**面试回答要点：**
1. **问题**：业务逻辑异常导致锁无法释放
2. **方案**：获取锁时必须设置过期时间
3. **原理**：即使程序崩溃，锁也会自动过期
4. **注意**：过期时间要大于业务执行时间

---

### 难点6：缓存穿透问题

**⭐⭐⭐ 面试常问**

#### 问题场景
```
恶意用户查询不存在的数据（如id=999999）
→ Redis没有
→ 查询MySQL也没有
→ 返回null
→ 下次查询，Redis还是没有
→ 又查询MySQL...

如果恶意用户持续查询不存在的数据：
→ 每次都打到数据库
→ 缓存完全失效
→ 数据库压力暴增
```

#### 解决方案：缓存空值标记

**关键代码：**
```java
@GetMapping("/users/{id}")
public ApiResponse<User> getUser(@PathVariable Long id) {
    String cacheKey = "users:" + id;
    
    // 1. 检查缓存
    Object cached = redisService.get(cacheKey);
    if (cached != null) {
        if ("NULL".equals(cached)) {
            // 空值标记，说明数据不存在
            throw new RuntimeException("用户不存在");
        }
        return ApiResponse.success((User) cached);
    }
    
    // 2. 查询数据库
    User user = userRepository.findById(id).orElse(null);
    
    if (user == null) {
        // 3. 用户不存在，缓存空值标记（5分钟）
        redisService.set(cacheKey, "NULL", 300);
        throw new RuntimeException("用户不存在");
    }
    
    // 4. 用户存在，缓存数据
    redisService.set(cacheKey, user, 60);
    return ApiResponse.success(user);
}
```

**效果：**
```
第1次查询id=999999：
→ Redis没有 → 查MySQL没有 → 缓存"NULL"标记 → 返回"用户不存在"

第2次查询id=999999：
→ Redis有"NULL"标记 → 直接返回"用户不存在" → 不查MySQL

结果：恶意查询只会打到数据库1次，后续都被Redis拦截
```

**面试回答要点：**
1. **问题**：查询不存在的数据，每次都打到数据库
2. **方案**：缓存空值标记（如"NULL"字符串）
3. **过期时间**：空值标记设置较短过期时间（5分钟）
4. **效果**：恶意查询只会打到数据库1次

---

### 难点7：缓存雪崩问题

**⭐⭐⭐ 面试常问**

#### 问题场景
```
大量缓存设置了相同的过期时间（如60秒）
→ 60秒后，所有缓存同时失效
→ 大量请求同时打到数据库
→ 数据库压力瞬间暴增
→ 可能宕机
```

#### 解决方案：随机过期时间

**错误示例（会雪崩）：**
```java
// 所有用户的缓存都是60秒过期
redisService.set("users:1", user1, 60);
redisService.set("users:2", user2, 60);
redisService.set("users:3", user3, 60);
// ...
redisService.set("users:1000", user1000, 60);

// 60秒后，1000个缓存同时失效
// 1000个请求同时查询数据库
```

**正确示例（不会雪崩）：**
```java
// 基础60秒 + 随机0-30秒 = 60-90秒
long expireTime = 60 + new Random().nextInt(30);
redisService.set("users:1", user1, expireTime);  // 65秒过期
redisService.set("users:2", user2, expireTime);  // 72秒过期
redisService.set("users:3", user3, expireTime);  // 88秒过期
// ...

// 缓存在60-90秒之间陆续过期
// 数据库压力分散
```

**面试回答要点：**
1. **问题**：大量缓存同时过期，数据库压力暴增
2. **方案**：随机过期时间（基础时间 + 随机时间）
3. **效果**：缓存陆续过期，数据库压力分散

---

### 难点8：JWT Token续期问题

## 性能优化方案

### 优化1：Redis缓存

**优化前：**
```
每次查询都访问MySQL → 响应时间500ms → 并发能力低
```

**优化后：**
```
第1次：查MySQL → 存Redis → 返回（500ms）
第2次：查Redis → 返回（5ms）
```

**效果：**
- 缓存命中率：95%
- 响应时间：500ms → 5ms（提升100倍）
- DB压力：降低80%

---

### 优化2：异步处理

**优化前：**
```
用户请求 → 处理业务（100ms） → 记录日志（3000ms） → 返回
总耗时：3100ms
```

**优化后：**
```
用户请求 → 处理业务（100ms） → 返回
                          ↓
                    异步记录日志（3000ms）
总耗时：100ms
```

**关键代码：**
```java
// 1. 配置线程池
@Bean(name = "taskExecutor")
public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);       // 核心线程数
    executor.setMaxPoolSize(10);       // 最大线程数
    executor.setQueueCapacity(100);    // 队列容量
    return executor;
}

// 2. 异步方法
@Async("taskExecutor")
public void recordLog(Long userId) {
    // 异步记录日志
}
```

**效果：**
- 响应时间：降低50%
- 用户体验：大幅提升

---

### 优化3：数据库连接池

**HikariCP配置：**
```properties
spring.datasource.hikari.minimum-idle=5          # 最小空闲连接
spring.datasource.hikari.maximum-pool-size=20    # 最大连接数
spring.datasource.hikari.connection-timeout=30000 # 连接超时
```

**效果：**
- 连接复用，减少创建/销毁开销
- 并发能力提升

---

## 面试高频问题

### Q1：JWT和Session的区别？

**回答：**
```
Session认证：
• 服务器存储Session，占用内存
• 需要Session共享（Redis）才能支持分布式
• 依赖Cookie，跨域不友好

JWT认证：
• 无状态，服务器不存储，节省内存
• 天然支持分布式，无需Session共享
• 不依赖Cookie，跨域友好
• Token可存储用户信息，减少DB查询

我选择JWT是因为项目采用前后端分离架构，JWT更适合。
```

---

### Q2：如何保证缓存和数据库一致性？

**回答：**
```
我采用"先更新数据库，再删除缓存"策略：

为什么不是"先删缓存，再更新DB"？
• 删缓存后，更新DB前，有请求查询
• 会从DB读旧数据并存入缓存
• 导致缓存中是旧数据

为什么不是"先更新DB，再更新缓存"？
• 如果缓存更新失败，缓存中是旧数据
• 很多数据可能不会被查询，更新缓存浪费资源

"先更新DB，再删缓存"的优势：
• 即使删缓存失败，下次查询会从DB读新数据
• 懒加载，只有被查询的数据才进缓存

极端情况处理：
• 使用消息队列异步删除缓存
• 设置缓存过期时间，即使删除失败也会过期
```

---

### Q3：如何处理高并发？

**回答：**
```
我使用了多种方案：

1. 缓存优化：
   • 热点数据缓存，缓存命中率95%
   • 减少DB查询，DB压力降低80%

2. 分布式锁：
   • 防止缓存击穿
   • 防止并发修改数据

3. 接口限流：
   • 防止恶意攻击
   • 保护系统稳定性

4. 异步处理：
   • 非关键业务异步执行
   • 响应时间降低50%

5. 数据库优化：
   • 连接池参数调优
   • 添加索引
   • 读写分离（如果需要）

效果：支持1000+并发，接口响应<100ms
```

---

## JWT认证实现

### 认证流程

```
1. 用户登录
   ↓
2. 验证用户名密码（BCrypt）
   ↓
3. 生成JWT Token
   ↓
4. 返回Token给前端
   ↓
5. 前端保存Token（localStorage）
   ↓
6. 后续请求携带Token（请求头）
   ↓
7. JWT拦截器验证Token
   ↓
8. 提取用户ID，放入request
   ↓
9. Controller处理业务
```

### 关键代码

**1. 生成Token**

**1. 生成Token**
```java
public static String generateToken(Long userId, String username) {
    Date now = new Date();
    Date expiryDate = new Date(now.getTime() + 86400000);  // 24小时
    
    SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    
    return Jwts.builder()
            .subject(String.valueOf(userId))     // 用户ID
            .claim("username", username)          // 用户名
            .issuedAt(now)                        // 签发时间
            .expiration(expiryDate)               // 过期时间
            .signWith(key)                        // 签名
            .compact();
}
```

**2. 验证Token**
```java
public static boolean validateToken(String token) {
    try {
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
        return true;
    } catch (Exception e) {
        return false;  // Token无效或过期
    }
}
```

**3. JWT拦截器**
```java
@Component
public class JwtInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) {
        // 1. 获取Token
        String token = request.getHeader("Authorization");
        if (token == null || token.isEmpty()) {
            response.setStatus(401);
            return false;
        }
        
        // 2. 去掉"Bearer "前缀
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }
        
        // 3. 验证Token
        if (!JwtUtil.validateToken(token)) {
            response.setStatus(401);
            return false;
        }
        
        // 4. 提取用户ID
        Long userId = JwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);
        
        return true;
    }
}
```

**4. 密码加密（BCrypt）**
```java
// 注册时加密
String encodedPassword = PasswordUtil.encode("123456");
// 结果：$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi

// 登录时验证
boolean matches = PasswordUtil.matches("123456", encodedPassword);
// 结果：true
```

---

## Redis缓存方案

### 缓存三大问题

#### 1. 缓存穿透

**问题：** 查询不存在的数据，缓存和DB都没有，每次都打到DB

**解决：** 缓存空值标记
```java
User user = userRepository.findById(id).orElse(null);
if (user == null) {
    // 缓存空值标记（5分钟）
    redisService.set(cacheKey, "NULL", 300);
    throw new RuntimeException("用户不存在");
}
```

#### 2. 缓存击穿

**问题：** 热点数据过期，大量请求同时打到DB

**解决：** 分布式锁（见前面"核心技术难点"）

#### 3. 缓存雪崩

**问题：** 大量缓存同时过期，DB压力暴增

**解决：** 随机过期时间
```java
// 基础60秒 + 随机0-30秒 = 60-90秒
long expireTime = 60 + new Random().nextInt(30);
redisService.set(cacheKey, user, expireTime);
```

### 完整缓存查询流程

```java
@GetMapping("/users/{id}")
public ApiResponse<User> getUser(@PathVariable Long id) {
    String cacheKey = "users:" + id;
    
    // 1. 检查缓存
    Object cached = redisService.get(cacheKey);
    if (cached != null) {
        if ("NULL".equals(cached)) {
            throw new RuntimeException("用户不存在");
        }
        return ApiResponse.success((User) cached);
    }
    
    // 2. 缓存未命中，使用分布式锁
    String lockKey = "lock:user:" + id;
    String lockValue = UUID.randomUUID().toString();
    
    if (redisService.tryLock(lockKey, lockValue, 10)) {
        try {
            // 双重检查缓存
            cached = redisService.get(cacheKey);
            if (cached != null) {
                return ApiResponse.success((User) cached);
            }
            
            // 查询数据库
            User user = userRepository.findById(id).orElse(null);
            
            if (user != null) {
                // 缓存数据（随机过期时间）
                long expireTime = 60 + new Random().nextInt(30);
                redisService.set(cacheKey, user, expireTime);
            } else {
                // 缓存空值标记
                redisService.set(cacheKey, "NULL", 300);
            }
            
            return ApiResponse.success(user);
        } finally {
            redisService.unLock(lockKey, lockValue);
        }
    } else {
        // 获取锁失败，等待后重试
        Thread.sleep(100);
        return getUser(id);
    }
}
```

---

## 高并发优化

### 优化清单

| 优化方案 | 实现方式 | 效果 |
|---------|---------|------|
| 缓存优化 | Redis缓存热点数据 | 响应时间降低100倍 |
| 分布式锁 | Redis SETNX | 防止缓存击穿 |
| 接口限流 | Redis计数器 | 防止恶意攻击 |
| 异步处理 | @Async + 线程池 | 响应时间降低50% |
| 连接池优化 | HikariCP参数调优 | 连接复用率提升 |
| 索引优化 | MySQL索引 | 查询速度提升10倍 |

---

## 关键代码片段

### 1. 统一响应格式

```java
public class ApiResponse<T> {
    private boolean success;
    private String message;
    private T data;
    private Integer code;
    
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "操作成功", data, 200);
    }
    
    public static <T> ApiResponse<T> error(String message, Integer code) {
        return new ApiResponse<>(false, message, null, code);
    }
}
```

### 2. 全局异常处理

```java
@RestControllerAdvice
public class GlobalExceptionHandler {
    
    @ExceptionHandler(RuntimeException.class)
    public ApiResponse<Void> handleRuntimeException(RuntimeException e) {
        return ApiResponse.error(e.getMessage(), 500);
    }
    
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ApiResponse<Void> handleValidationException(
            MethodArgumentNotValidException e) {
        String message = e.getBindingResult().getFieldError().getDefaultMessage();
        return ApiResponse.error(message, 400);
    }
}
```

### 3. 参数校验

```java
public class RegisterRequest {
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 50, message = "用户名长度必须在2-50之间")
    private String name;
    
    @NotNull(message = "年龄不能为空")
    @Min(value = 1, message = "年龄必须大于0")
    @Max(value = 150, message = "年龄不能超过150")
    private Integer age;
    
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;
    
    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度至少6位")
    private String password;
}
```

### 4. JPA查询

```java
public interface UserRepository extends JpaRepository<User, Long> {
    // 方法命名规则查询
    Optional<User> findByName(String name);
    Optional<User> findByEmail(String email);
    List<User> findByAgeGreaterThan(Integer age);
    
    // 自定义JPQL查询
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);
}
```

---

## 简历项目描述

### 简洁版（适合简历）

```
项目名称：企业级用户管理系统
项目时间：2024.10 - 2024.12
项目角色：后端开发工程师
技术栈：Spring Boot、MySQL、Redis、JWT、React

项目描述：
基于Spring Boot 3.3.4开发的企业级用户管理系统，实现了用户认证、权限管理、
缓存优化等功能。系统采用前后端分离架构，支持1000+并发用户访问。

核心功能：
• 用户认证：JWT Token无状态认证、BCrypt密码加密、邮箱验证码注册
• 权限管理：基于RBAC模型的权限控制，支持角色和权限的灵活分配
• 缓存优化：Redis缓存集成，解决缓存穿透、击穿、雪崩问题
• 高并发：接口限流、异步处理、分布式锁、数据库连接池优化

个人职责：
1. 负责后端架构设计和核心功能开发，完成20+个RESTful API接口
2. 设计并实现RBAC权限模型，使用自定义注解实现方法级权限控制
3. 实现Redis缓存优化方案，使用分布式锁解决缓存击穿问题
4. 开发JWT认证和权限拦截器，保证系统安全性
5. 实现接口限流和异步处理，接口响应时间降低50%

技术亮点：
• 使用Redis分布式锁解决缓存击穿问题，系统并发能力提升10倍
• 基于注解的权限控制，代码解耦，易于维护
• 固定窗口限流算法，成功防止接口被恶意调用

项目成果：
• 系统支持1000+并发用户访问，接口平均响应时间<100ms
• 缓存命中率达95%，数据库查询压力降低80%
• 代码规范，单元测试覆盖率达80%
```

---

## 面试回答模板

### 1分钟项目介绍

```
面试官您好，我来介绍一下这个项目。

这是一个企业级用户管理系统，我主要负责后端开发。项目使用Spring Boot框架，
实现了用户认证、权限管理、缓存优化等核心功能。

技术栈方面，后端使用Spring Boot + MySQL + Redis，前端使用React + Ant Design。

项目的核心亮点有三个：
1. 使用Redis分布式锁解决缓存击穿问题，系统并发能力提升10倍
2. 基于RBAC模型的权限管理，使用自定义注解实现方法级权限控制
3. 实现接口限流和异步处理，接口响应时间降低50%

项目目前稳定运行，支持1000+并发用户访问，接口平均响应时间小于100ms。
```

### 技术难点回答（3分钟）

```
项目中最大的技术难点是解决缓存击穿问题。

【问题背景】
在用户管理系统中，有些数据会被频繁访问，比如：
- 用户自己的详情信息（用户刷新页面时）
- 系统配置信息（所有用户都需要）
- 角色权限信息（每次权限校验都要查）

当这些数据的缓存过期时，如果有多个请求同时到达，它们都会发现缓存不存在，
然后同时去查询数据库，导致数据库压力瞬间增大。

【真实场景举例】
比如一个用户刷新页面，前端可能同时发起5个请求（获取用户信息、权限、配置等），
如果缓存刚好过期，这5个请求都会打到数据库。如果有100个用户同时刷新，
就是500个数据库查询，数据库压力会很大。

【解决方案】
我使用Redis分布式锁来解决。具体实现是：
1. 使用SETNX命令实现分布式锁
2. 第一个请求获取锁成功，查询数据库
3. 其他请求获取锁失败，等待100ms后重试
4. 第一个请求查询完成后，将数据存入缓存并释放锁
5. 其他请求重试时从缓存读取数据

【关键代码】
Boolean result = redisTemplate.opsForValue()
    .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);

【注意事项】
1. 锁必须设置过期时间，防止死锁
2. 释放锁时要验证lockValue，防止误删其他线程的锁
3. 使用双重检查，获取锁后再次检查缓存

【效果】
原本N个请求都要查数据库，现在只有1个请求查数据库，其他从缓存读取，
大大降低了数据库压力，提升了系统稳定性。
```

### 项目收获总结

```
通过这个项目，我收获了很多：

【技术方面】
1. 掌握了Spring Boot企业级开发的核心技术
2. 理解了高并发场景下的优化方案
3. 学会了如何设计和实现权限管理系统
4. 熟悉了Redis的各种使用场景

【能力方面】
1. 提升了问题分析和解决能力
2. 学会了如何进行技术选型
3. 提升了代码规范和文档编写能力
4. 学会了如何优化系统性能

【如果重新做】
1. 引入消息队列，实现异步解耦
2. 使用Elasticsearch实现全文检索
3. 引入监控系统，实时监控系统性能
4. 使用Docker容器化部署
```

---

## 快速参考

### 常用命令

```bash
# 启动MySQL
mysql -u root -p

# 启动Redis
redis-server

# Maven打包
mvn clean package

# 运行jar包
java -jar target/spring-boot-demo-0.0.1-SNAPSHOT.jar

# 前端启动
cd frontend-react
npm install
npm run dev
```

### 常用SQL

```sql
-- 查询用户及其角色
SELECT u.*, r.name as role_name 
FROM users u 
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.id = 1;

-- 查询角色及其权限
SELECT r.*, p.name as permission_name
FROM roles r
LEFT JOIN role_permissions rp ON r.id = rp.role_id
LEFT JOIN permissions p ON rp.permission_id = p.id
WHERE r.name = 'ADMIN';
```

### 常用Redis命令

```bash
# 查看所有key
KEYS *

# 查看key的值
GET users:1

# 查看key的过期时间
TTL users:1

# 删除key
DEL users:1

# 查看锁
GET lock:user:1

# 设置锁（SETNX）
SET lock:user:1 "value" EX 10 NX
```

---

## 数据库表结构

```sql
-- 用户表
CREATE TABLE users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    age INT NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    INDEX idx_name (name),
    INDEX idx_email (email)
);

-- 角色表
CREATE TABLE roles (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 权限表
CREATE TABLE permissions (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255)
);

-- 用户角色关联表
CREATE TABLE user_roles (
    user_id BIGINT NOT NULL,
    role_id BIGINT NOT NULL,
    PRIMARY KEY (user_id, role_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
);

-- 角色权限关联表
CREATE TABLE role_permissions (
    role_id BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);
```

---

## 项目配置

### application.properties

```properties
# 激活环境
spring.profiles.active=dev

# 应用端口
server.port=8080

# 应用名称
spring.application.name=spring-boot-demo
```

### application-dev.properties

```properties
# 数据库配置
spring.datasource.url=jdbc:mysql://localhost:3306/demo?useSSL=false&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=your_password
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# HikariCP连接池
spring.datasource.hikari.minimum-idle=5
spring.datasource.hikari.maximum-pool-size=20
spring.datasource.hikari.connection-timeout=30000

# JPA配置
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.format_sql=true

# Redis配置
spring.data.redis.host=localhost
spring.data.redis.port=6379
spring.data.redis.password=
spring.data.redis.database=0

# 日志配置
logging.level.org.example=DEBUG
logging.level.org.springframework.web=INFO
```

---

## 🎯 面试准备清单

### 技术准备
- [ ] 熟悉项目整体架构和技术栈
- [ ] 能够画出系统架构图
- [ ] 能够解释每个技术选型的理由
- [ ] 准备好核心代码片段
- [ ] 准备好数据库表设计
- [ ] 准备好API接口文档

### 问题准备
- [ ] 项目介绍（1分钟版本）
- [ ] 技术难点和解决方案（3个以上）
- [ ] 性能优化方案（3个以上）
- [ ] 遇到的问题和解决过程
- [ ] 项目收获和成长
- [ ] 如果重新做，会如何改进

### 代码准备
- [ ] 准备核心代码片段
- [ ] 准备数据库表结构
- [ ] 准备系统架构图
- [ ] 准备接口文档

---

## 📚 学习资源

### 官方文档
- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Spring Data JPA文档](https://spring.io/projects/spring-data-jpa)
- [Redis官方文档](https://redis.io/documentation)
- [JWT官方网站](https://jwt.io/)

### 推荐书籍
- 《Spring Boot实战》
- 《深入理解Spring Boot》
- 《Redis设计与实现》
- 《Java并发编程实战》

---

**文档版本**：2.0（面试速查版）  
**最后更新**：2025-01-04  
**适用场景**：面试准备、技术速查、项目复习

**祝你面试成功！** 💪

### 4.1 实体类（Entity）

实体类是数据库表的Java对象映射。

#### 用户实体（User.java）

```java
package org.example.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.util.Set;

/**
 * 用户实体类
 * 
 * @Entity：标记为JPA实体
 * @Table：指定数据库表名
 */
@Entity
@Table(name = "users")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class User {

    // ========== 字段定义 ==========
    
    /**
     * 主键ID
     * @Id：标记为主键
     * @GeneratedValue：自动生成策略（AUTO_INCREMENT）
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * 用户名
     * @NotBlank：不能为空（校验注解）
     * @Size：长度限制
     * @Column：列属性（nullable=不能为空，unique=唯一）
     */
    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 50, message = "用户名长度必须在 2-50 之间")
    @Column(nullable = false, unique = true)
    private String name;

    /**
     * 年龄
     * @NotNull：不能为null
     * @Min/@Max：数值范围限制
     */
    @NotNull(message = "年龄不能为空")
    @Min(value = 1, message = "年龄必须大于 0")
    @Max(value = 150, message = "年龄不能超过 150")
    @Column(nullable = false)
    private Integer age;

    /**
     * 邮箱
     * @Email：邮箱格式校验
     */
    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    @Column(nullable = false, unique = true)
    private String email;

    /**
     * 密码（加密后存储）
     */
    @Column(nullable = false)
    private String password;

    /**
     * 用户角色（多对多关系）
     * @ManyToMany：多对多关系
     * @JoinTable：中间表配置
     * FetchType.EAGER：立即加载（查询用户时同时加载角色）
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_roles",                          // 中间表名
        joinColumns = @JoinColumn(name = "user_id"),  // 当前表外键
        inverseJoinColumns = @JoinColumn(name = "role_id") // 关联表外键
    )
    private Set<Role> roles;

    // ========== 构造函数 ==========
    
    /**
     * 无参构造函数（JPA必需）
     */
    public User() {
    }

    // ========== Getter/Setter ==========
    
    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getAge() {
        return age;
    }

    public void setAge(Integer age) {
        this.age = age;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }
}
```

**知识点总结：**

| 注解 | 作用 | 示例 |
|------|------|------|
| `@Entity` | 标记为JPA实体 | `@Entity` |
| `@Table` | 指定表名 | `@Table(name = "users")` |
| `@Id` | 标记主键 | `@Id` |
| `@GeneratedValue` | 主键生成策略 | `@GeneratedValue(strategy = GenerationType.IDENTITY)` |
| `@Column` | 列属性 | `@Column(nullable = false, unique = true)` |
| `@ManyToMany` | 多对多关系 | `@ManyToMany(fetch = FetchType.EAGER)` |
| `@JoinTable` | 中间表配置 | `@JoinTable(name = "user_roles")` |

#### 角色实体（Role.java）

```java
package org.example.entity;

import jakarta.persistence.*;
import java.util.Set;

/**
 * 角色实体类
 */
@Entity
@Table(name = "roles")
public class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;  // ADMIN, USER

    private String description;

    /**
     * 角色拥有的权限（多对多）
     */
    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
        name = "role_permissions",
        joinColumns = @JoinColumn(name = "role_id"),
        inverseJoinColumns = @JoinColumn(name = "permission_id")
    )
    private Set<Permission> permissions;

    // 构造函数、Getter/Setter省略...
}
```

#### 权限实体（Permission.java）

```java
package org.example.entity;

import jakarta.persistence.*;

/**
 * 权限实体类
 */
@Entity
@Table(name = "permissions")
public class Permission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;  // USER_READ, USER_WRITE, USER_DELETE

    private String description;

    // 构造函数、Getter/Setter省略...
}
```

### 4.2 数据访问层（Repository）

Repository接口继承`JpaRepository`，自动提供CRUD方法。

```java
package org.example.repository;

import org.example.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

/**
 * 用户数据访问接口
 * 
 * 继承JpaRepository<实体类, 主键类型>
 * 自动提供：save(), findById(), findAll(), deleteById()等方法
 */
public interface UserRepository extends JpaRepository<User, Long> {

    // ========== 方法命名规则查询 ==========
    
    /**
     * 根据用户名查找
     * 方法名规则：findBy + 字段名
     * Spring Data JPA会自动实现
     */
    Optional<User> findByName(String name);

    /**
     * 根据邮箱查找
     */
    Optional<User> findByEmail(String email);

    /**
     * 查找年龄大于指定值的用户
     * 方法名规则：findBy + 字段名 + GreaterThan
     */
    List<User> findByAgeGreaterThan(Integer age);

    /**
     * 模糊查询用户名
     * 方法名规则：findBy + 字段名 + Containing
     */
    List<User> findByNameContaining(String name);

    // ========== 自定义JPQL查询 ==========
    
    /**
     * 查询年龄在指定范围内的用户
     * @Query：自定义JPQL查询
     * @Param：参数绑定
     */
    @Query("SELECT u FROM User u WHERE u.age BETWEEN :minAge AND :maxAge")
    List<User> findByAgeBetween(@Param("minAge") Integer minAge, 
                                 @Param("maxAge") Integer maxAge);

    /**
     * 分页查询所有用户
     */
    Page<User> findAll(Pageable pageable);

    /**
     * 查询用户及其角色（JOIN FETCH避免懒加载问题）
     */
    @Query("SELECT DISTINCT u FROM User u " +
           "LEFT JOIN FETCH u.roles r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE u.id = :id")
    Optional<User> findByIdWithRoles(@Param("id") Long id);

    /**
     * 查询所有用户并预加载角色
     */
    @Query("SELECT DISTINCT u FROM User u LEFT JOIN FETCH u.roles")
    List<User> findAllWithRoles();
}
```

**Repository方法命名规则：**

| 关键字 | 示例 | JPQL片段 |
|--------|------|----------|
| `findBy` | `findByName(String name)` | `WHERE name = ?` |
| `And` | `findByNameAndAge(String name, Integer age)` | `WHERE name = ? AND age = ?` |
| `Or` | `findByNameOrEmail(String name, String email)` | `WHERE name = ? OR email = ?` |
| `GreaterThan` | `findByAgeGreaterThan(Integer age)` | `WHERE age > ?` |
| `LessThan` | `findByAgeLessThan(Integer age)` | `WHERE age < ?` |
| `Between` | `findByAgeBetween(Integer min, Integer max)` | `WHERE age BETWEEN ? AND ?` |
| `Like` | `findByNameLike(String name)` | `WHERE name LIKE ?` |
| `Containing` | `findByNameContaining(String name)` | `WHERE name LIKE %?%` |
| `OrderBy` | `findByAgeOrderByNameAsc(Integer age)` | `WHERE age = ? ORDER BY name ASC` |

### 4.3 数据传输对象（DTO）

DTO用于前后端数据传输，避免直接暴露实体类。

#### 注册请求DTO

```java
package org.example.dto.request;

import jakarta.validation.constraints.*;

/**
 * 用户注册请求DTO
 */
public class RegisterRequest {

    @NotBlank(message = "用户名不能为空")
    @Size(min = 2, max = 50, message = "用户名长度必须在 2-50 之间")
    private String name;

    @NotNull(message = "年龄不能为空")
    private Integer age;

    @NotBlank(message = "邮箱不能为空")
    @Email(message = "邮箱格式不正确")
    private String email;

    @NotBlank(message = "密码不能为空")
    @Size(min = 6, message = "密码长度至少 6 位")
    private String password;

    @NotBlank(message = "验证码不能为空")
    @Size(min = 6, max = 6, message = "验证码必须是 6 位数字")
    private String verificationCode;

    // 构造函数、Getter/Setter省略...
}
```

#### 统一响应DTO

```java
package org.example.dto.response;

/**
 * 统一API响应格式
 * 
 * @param <T> 数据类型
 */
public class ApiResponse<T> {
    private boolean success;  // 是否成功
    private String message;   // 提示信息
    private T data;           // 返回数据
    private Integer code;     // 状态码

    // ========== 构造函数 ==========
    
    public ApiResponse(boolean success, String message, T data, Integer code) {
        this.success = success;
        this.message = message;
        this.data = data;
        this.code = code;
    }

    // ========== 静态工厂方法 ==========
    
    /**
     * 成功响应（带数据）
     */
    public static <T> ApiResponse<T> success(T data) {
        return new ApiResponse<>(true, "操作成功", data, 200);
    }

    /**
     * 成功响应（自定义消息）
     */
    public static <T> ApiResponse<T> success(String message, T data) {
        return new ApiResponse<>(true, message, data, 200);
    }

    /**
     * 失败响应
     */
    public static <T> ApiResponse<T> error(String message, Integer code) {
        return new ApiResponse<>(false, message, null, code);
    }

    // Getter/Setter省略...
}
```

**使用示例：**
```java
// 成功返回数据
return ApiResponse.success(user);

// 成功返回自定义消息
return ApiResponse.success("用户创建成功", user);

// 失败返回错误信息
return ApiResponse.error("用户不存在", 404);
```

---


## 5. 用户认证与JWT

### 5.1 什么是JWT？

JWT（JSON Web Token）是一种**无状态的认证方式**。

**传统Session认证 vs JWT认证：**

```
传统Session：
用户登录 → 服务器创建Session → 返回SessionID → 客户端保存Cookie
下次请求 → 携带Cookie → 服务器查找Session → 验证通过

JWT认证：
用户登录 → 服务器生成JWT Token → 返回Token → 客户端保存Token
下次请求 → 携带Token → 服务器验证Token → 验证通过
```

**JWT优势：**
- ✅ 无状态：服务器不需要存储Session
- ✅ 可扩展：适合分布式系统
- ✅ 跨域友好：不依赖Cookie

**JWT结构：**
```
Header.Payload.Signature

示例：
eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4ifQ.xxxxx

Header（头部）：
{
  "alg": "HS256",  // 加密算法
  "typ": "JWT"     // 类型
}

Payload（载荷）：
{
  "userId": 1,
  "username": "admin",
  "exp": 1640000000  // 过期时间
}

Signature（签名）：
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

### 5.2 JWT工具类实现

```java
package org.example.util;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import javax.crypto.SecretKey;
import java.util.Date;

/**
 * JWT工具类
 * 用于生成和验证JWT Token
 */
public class JwtUtil {

    // JWT密钥（至少32位，实际项目应从配置文件读取）
    private static final String SECRET_KEY = "mySecretKey123456789012345678901234567890";
    
    // Token过期时间（24小时）
    private static final long EXPIRATION_TIME = 86400000;

    /**
     * 生成JWT Token
     * 
     * @param userId 用户ID
     * @param username 用户名
     * @return JWT Token字符串
     */
    public static String generateToken(Long userId, String username) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + EXPIRATION_TIME);

        // 创建密钥
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());

        // 构建JWT
        return Jwts.builder()
                .subject(String.valueOf(userId))  // 主题（用户ID）
                .claim("username", username)       // 自定义声明（用户名）
                .issuedAt(now)                     // 签发时间
                .expiration(expiryDate)            // 过期时间
                .signWith(key)                      // 签名
                .compact();                         // 生成Token字符串
    }

    /**
     * 从Token中获取用户ID
     * 
     * @param token JWT Token
     * @return 用户ID
     */
    public static Long getUserIdFromToken(String token) {
        SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
        
        // 解析Token
        Claims claims = Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload();

        // 获取用户ID
        return Long.parseLong(claims.getSubject());
    }

    /**
     * 验证Token是否有效
     * 
     * @param token JWT Token
     * @return true=有效，false=无效
     */
    public static boolean validateToken(String token) {
        try {
            SecretKey key = Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
            
            // 解析Token（如果过期或签名错误会抛出异常）
            Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token);
            
            return true;
        } catch (Exception e) {
            // Token无效
            return false;
        }
    }
}
```

**使用示例：**
```java
// 1. 生成Token
String token = JwtUtil.generateToken(1L, "admin");
// 结果：eyJhbGciOiJIUzI1NiJ9.eyJ1c2VySWQiOjEsInVzZXJuYW1lIjoiYWRtaW4ifQ.xxxxx

// 2. 验证Token
boolean isValid = JwtUtil.validateToken(token);
// 结果：true

// 3. 获取用户ID
Long userId = JwtUtil.getUserIdFromToken(token);
// 结果：1
```

### 5.3 密码加密（BCrypt）

**为什么要加密密码？**
- ❌ 明文存储：数据库泄露后，密码直接暴露
- ✅ 加密存储：即使数据库泄露，密码也无法破解

**BCrypt特点：**
- 🔐 单向加密：无法解密，只能验证
- 🧂 自动加盐：每次加密结果不同
- ⏱️ 慢速算法：防止暴力破解

```java
package org.example.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;

/**
 * 密码加密工具类
 */
public class PasswordUtil {

    private static final PasswordEncoder encoder = new BCryptPasswordEncoder();

    /**
     * 加密密码
     * 
     * @param rawPassword 明文密码
     * @return 加密后的密码
     */
    public static String encode(String rawPassword) {
        return encoder.encode(rawPassword);
    }

    /**
     * 验证密码
     * 
     * @param rawPassword 明文密码
     * @param encodedPassword 加密后的密码
     * @return true=匹配，false=不匹配
     */
    public static boolean matches(String rawPassword, String encodedPassword) {
        return encoder.matches(rawPassword, encodedPassword);
    }
}
```

**使用示例：**
```java
// 1. 注册时加密密码
String rawPassword = "123456";
String encodedPassword = PasswordUtil.encode(rawPassword);
// 结果：$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi

// 2. 登录时验证密码
boolean matches = PasswordUtil.matches("123456", encodedPassword);
// 结果：true

// 3. 每次加密结果不同（自动加盐）
String encoded1 = PasswordUtil.encode("123456");
String encoded2 = PasswordUtil.encode("123456");
// encoded1 != encoded2，但都能验证通过
```

### 5.4 JWT拦截器

拦截器用于验证每个请求的Token。

```java
package org.example.interceptor;

import org.example.util.JwtUtil;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * JWT拦截器
 * 拦截所有需要认证的请求，验证Token
 */
@Component
public class JwtInterceptor implements HandlerInterceptor {

    /**
     * 请求处理前执行
     * 
     * @return true=放行，false=拦截
     */
    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) throws Exception {
        
        // 1. 如果是OPTIONS请求（CORS预检），直接放行
        if ("OPTIONS".equals(request.getMethod())) {
            return true;
        }

        // 2. 从请求头获取Token
        String token = request.getHeader("Authorization");

        // 3. 如果没有Token，返回401未授权
        if (token == null || token.isEmpty()) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"未登录，请先登录\",\"code\":401}"
            );
            return false;
        }

        // 4. 去掉"Bearer "前缀（如果有）
        if (token.startsWith("Bearer ")) {
            token = token.substring(7);
        }

        // 5. 验证Token
        if (!JwtUtil.validateToken(token)) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"Token无效或已过期\",\"code\":401}"
            );
            return false;
        }

        // 6. Token有效，提取用户ID并存入request
        Long userId = JwtUtil.getUserIdFromToken(token);
        request.setAttribute("userId", userId);

        // 7. 放行
        return true;
    }
}
```

### 5.5 配置拦截器

```java
package org.example.config;

import org.example.interceptor.JwtInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * Web配置类
 * 注册拦截器
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private JwtInterceptor jwtInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(jwtInterceptor)
                // 拦截哪些路径
                .addPathPatterns("/users/**", "/auth/change-password")
                // 排除哪些路径（不需要认证）
                .excludePathPatterns(
                    "/auth/register",
                    "/auth/login",
                    "/auth/send-verification-code"
                );
    }
}
```

**拦截器执行流程：**
```
客户端请求 → 拦截器preHandle() → Controller → 拦截器postHandle() → 返回响应
                ↓ false（拦截）
            返回401错误
```

### 5.6 认证控制器

```java
package org.example.controller;

import org.example.dto.request.LoginRequest;
import org.example.dto.request.RegisterRequest;
import org.example.dto.response.ApiResponse;
import org.example.dto.response.LoginResponse;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.example.util.JwtUtil;
import org.example.util.PasswordUtil;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

/**
 * 认证控制器
 * 处理注册、登录等认证相关请求
 */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserRepository userRepository;

    public AuthController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    /**
     * 用户注册
     * 
     * POST /auth/register
     * 请求体：{"name":"admin","age":25,"email":"admin@example.com","password":"123456"}
     */
    @PostMapping("/register")
    public ApiResponse<User> register(@Valid @RequestBody RegisterRequest request) {
        // 1. 检查用户名是否已存在
        if (userRepository.findByName(request.getName()).isPresent()) {
            throw new RuntimeException("用户名已存在");
        }

        // 2. 检查邮箱是否已存在
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("邮箱已被注册");
        }

        // 3. 创建用户
        User user = new User();
        user.setName(request.getName());
        user.setAge(request.getAge());
        user.setEmail(request.getEmail());
        
        // 4. 加密密码
        user.setPassword(PasswordUtil.encode(request.getPassword()));

        // 5. 保存到数据库
        User saved = userRepository.save(user);

        return ApiResponse.success("注册成功", saved);
    }

    /**
     * 用户登录
     * 
     * POST /auth/login
     * 请求体：{"username":"admin","password":"123456"}
     */
    @PostMapping("/login")
    public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
        // 1. 根据用户名查找用户
        User user = userRepository.findByName(request.getUsername())
                .orElseThrow(() -> new RuntimeException("用户名或密码错误"));

        // 2. 验证密码
        if (!PasswordUtil.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("用户名或密码错误");
        }

        // 3. 生成JWT Token
        String token = JwtUtil.generateToken(user.getId(), user.getName());

        // 4. 返回Token和用户信息
        LoginResponse response = new LoginResponse(token, user.getId(), user.getName());
        return ApiResponse.success("登录成功", response);
    }

    /**
     * 修改密码
     * 
     * PUT /auth/change-password
     * 请求头：Authorization: Bearer {token}
     * 请求体：{"oldPassword":"123456","newPassword":"654321"}
     */
    @PutMapping("/change-password")
    public ApiResponse<Void> changePassword(
            HttpServletRequest request,
            @Valid @RequestBody ChangePasswordRequest changePasswordRequest) {
        
        // 1. 从request获取用户ID（拦截器已设置）
        Long userId = (Long) request.getAttribute("userId");

        // 2. 查询用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 3. 验证旧密码
        if (!PasswordUtil.matches(changePasswordRequest.getOldPassword(), user.getPassword())) {
            throw new RuntimeException("旧密码错误");
        }

        // 4. 加密新密码
        String encodedNewPassword = PasswordUtil.encode(changePasswordRequest.getNewPassword());

        // 5. 更新密码
        user.setPassword(encodedNewPassword);
        userRepository.save(user);

        return ApiResponse.success("密码修改成功");
    }
}
```

**完整认证流程：**

```
1. 注册流程：
   前端 → POST /auth/register
   → 验证用户名/邮箱是否存在
   → 加密密码
   → 保存到数据库
   → 返回成功

2. 登录流程：
   前端 → POST /auth/login
   → 查找用户
   → 验证密码
   → 生成JWT Token
   → 返回Token

3. 访问受保护资源：
   前端 → GET /users/me（携带Token）
   → JWT拦截器验证Token
   → Token有效 → 提取用户ID
   → Controller处理请求
   → 返回数据
```

---


## 6. 权限管理RBAC

### 6.1 什么是RBAC？

RBAC（Role-Based Access Control）= **基于角色的访问控制**

**核心概念：**
```
用户（User） → 角色（Role） → 权限（Permission）

示例：
张三（用户） → 管理员（角色） → 删除用户（权限）
李四（用户） → 普通用户（角色） → 查看用户（权限）
```

**数据库设计：**
```
users表（用户）
  ↓
user_roles表（用户-角色关联）
  ↓
roles表（角色）
  ↓
role_permissions表（角色-权限关联）
  ↓
permissions表（权限）
```

### 6.2 自定义权限注解

```java
package org.example.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 权限检查注解
 * 用在Controller方法上，表示该方法需要特定权限
 * 
 * @Target(ElementType.METHOD)：只能用在方法上
 * @Retention(RetentionPolicy.RUNTIME)：运行时保留，可通过反射读取
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    /**
     * 需要的权限名称
     * 例如：USER_READ、USER_WRITE、USER_DELETE
     */
    String value();
}
```

**使用示例：**
```java
@DeleteMapping("/users/{id}")
@RequiresPermission("USER_DELETE")  // 需要USER_DELETE权限
public ApiResponse<Void> deleteUser(@PathVariable Long id) {
    // 删除用户逻辑
}
```

### 6.3 权限拦截器

```java
package org.example.interceptor;

import org.example.annotation.RequiresPermission;
import org.example.entity.Permission;
import org.example.entity.User;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * 权限检查拦截器
 * 检查用户是否有权限访问某个接口
 */
@Component
public class PermissionInterceptor implements HandlerInterceptor {

    @Autowired
    private UserRepository userRepository;

    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) throws Exception {
        
        // 1. 只处理方法级别的处理器
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;

        // 2. 检查方法上是否有@RequiresPermission注解
        RequiresPermission annotation = handlerMethod.getMethodAnnotation(RequiresPermission.class);
        if (annotation == null) {
            // 没有权限要求，直接放行
            return true;
        }

        // 3. 获取需要的权限名称
        String requiredPermission = annotation.value();

        // 4. 从request中获取用户ID（JWT拦截器已设置）
        Long userId = (Long) request.getAttribute("userId");
        if (userId == null) {
            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"未登录，请先登录\",\"code\":401}"
            );
            return false;
        }

        // 5. 查询用户及其角色和权限
        User user = userRepository.findByIdWithRoles(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 6. 检查用户是否有角色
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"用户没有分配角色\",\"code\":403}"
            );
            return false;
        }

        // 7. 获取用户的所有权限
        Set<String> userPermissions = user.getRoles().stream()
                .flatMap(role -> role.getPermissions().stream())
                .map(Permission::getName)
                .collect(Collectors.toSet());

        // 8. 检查用户是否有需要的权限
        if (!userPermissions.contains(requiredPermission)) {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"权限不足，需要权限：" + requiredPermission + "\",\"code\":403}"
            );
            return false;
        }

        // 9. 有权限，放行
        return true;
    }
}
```

**权限检查流程：**
```
1. 请求到达
2. JWT拦截器验证Token → 提取用户ID
3. 权限拦截器检查权限：
   - 获取方法上的@RequiresPermission注解
   - 查询用户的所有权限
   - 判断是否包含所需权限
   - 有权限 → 放行
   - 无权限 → 返回403
```

### 6.4 数据初始化

```java
package org.example.config;

import org.example.entity.Permission;
import org.example.entity.Role;
import org.example.repository.PermissionRepository;
import org.example.repository.RoleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.util.HashSet;
import java.util.Set;

/**
 * 数据初始化器
 * 应用启动时自动执行，初始化角色和权限
 * 
 * CommandLineRunner：Spring Boot启动后执行
 */
@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private PermissionRepository permissionRepository;

    @Override
    public void run(String... args) {
        // 初始化权限
        initPermissions();

        // 初始化角色
        initRoles();
    }

    /**
     * 初始化权限
     */
    private void initPermissions() {
        createPermissionIfNotExists("USER_READ", "查看用户");
        createPermissionIfNotExists("USER_WRITE", "创建/修改用户");
        createPermissionIfNotExists("USER_DELETE", "删除用户");
    }

    /**
     * 初始化角色
     */
    private void initRoles() {
        // 管理员角色（拥有所有权限）
        Role adminRole = createRoleIfNotExists("ADMIN", "管理员");
        Set<Permission> adminPermissions = new HashSet<>();
        adminPermissions.add(permissionRepository.findByName("USER_READ").get());
        adminPermissions.add(permissionRepository.findByName("USER_WRITE").get());
        adminPermissions.add(permissionRepository.findByName("USER_DELETE").get());
        adminRole.setPermissions(adminPermissions);
        roleRepository.save(adminRole);

        // 普通用户角色（只有查看权限）
        Role userRole = createRoleIfNotExists("USER", "普通用户");
        Set<Permission> userPermissions = new HashSet<>();
        userPermissions.add(permissionRepository.findByName("USER_READ").get());
        userRole.setPermissions(userPermissions);
        roleRepository.save(userRole);
    }

    /**
     * 创建权限（如果不存在）
     */
    private Permission createPermissionIfNotExists(String name, String description) {
        return permissionRepository.findByName(name)
                .orElseGet(() -> {
                    Permission permission = new Permission();
                    permission.setName(name);
                    permission.setDescription(description);
                    return permissionRepository.save(permission);
                });
    }

    /**
     * 创建角色（如果不存在）
     */
    private Role createRoleIfNotExists(String name, String description) {
        return roleRepository.findByName(name)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName(name);
                    role.setDescription(description);
                    return roleRepository.save(role);
                });
    }
}
```

**初始化后的数据：**
```
权限表（permissions）：
- USER_READ：查看用户
- USER_WRITE：创建/修改用户
- USER_DELETE：删除用户

角色表（roles）：
- ADMIN：管理员（拥有所有权限）
- USER：普通用户（只有查看权限）
```

### 6.5 角色管理控制器

```java
package org.example.controller;

import org.example.annotation.RequiresPermission;
import org.example.dto.response.ApiResponse;
import org.example.entity.Role;
import org.example.entity.User;
import org.example.repository.RoleRepository;
import org.example.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

/**
 * 角色管理控制器
 */
@RestController
@RequestMapping("/roles")
public class RoleController {

    @Autowired
    private RoleRepository roleRepository;

    @Autowired
    private UserRepository userRepository;

    /**
     * 获取所有角色
     * GET /roles
     */
    @GetMapping
    public ApiResponse<List<Role>> getAllRoles() {
        List<Role> roles = roleRepository.findAll();
        return ApiResponse.success(roles);
    }

    /**
     * 给用户分配角色
     * POST /roles/assign?userId=1&roleId=1
     */
    @PostMapping("/assign")
    @RequiresPermission("USER_WRITE")  // 需要USER_WRITE权限
    public ApiResponse<User> assignRole(
            @RequestParam Long userId,
            @RequestParam Long roleId) {

        // 1. 查询用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 2. 查询角色
        Role role = roleRepository.findById(roleId)
                .orElseThrow(() -> new RuntimeException("角色不存在"));

        // 3. 添加角色
        Set<Role> roles = user.getRoles();
        if (roles == null) {
            roles = new HashSet<>();
        }
        roles.add(role);
        user.setRoles(roles);

        // 4. 保存
        User updated = userRepository.save(user);

        return ApiResponse.success("角色分配成功", updated);
    }

    /**
     * 移除用户的角色
     * POST /roles/remove?userId=1&roleId=1
     */
    @PostMapping("/remove")
    @RequiresPermission("USER_WRITE")
    public ApiResponse<User> removeRole(
            @RequestParam Long userId,
            @RequestParam Long roleId) {

        // 1. 查询用户
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("用户不存在"));

        // 2. 移除角色
        Set<Role> roles = user.getRoles();
        if (roles != null) {
            roles.removeIf(role -> role.getId().equals(roleId));
            user.setRoles(roles);
        }

        // 3. 保存
        User updated = userRepository.save(user);

        return ApiResponse.success("角色移除成功", updated);
    }
}
```

---


## 7. Redis缓存优化

### 7.1 为什么需要缓存？

**问题场景：**
```
用户访问 /users/1 → 查询MySQL → 返回数据（耗时100ms）
1000个用户同时访问 → 1000次MySQL查询 → 数据库压力大
```

**使用缓存后：**
```
第1次访问 → 查询MySQL → 存入Redis → 返回数据（耗时100ms）
第2次访问 → 查询Redis → 返回数据（耗时1ms）
```

**缓存优势：**
- ⚡ 速度快：Redis内存读取，比MySQL快100倍
- 💪 减轻数据库压力：大部分请求走缓存
- 📈 提升并发能力：支持更多用户访问

### 7.2 Redis配置

```java
package org.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.serializer.GenericJackson2JsonRedisSerializer;
import org.springframework.data.redis.serializer.StringRedisSerializer;

/**
 * Redis配置类
 */
@Configuration
public class RedisConfig {

    @Bean
    public RedisTemplate<String, Object> redisTemplate(RedisConnectionFactory connectionFactory) {
        RedisTemplate<String, Object> template = new RedisTemplate<>();
        template.setConnectionFactory(connectionFactory);

        // 设置key的序列化方式（String）
        template.setKeySerializer(new StringRedisSerializer());
        template.setHashKeySerializer(new StringRedisSerializer());

        // 设置value的序列化方式（JSON）
        template.setValueSerializer(new GenericJackson2JsonRedisSerializer());
        template.setHashValueSerializer(new GenericJackson2JsonRedisSerializer());

        template.afterPropertiesSet();
        return template;
    }
}
```

**序列化说明：**
- Key序列化：String → 方便查看和调试
- Value序列化：JSON → 支持复杂对象存储

### 7.3 Redis服务类

```java
package org.example.service;

import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;
import java.util.Random;
import java.util.concurrent.TimeUnit;

/**
 * Redis服务类
 * 封装常用的Redis操作
 */
@Service
public class RedisService {

    private final RedisTemplate<String, Object> redisTemplate;

    public RedisService(RedisTemplate<String, Object> redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    /**
     * 存储数据（带过期时间）
     * 
     * @param key 键
     * @param value 值
     * @param timeout 过期时间（秒）
     */
    public void set(String key, Object value, long timeout) {
        redisTemplate.opsForValue().set(key, value, timeout, TimeUnit.SECONDS);
    }

    /**
     * 获取数据
     * 
     * @param key 键
     * @return 值（不存在返回null）
     */
    public Object get(String key) {
        return redisTemplate.opsForValue().get(key);
    }

    /**
     * 删除数据
     * 
     * @param key 键
     */
    public void delete(String key) {
        redisTemplate.delete(key);
    }

    /**
     * 检查key是否存在
     * 
     * @param key 键
     * @return true=存在，false=不存在
     */
    public Boolean hasKey(String key) {
        return redisTemplate.hasKey(key);
    }

    /**
     * 生成随机过期时间（防止缓存雪崩）
     * 
     * @param baseSeconds 基础时间（秒）
     * @param randomRange 随机范围（秒）
     * @return 基础时间 + 随机时间
     */
    public long getRandomExpireTime(long baseSeconds, long randomRange) {
        Random random = new Random();
        return baseSeconds + random.nextInt((int) randomRange);
    }
}
```

### 7.4 缓存三大问题

#### 问题1：缓存穿透

**什么是缓存穿透？**
```
用户查询一个不存在的数据（如id=999999）
→ Redis没有 → 查询MySQL → MySQL也没有 → 返回null
→ 下次查询 → Redis还是没有 → 又查MySQL...

恶意攻击：大量查询不存在的数据 → 缓存失效 → 数据库崩溃
```

**解决方案：缓存空值**
```java
// 查询用户
User user = userRepository.findById(id).orElse(null);

if (user == null) {
    // 用户不存在，缓存空值标记（5分钟）
    redisService.set(cacheKey, "NULL", 300);
    throw new RuntimeException("用户不存在");
}

// 用户存在，缓存数据
redisService.set(cacheKey, user, 60);
```

**读取时判断：**
```java
Object cached = redisService.get(cacheKey);

if (cached != null) {
    if ("NULL".equals(cached)) {
        // 空值标记，说明数据不存在
        throw new RuntimeException("用户不存在");
    }
    // 正常数据
    return (User) cached;
}
```

#### 问题2：缓存击穿

**什么是缓存击穿？**
```
热点数据（如首页数据）过期
→ 1000个请求同时到达
→ Redis都没有
→ 1000个请求同时查MySQL
→ 数据库压力瞬间暴增
```

**解决方案：分布式锁**
```java
/**
 * 分布式锁（SETNX + EXPIRE）
 * 
 * @param key 锁的key
 * @param value 锁的值（用于释放锁时验证）
 * @param timeout 锁的过期时间（秒）
 * @return true=获取成功，false=获取失败
 */
public boolean tryLock(String key, String value, long timeout) {
    Boolean result = redisTemplate.opsForValue()
            .setIfAbsent(key, value, timeout, TimeUnit.SECONDS);
    return Boolean.TRUE.equals(result);
}

/**
 * 释放锁
 * 
 * @param key 锁的key
 * @param value 锁的值（必须匹配才能释放）
 */
public void unLock(String key, String value) {
    Object lockValue = redisTemplate.opsForValue().get(key);
    if (value.equals(lockValue)) {
        redisTemplate.delete(key);
    }
}
```

**使用分布式锁：**
```java
String lockKey = "lock:user:" + id;
String lockValue = UUID.randomUUID().toString();

// 尝试获取锁
if (redisService.tryLock(lockKey, lockValue, 10)) {
    try {
        // 双重检查缓存
        Object cached = redisService.get(cacheKey);
        if (cached != null) {
            return (User) cached;
        }

        // 查询数据库
        User user = userRepository.findById(id).orElse(null);

        // 存入缓存
        redisService.set(cacheKey, user, 60);

        return user;
    } finally {
        // 释放锁
        redisService.unLock(lockKey, lockValue);
    }
} else {
    // 获取锁失败，等待后重试
    Thread.sleep(100);
    return getUser(id);  // 递归重试
}
```

**分布式锁流程：**
```
请求1到达 → 获取锁成功 → 查询数据库 → 存入缓存 → 释放锁
请求2到达 → 获取锁失败 → 等待100ms → 重试 → 从缓存读取
请求3到达 → 获取锁失败 → 等待100ms → 重试 → 从缓存读取
```

#### 问题3：缓存雪崩

**什么是缓存雪崩？**
```
大量缓存同时过期（如都设置60秒）
→ 60秒后，所有缓存同时失效
→ 大量请求同时查MySQL
→ 数据库崩溃
```

**解决方案：随机过期时间**
```java
// 基础过期时间60秒，随机增加0-30秒
long expireTime = redisService.getRandomExpireTime(60, 30);
// 结果：60-90秒之间随机

redisService.set(cacheKey, user, expireTime);
```

**效果：**
```
用户1的缓存：65秒后过期
用户2的缓存：72秒后过期
用户3的缓存：88秒后过期
→ 缓存不会同时过期，数据库压力分散
```

### 7.5 完整的缓存查询示例

```java
@GetMapping("/users/{id}")
public ApiResponse<User> getUser(@PathVariable Long id) {
    String cacheKey = "users:" + id;
    
    // 1. 检查缓存
    Object cached = redisService.get(cacheKey);
    if (cached != null) {
        // 1.1 空值标记
        if ("NULL".equals(cached)) {
            throw new RuntimeException("用户不存在");
        }
        // 1.2 正常数据
        return ApiResponse.success((User) cached);
    }

    // 2. 缓存未命中，使用分布式锁
    String lockKey = "lock:user:query:" + id;
    String lockValue = UUID.randomUUID().toString();

    if (redisService.tryLock(lockKey, lockValue, 10)) {
        try {
            // 2.1 双重检查缓存
            Object cachedAgain = redisService.get(cacheKey);
            if (cachedAgain != null) {
                if ("NULL".equals(cachedAgain)) {
                    throw new RuntimeException("用户不存在");
                }
                return ApiResponse.success((User) cachedAgain);
            }

            // 2.2 查询数据库
            Optional<User> userOptional = userRepository.findById(id);

            if (userOptional.isPresent()) {
                // 2.3 用户存在，缓存数据（随机过期时间）
                User user = userOptional.get();
                long expireTime = redisService.getRandomExpireTime(60, 30);
                redisService.set(cacheKey, user, expireTime);
                return ApiResponse.success(user);
            } else {
                // 2.4 用户不存在，缓存空值标记
                redisService.set(cacheKey, "NULL", 300);
                throw new RuntimeException("用户不存在");
            }
        } finally {
            // 2.5 释放锁
            redisService.unLock(lockKey, lockValue);
        }
    } else {
        // 3. 获取锁失败，等待后重试
        try {
            Thread.sleep(100);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
        
        // 3.1 重试：从缓存读取
        Object retryCached = redisService.get(cacheKey);
        if (retryCached != null) {
            if ("NULL".equals(retryCached)) {
                throw new RuntimeException("用户不存在");
            }
            return ApiResponse.success((User) retryCached);
        }
        
        throw new RuntimeException("系统繁忙，请稍后重试");
    }
}
```

**缓存策略总结：**

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 缓存穿透 | 查询不存在的数据 | 缓存空值标记 |
| 缓存击穿 | 热点数据过期 | 分布式锁 |
| 缓存雪崩 | 大量缓存同时过期 | 随机过期时间 |

---


## 8. 高并发解决方案

### 8.1 接口限流

**什么是限流？**
```
防止恶意攻击或用户频繁请求
例如：1分钟内最多调用10次接口
```

#### 自定义限流注解

```java
package org.example.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * 限流注解
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RateLimit {
    int limit() default 10;           // 限制次数，默认10次
    long window() default 60;         // 时间窗口（秒），默认60秒
    String keyPrefix() default "api"; // key前缀
}
```

#### 限流拦截器

```java
package org.example.interceptor;

import org.example.annotation.RateLimit;
import org.example.service.RedisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

/**
 * 限流拦截器
 */
@Component
public class RateLimitInterceptor implements HandlerInterceptor {

    @Autowired
    private RedisService redisService;

    @Override
    public boolean preHandle(HttpServletRequest request, 
                            HttpServletResponse response, 
                            Object handler) throws Exception {
        
        if (!(handler instanceof HandlerMethod)) {
            return true;
        }

        HandlerMethod handlerMethod = (HandlerMethod) handler;
        RateLimit annotation = handlerMethod.getMethodAnnotation(RateLimit.class);
        
        if (annotation == null) {
            return true;
        }

        // 获取限流参数
        int limit = annotation.limit();
        long window = annotation.window();
        String keyPrefix = annotation.keyPrefix();

        // 生成限流key
        String rateLimitKey;
        Long userId = (Long) request.getAttribute("userId");
        if (userId != null) {
            // 已登录：按用户ID限流
            rateLimitKey = keyPrefix + ":user:" + userId;
        } else {
            // 未登录：按IP限流
            String ip = request.getRemoteAddr();
            rateLimitKey = keyPrefix + ":ip:" + ip;
        }

        // 检查是否超过限制
        boolean allowed = redisService.tryRateLimit(rateLimitKey, limit, window);

        if (!allowed) {
            // 超过限制，拒绝请求
            response.setStatus(429); // 429 Too Many Requests
            response.setContentType("application/json;charset=UTF-8");
            response.getWriter().write(
                "{\"success\":false,\"message\":\"请求过于频繁，请稍后再试\",\"code\":429}"
            );
            return false;
        }

        return true;
    }
}
```

#### Redis限流实现

```java
/**
 * 固定窗口限流算法
 * 
 * @param key 限流key
 * @param limit 限制次数
 * @param windowSeconds 时间窗口（秒）
 * @return true=允许，false=拒绝
 */
public boolean tryRateLimit(String key, int limit, long windowSeconds) {
    Object countObj = redisTemplate.opsForValue().get(key);
    int count = countObj == null ? 0 : Integer.parseInt(countObj.toString());
    
    if (count >= limit) {
        // 超过限制
        return false;
    }
    
    if (count == 0) {
        // 第一次请求，设置过期时间
        redisTemplate.opsForValue().set(key, 1, windowSeconds, TimeUnit.SECONDS);
    } else {
        // 计数器+1
        redisTemplate.opsForValue().increment(key);
    }
    
    return true;
}
```

**使用示例：**
```java
@PostMapping("/auth/login")
@RateLimit(limit = 5, window = 60, keyPrefix = "login")  // 1分钟最多5次
public ApiResponse<LoginResponse> login(@Valid @RequestBody LoginRequest request) {
    // 登录逻辑
}
```

**限流效果：**
```
第1次请求 → 计数器=1 → 允许
第2次请求 → 计数器=2 → 允许
...
第5次请求 → 计数器=5 → 允许
第6次请求 → 计数器=5（已达上限） → 拒绝（返回429）
60秒后 → 计数器过期 → 重新开始
```

### 8.2 异步处理

**为什么需要异步？**
```
同步处理：
用户请求 → 处理业务（3秒） → 记录日志（3秒） → 返回响应
总耗时：6秒

异步处理：
用户请求 → 处理业务（3秒） → 返回响应
                          ↓
                    异步记录日志（3秒）
总耗时：3秒
```

#### 异步配置

```java
package org.example.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;
import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * 异步任务配置
 */
@Configuration
@EnableAsync  // 启用异步支持
public class AsyncConfig {

    /**
     * 配置线程池
     */
    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        
        // 核心线程数（常驻线程）
        executor.setCorePoolSize(5);
        
        // 最大线程数（当队列满了，会创建新线程，最多到这个数）
        executor.setMaxPoolSize(10);
        
        // 队列容量（任务先放到队列，队列满了才创建新线程）
        executor.setQueueCapacity(100);
        
        // 线程名前缀（方便调试）
        executor.setThreadNamePrefix("async-task-");
        
        // 拒绝策略：当线程池满了，新任务由调用线程执行
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        
        // 初始化
        executor.initialize();
        
        return executor;
    }
}
```

**线程池参数说明：**
```
核心线程数=5：
- 任务1-5 → 立即执行（创建5个线程）

队列容量=100：
- 任务6-105 → 放入队列等待

最大线程数=10：
- 任务106+ → 队列满了，创建新线程（最多10个）

拒绝策略：
- 线程池满了（10个线程+100个队列） → 由调用线程执行
```

#### 异步服务

```java
package org.example.service;

import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * 异步服务
 */
@Service
public class AsyncService {

    /**
     * 异步记录日志
     * 
     * @Async：标记为异步方法
     * "taskExecutor"：指定使用的线程池
     */
    @Async("taskExecutor")
    public void recordLog(Long userId) {
        System.out.println("🚀 异步任务开始，线程：" + Thread.currentThread().getName());
        
        try {
            // 模拟耗时操作
            Thread.sleep(3000);
            System.out.println("✅ 记录日志：用户ID=" + userId);
        } catch (InterruptedException e) {
            e.printStackTrace();
        }
    }
}
```

**使用异步：**
```java
@GetMapping("/users/{id}")
public ApiResponse<User> getUser(@PathVariable Long id) {
    // 查询用户
    User user = userRepository.findById(id).orElse(null);
    
    // 异步记录日志（不阻塞主线程）
    asyncService.recordLog(id);
    
    // 立即返回
    return ApiResponse.success(user);
}
```

**执行流程：**
```
主线程：
1. 查询用户（100ms）
2. 调用异步方法（立即返回）
3. 返回响应
总耗时：100ms

异步线程：
1. 等待3秒
2. 记录日志
总耗时：3秒（不影响主线程）
```

### 8.3 数据库连接池优化

**什么是连接池？**
```
没有连接池：
每次查询 → 创建连接 → 执行SQL → 关闭连接
创建和关闭连接很耗时（100ms）

有连接池：
第1次查询 → 创建连接 → 执行SQL → 放回连接池
第2次查询 → 从连接池取连接 → 执行SQL → 放回连接池
复用连接，节省时间
```

**HikariCP配置（application-dev.properties）：**
```properties
# 连接池类型（Spring Boot默认使用HikariCP）
spring.datasource.type=com.zaxxer.hikari.HikariDataSource

# 连接池名称
spring.datasource.hikari.pool-name=SpringBootDemoHikariPool

# 最小空闲连接数（常驻连接）
spring.datasource.hikari.minimum-idle=5

# 最大连接数（连接池最多创建多少个连接）
spring.datasource.hikari.maximum-pool-size=20

# 连接超时时间（毫秒，获取连接的最大等待时间）
spring.datasource.hikari.connection-timeout=30000

# 空闲连接最大存活时间（毫秒，超过这个时间的空闲连接会被释放）
spring.datasource.hikari.idle-timeout=600000

# 连接最大存活时间（毫秒，超过这个时间的连接会被释放并重建）
spring.datasource.hikari.max-lifetime=1800000

# 连接测试查询（验证连接是否有效）
spring.datasource.hikari.connection-test-query=SELECT 1

# 连接泄漏检测阈值（毫秒，超过这个时间未归还的连接会被警告）
spring.datasource.hikari.leak-detection-threshold=60000
```

**连接池工作流程：**
```
初始化：
- 创建5个连接（minimum-idle=5）

请求1-5到达：
- 从连接池取连接 → 执行SQL → 归还连接

请求6-20到达：
- 连接池不够 → 创建新连接（最多20个）

请求21到达：
- 连接池满了 → 等待（最多30秒）
- 超时 → 抛出异常

空闲10分钟：
- 释放多余的空闲连接（保留5个）
```

---


## 9. 邮件发送功能

### 9.1 邮件配置

**application-dev.properties：**
```properties
# QQ邮箱配置
spring.mail.host=smtp.qq.com
spring.mail.port=587
spring.mail.username=your_email@qq.com
spring.mail.password=your_auth_code  # 授权码（不是QQ密码）
spring.mail.properties.mail.smtp.auth=true
spring.mail.properties.mail.smtp.starttls.enable=true
spring.mail.properties.mail.smtp.starttls.required=true
```

**如何获取QQ邮箱授权码？**
```
1. 登录QQ邮箱
2. 设置 → 账户 → POP3/IMAP/SMTP/Exchange/CardDAV/CalDAV服务
3. 开启"POP3/SMTP服务"
4. 生成授权码（16位）
5. 将授权码填入配置文件
```

### 9.2 邮件服务

```java
package org.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

/**
 * 邮件服务
 */
@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    /**
     * 发送验证码邮件
     * 
     * @param toEmail 收件人邮箱
     * @param code 验证码
     * @return true=发送成功，false=发送失败
     */
    public boolean sendVerificationCode(String toEmail, String code) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(toEmail);
            message.setSubject("【Spring Boot Demo】邮箱验证码");
            message.setText(String.format(
                "您的验证码是：%s\n\n" +
                "验证码有效期为 5 分钟，请勿泄露给他人。\n\n" +
                "如果这不是您的操作，请忽略此邮件。",
                code
            ));

            mailSender.send(message);
            return true;
        } catch (Exception e) {
            e.printStackTrace();
            return false;
        }
    }
}
```

### 9.3 验证码服务

```java
package org.example.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.Random;

/**
 * 验证码服务
 */
@Service
public class VerificationCodeService {

    @Autowired
    private RedisService redisService;

    @Autowired
    private EmailService emailService;

    // 验证码有效期（秒）
    private static final long CODE_EXPIRE_TIME = 300; // 5分钟

    // 验证码长度
    private static final int CODE_LENGTH = 6;

    /**
     * 生成6位数字验证码
     */
    private String generateCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    /**
     * 发送验证码到邮箱
     * 
     * @param email 邮箱地址
     * @return true=发送成功，false=发送失败
     */
    public boolean sendCode(String email) {
        // 1. 生成验证码
        String code = generateCode();
        
        // 2. 存储到Redis（key: verification:code:email, value: code, expire: 5分钟）
        String key = "verification:code:" + email;
        redisService.set(key, code, CODE_EXPIRE_TIME);
        
        // 3. 发送邮件
        boolean sent = emailService.sendVerificationCode(email, code);
        
        if (!sent) {
            // 发送失败，删除Redis中的验证码
            redisService.delete(key);
        }
        
        return sent;
    }

    /**
     * 验证验证码
     * 
     * @param email 邮箱地址
     * @param code 用户输入的验证码
     * @return true=验证通过，false=验证失败
     */
    public boolean verifyCode(String email, String code) {
        String key = "verification:code:" + email;
        Object storedCode = redisService.get(key);
        
        if (storedCode == null) {
            // 验证码不存在或已过期
            return false;
        }
        
        if (!code.equals(storedCode.toString())) {
            // 验证码错误
            return false;
        }
        
        // 验证成功后，删除验证码（防止重复使用）
        redisService.delete(key);
        return true;
    }

    /**
     * 检查邮箱是否已发送验证码（用于限流）
     * 
     * @param email 邮箱地址
     * @return true=已发送（60秒内），false=未发送
     */
    public boolean hasSentCode(String email) {
        String key = "verification:sent:" + email;
        return redisService.hasKey(key);
    }

    /**
     * 记录发送时间（用于限流，60秒内只能发送一次）
     * 
     * @param email 邮箱地址
     */
    public void recordSentTime(String email) {
        String key = "verification:sent:" + email;
        redisService.set(key, "1", 60); // 60秒内不能重复发送
    }
}
```

### 9.4 注册流程（带验证码）

```java
/**
 * 发送验证码
 * POST /auth/send-verification-code
 * 请求体：{"email":"user@example.com"}
 */
@PostMapping("/send-verification-code")
@RateLimit(limit = 5, window = 60, keyPrefix = "send-code")  // 1分钟最多5次
public ApiResponse<Void> sendVerificationCode(@RequestBody Map<String, String> request) {
    String email = request.get("email");

    // 1. 验证邮箱格式
    if (!email.matches("^[A-Za-z0-9+_.-]+@(.+)$")) {
        throw new RuntimeException("邮箱格式不正确");
    }

    // 2. 检查邮箱是否已被注册
    if (userRepository.findByEmail(email).isPresent()) {
        throw new RuntimeException("该邮箱已被注册");
    }

    // 3. 检查是否在60秒内已发送过（限流）
    if (verificationCodeService.hasSentCode(email)) {
        throw new RuntimeException("验证码发送过于频繁，请60秒后再试");
    }

    // 4. 发送验证码
    boolean sent = verificationCodeService.sendCode(email);
    if (!sent) {
        throw new RuntimeException("验证码发送失败，请稍后重试");
    }

    // 5. 记录发送时间（用于限流）
    verificationCodeService.recordSentTime(email);

    return ApiResponse.success("验证码已发送到您的邮箱，请查收");
}

/**
 * 用户注册
 * POST /auth/register
 * 请求体：{
 *   "name":"admin",
 *   "age":25,
 *   "email":"user@example.com",
 *   "password":"123456",
 *   "verificationCode":"123456"
 * }
 */
@PostMapping("/register")
public ApiResponse<User> register(@Valid @RequestBody RegisterRequest request) {
    // 1. 验证验证码
    if (!verificationCodeService.verifyCode(request.getEmail(), request.getVerificationCode())) {
        throw new RuntimeException("验证码错误或已过期，请重新获取");
    }

    // 2. 检查用户名是否已存在
    if (userRepository.findByName(request.getName()).isPresent()) {
        throw new RuntimeException("用户名已存在");
    }

    // 3. 检查邮箱是否已存在
    if (userRepository.findByEmail(request.getEmail()).isPresent()) {
        throw new RuntimeException("邮箱已被注册");
    }

    // 4. 创建用户
    User user = new User();
    user.setName(request.getName());
    user.setAge(request.getAge());
    user.setEmail(request.getEmail());
    user.setPassword(PasswordUtil.encode(request.getPassword()));

    // 5. 分配默认角色
    Role userRole = roleRepository.findByName("USER")
            .orElseThrow(() -> new RuntimeException("默认角色不存在"));
    user.setRoles(new HashSet<>(Set.of(userRole)));

    // 6. 保存到数据库
    User saved = userRepository.save(user);

    return ApiResponse.success("注册成功", saved);
}
```

**注册流程图：**
```
1. 用户输入邮箱 → 点击"发送验证码"
   ↓
2. 后端生成6位验证码 → 存入Redis（5分钟过期）
   ↓
3. 发送邮件到用户邮箱
   ↓
4. 用户收到邮件 → 输入验证码
   ↓
5. 用户填写注册信息 → 提交注册
   ↓
6. 后端验证验证码 → 创建用户 → 返回成功
```

---


## 10. 前端React开发

### 10.1 前端技术栈

```
React 19          # UI框架
Ant Design 6      # UI组件库
Axios             # HTTP客户端
React Router 7    # 路由管理
Vite 7            # 构建工具
```

### 10.2 API服务封装

```javascript
// src/services/api.js
import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:8080',  // 后端地址
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器：处理错误
api.interceptors.response.use(
  (response) => {
    return response.data;  // 直接返回data
  },
  (error) => {
    if (error.response) {
      // 401未授权，清除token并跳转登录
      if (error.response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      return Promise.reject(error.response.data || error.message);
    }
    return Promise.reject(error.message);
  }
);

// 认证相关API
export const authAPI = {
  // 发送验证码
  sendVerificationCode: (email) => 
    api.post('/auth/send-verification-code', { email }),
  
  // 注册
  register: (data) => 
    api.post('/auth/register', data),
  
  // 登录
  login: (data) => 
    api.post('/auth/login', data),
  
  // 修改密码
  changePassword: (data) => 
    api.put('/auth/change-password', data),
};

// 用户相关API
export const userAPI = {
  // 获取当前用户
  getCurrentUser: () => 
    api.get('/users/me'),
  
  // 获取用户列表
  listUsers: () => 
    api.get('/users'),
  
  // 获取单个用户
  getUser: (id) => 
    api.get(`/users/${id}`),
  
  // 创建用户
  createUser: (data) => 
    api.post('/users', data),
  
  // 更新用户
  updateUser: (id, data) => 
    api.put(`/users/${id}`, data),
  
  // 删除用户
  deleteUser: (id) => 
    api.delete(`/users/${id}`),
};

export default api;
```

### 10.3 认证上下文（AuthContext）

```javascript
// src/contexts/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import { authAPI, userAPI } from '../services/api';

const AuthContext = createContext(null);

// 自定义Hook：使用认证上下文
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// 认证提供者组件
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token') || '');

  // 初始化：检查是否有token，如果有则获取用户信息
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        setToken(savedToken);
        try {
          const response = await userAPI.getCurrentUser();
          if (response.success) {
            setUser(response.data);
          }
        } catch (error) {
          // Token无效，清除
          localStorage.removeItem('token');
          setToken('');
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // 登录
  const login = async (username, password) => {
    try {
      const response = await authAPI.login({ username, password });
      if (response.success && response.data.token) {
        const newToken = response.data.token;
        setToken(newToken);
        localStorage.setItem('token', newToken);
        
        // 获取用户信息
        const userResponse = await userAPI.getCurrentUser();
        if (userResponse.success) {
          setUser(userResponse.data);
        }
        
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || '登录失败' 
      };
    }
  };

  // 注册
  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      if (response.success) {
        return { success: true, data: response.data };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.message || '注册失败' 
      };
    }
  };

  // 登出
  const logout = () => {
    setUser(null);
    setToken('');
    localStorage.removeItem('token');
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!token,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
```

### 10.4 登录页面

```javascript
// src/pages/Login.jsx
import { Form, Input, Button, Card, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

const Login = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogin = async (values) => {
    setLoading(true);
    try {
      const result = await login(values.username, values.password);
      if (result.success) {
        message.success('登录成功');
        navigate('/');
      } else {
        message.error(result.message || '登录失败');
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }}>
      <Card style={{ width: 400 }}>
        <h2 style={{ textAlign: 'center' }}>用户登录</h2>
        <Form
          form={form}
          name="login"
          onFinish={handleLogin}
          layout="vertical"
        >
          <Form.Item
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="用户名"
            />
          </Form.Item>
          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="密码"
            />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default Login;
```

### 10.5 用户列表页面

```javascript
// src/pages/UserList.jsx
import { useState, useEffect } from 'react';
import { Table, Button, Space, Popconfirm, message } from 'antd';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { userAPI } from '../services/api';

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // 获取用户列表
  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userAPI.listUsers();
      if (response.success) {
        setUsers(response.data || []);
      }
    } catch (error) {
      message.error('获取用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // 删除用户
  const handleDelete = async (id) => {
    try {
      const response = await userAPI.deleteUser(id);
      if (response.success) {
        message.success('删除用户成功');
        fetchUsers();
      } else {
        message.error(response.message || '删除用户失败');
      }
    } catch (error) {
      message.error('删除用户失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '年龄',
      dataIndex: 'age',
      key: 'age',
      width: 100,
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个用户吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>用户管理</h2>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={loading}
        pagination={{
          pageSize: 10,
          showTotal: (total) => `共 ${total} 条`,
        }}
      />
    </div>
  );
};

export default UserList;
```

### 10.6 前后端交互流程

```
1. 登录流程：
   前端 → POST /auth/login（用户名、密码）
   后端 → 验证密码 → 生成JWT Token
   前端 → 保存Token到localStorage
   前端 → 跳转到首页

2. 访问受保护资源：
   前端 → GET /users（携带Token）
   后端 → JWT拦截器验证Token
   后端 → 返回用户列表
   前端 → 显示数据

3. Token过期：
   前端 → GET /users（携带过期Token）
   后端 → 返回401
   前端 → 响应拦截器捕获401 → 清除Token → 跳转登录页
```

---

## 11. 项目部署

### 11.1 后端打包

```bash
# 进入后端项目目录
cd spring-boot-demo

# Maven打包
mvn clean package

# 生成的jar包位置
target/spring-boot-demo-0.0.1-SNAPSHOT.jar
```

### 11.2 运行jar包

```bash
# 运行jar包
java -jar target/spring-boot-demo-0.0.1-SNAPSHOT.jar

# 指定环境
java -jar target/spring-boot-demo-0.0.1-SNAPSHOT.jar --spring.profiles.active=prod

# 指定端口
java -jar target/spring-boot-demo-0.0.1-SNAPSHOT.jar --server.port=8081
```

### 11.3 前端打包

```bash
# 进入前端项目目录
cd frontend-react

# 安装依赖
npm install

# 打包
npm run build

# 生成的文件位置
dist/
```

### 11.4 部署到服务器

```bash
# 1. 上传jar包到服务器
scp target/spring-boot-demo-0.0.1-SNAPSHOT.jar user@server:/app/

# 2. 上传前端dist目录到服务器
scp -r dist/ user@server:/var/www/html/

# 3. 在服务器上运行后端
nohup java -jar /app/spring-boot-demo-0.0.1-SNAPSHOT.jar > /app/logs/app.log 2>&1 &

# 4. 配置Nginx代理前端
# /etc/nginx/sites-available/default
server {
    listen 80;
    server_name your-domain.com;

    # 前端静态文件
    location / {
        root /var/www/html/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端API代理
    location /api/ {
        proxy_pass http://localhost:8080/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---


## 12. 学习总结

### 12.1 核心知识点回顾

#### 1. Spring Boot基础

**掌握内容：**
- ✅ Spring Boot项目结构
- ✅ 自动配置原理
- ✅ 依赖注入（@Autowired）
- ✅ 配置文件管理（application.properties）
- ✅ Maven依赖管理

**关键代码：**
```java
@SpringBootApplication  // 启动类注解
@RestController         // REST控制器
@Service                // 服务层
@Repository             // 数据访问层
@Configuration          // 配置类
```

#### 2. 数据库与JPA

**掌握内容：**
- ✅ 实体类映射（@Entity、@Table）
- ✅ 主键生成策略（@Id、@GeneratedValue）
- ✅ 关系映射（@ManyToMany、@OneToMany）
- ✅ Repository接口（JpaRepository）
- ✅ 方法命名规则查询
- ✅ 自定义JPQL查询（@Query）

**关键代码：**
```java
@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToMany(fetch = FetchType.EAGER)
    private Set<Role> roles;
}

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByName(String name);
}
```

#### 3. 用户认证与JWT

**掌握内容：**
- ✅ JWT Token生成和验证
- ✅ BCrypt密码加密
- ✅ 拦截器实现（HandlerInterceptor）
- ✅ Token在请求头中传递
- ✅ 登录、注册、修改密码流程

**关键代码：**
```java
// 生成Token
String token = JwtUtil.generateToken(userId, username);

// 加密密码
String encoded = PasswordUtil.encode(password);

// 拦截器验证Token
@Component
public class JwtInterceptor implements HandlerInterceptor {
    @Override
    public boolean preHandle(...) {
        // 验证Token
    }
}
```

#### 4. 权限管理RBAC

**掌握内容：**
- ✅ RBAC模型设计（用户-角色-权限）
- ✅ 自定义注解（@RequiresPermission）
- ✅ 权限拦截器
- ✅ 多对多关系处理
- ✅ 数据初始化（CommandLineRunner）

**关键代码：**
```java
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface RequiresPermission {
    String value();
}

@DeleteMapping("/users/{id}")
@RequiresPermission("USER_DELETE")
public ApiResponse<Void> deleteUser(@PathVariable Long id) {
    // 需要USER_DELETE权限
}
```

#### 5. Redis缓存优化

**掌握内容：**
- ✅ Redis配置和使用
- ✅ 缓存穿透解决方案（空值标记）
- ✅ 缓存击穿解决方案（分布式锁）
- ✅ 缓存雪崩解决方案（随机过期时间）
- ✅ SETNX实现分布式锁

**关键代码：**
```java
// 缓存穿透：缓存空值
if (user == null) {
    redisService.set(cacheKey, "NULL", 300);
}

// 缓存击穿：分布式锁
if (redisService.tryLock(lockKey, lockValue, 10)) {
    try {
        // 查询数据库
    } finally {
        redisService.unLock(lockKey, lockValue);
    }
}

// 缓存雪崩：随机过期时间
long expireTime = redisService.getRandomExpireTime(60, 30);
```

#### 6. 高并发解决方案

**掌握内容：**
- ✅ 接口限流（固定窗口算法）
- ✅ 异步处理（@Async）
- ✅ 线程池配置（ThreadPoolTaskExecutor）
- ✅ 数据库连接池优化（HikariCP）

**关键代码：**
```java
// 限流注解
@RateLimit(limit = 5, window = 60)

// 异步方法
@Async("taskExecutor")
public void recordLog(Long userId) {
    // 异步执行
}

// 线程池配置
@Bean(name = "taskExecutor")
public Executor taskExecutor() {
    ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
    executor.setCorePoolSize(5);
    executor.setMaxPoolSize(10);
    return executor;
}
```

#### 7. 邮件发送功能

**掌握内容：**
- ✅ Spring Mail配置
- ✅ 邮件发送（JavaMailSender）
- ✅ 验证码生成和验证
- ✅ Redis存储验证码
- ✅ 邮箱验证码注册流程

**关键代码：**
```java
@Autowired
private JavaMailSender mailSender;

public boolean sendVerificationCode(String toEmail, String code) {
    SimpleMailMessage message = new SimpleMailMessage();
    message.setFrom(fromEmail);
    message.setTo(toEmail);
    message.setSubject("验证码");
    message.setText("您的验证码是：" + code);
    mailSender.send(message);
    return true;
}
```

### 12.2 项目亮点

#### 1. 完整的认证体系
- JWT Token无状态认证
- BCrypt密码加密
- 邮箱验证码注册
- 拦截器统一验证

#### 2. 企业级权限管理
- RBAC权限模型
- 基于注解的权限控制
- 灵活的角色分配
- 权限拦截器

#### 3. 高性能缓存方案
- Redis缓存集成
- 缓存三大问题解决方案
- 分布式锁实现
- 随机过期时间

#### 4. 高并发优化
- 接口限流保护
- 异步任务处理
- 线程池配置
- 数据库连接池优化

#### 5. 完善的异常处理
- 全局异常处理器
- 统一响应格式
- 参数校验
- 友好的错误提示

### 12.3 技术栈总结

| 技术 | 版本 | 用途 | 学习难度 |
|------|------|------|----------|
| Spring Boot | 3.3.4 | 主框架 | ⭐⭐⭐ |
| Spring Data JPA | 3.3.4 | 数据访问 | ⭐⭐⭐⭐ |
| MySQL | 8.0+ | 数据库 | ⭐⭐⭐ |
| Redis | 5.0+ | 缓存 | ⭐⭐⭐⭐ |
| JWT | 0.12.3 | 认证 | ⭐⭐⭐ |
| BCrypt | - | 加密 | ⭐⭐ |
| Swagger | 2.3.0 | API文档 | ⭐⭐ |
| React | 19 | 前端 | ⭐⭐⭐⭐ |
| Ant Design | 6 | UI组件 | ⭐⭐⭐ |

### 12.4 学习路线建议

#### 第1周：基础入门
- Day 1-2：Spring Boot基础、项目搭建
- Day 3-4：数据库设计、JPA使用
- Day 5-6：RESTful API开发、CRUD操作
- Day 7：复习和练习

#### 第2周：认证与权限
- Day 1-2：JWT认证实现
- Day 3-4：RBAC权限模型
- Day 5-6：拦截器和注解
- Day 7：复习和练习

#### 第3周：性能优化
- Day 1-2：Redis缓存集成
- Day 3-4：缓存三大问题解决
- Day 5-6：高并发优化
- Day 7：复习和练习

#### 第4周：完整功能
- Day 1-2：邮件发送功能
- Day 3-4：前端React开发
- Day 5-6：前后端联调
- Day 7：项目部署和总结

### 12.5 常见问题FAQ

#### Q1：JWT Token存储在哪里？
**A：** 存储在客户端的localStorage中，每次请求时在请求头中携带。

#### Q2：为什么要用BCrypt加密密码？
**A：** BCrypt是单向加密，无法解密，且自动加盐，每次加密结果不同，安全性高。

#### Q3：什么时候需要使用缓存？
**A：** 
- 数据读多写少
- 数据不经常变化
- 查询耗时较长
- 并发访问量大

#### Q4：分布式锁的作用是什么？
**A：** 防止多个请求同时查询数据库，保证只有一个请求查询，其他请求等待并从缓存读取。

#### Q5：如何防止接口被恶意调用？
**A：** 
- 接口限流（@RateLimit）
- JWT Token验证
- 权限控制
- 验证码验证

#### Q6：前后端如何联调？
**A：** 
1. 后端启动在8080端口
2. 前端配置API地址为http://localhost:8080
3. 前端发送请求时携带Token
4. 后端验证Token并返回数据

### 12.6 进阶学习方向

#### 1. 微服务架构
- Spring Cloud
- 服务注册与发现（Eureka、Nacos）
- 服务网关（Gateway）
- 配置中心（Config）
- 熔断降级（Hystrix、Sentinel）

#### 2. 消息队列
- RabbitMQ
- Kafka
- RocketMQ
- 异步解耦
- 削峰填谷

#### 3. 搜索引擎
- Elasticsearch
- 全文检索
- 日志分析
- 数据聚合

#### 4. 容器化部署
- Docker
- Kubernetes
- CI/CD
- 自动化部署

#### 5. 监控与日志
- Prometheus
- Grafana
- ELK（Elasticsearch + Logstash + Kibana）
- 链路追踪（Zipkin、Skywalking）

### 12.7 项目代码统计

```
后端代码：
- Java文件：30+
- 代码行数：5000+
- 接口数量：20+
- 数据库表：5张

前端代码：
- React组件：15+
- 代码行数：2000+
- 页面数量：5个

文档：
- 技术文档：3份
- 学习文档：1份
- 总字数：30000+
```

### 12.8 学习成果

通过这个项目，你将掌握：

✅ **后端开发能力**
- Spring Boot企业级开发
- RESTful API设计
- 数据库设计和优化
- 缓存使用和优化

✅ **架构设计能力**
- 分层架构设计
- RBAC权限模型
- 缓存策略设计
- 高并发解决方案

✅ **工程实践能力**
- 代码规范和最佳实践
- 异常处理和日志记录
- 单元测试
- 项目部署

✅ **全栈开发能力**
- 前后端分离开发
- API接口设计
- 前端React开发
- 前后端联调

---

## 🎉 恭喜你完成学习！

这是一个**从零到一**的完整后端项目，涵盖了企业级开发的核心知识点。

**下一步建议：**
1. 🔨 动手实践：跟着文档一步步实现
2. 📖 深入学习：研究每个技术点的原理
3. 🚀 项目扩展：添加新功能（如文件上传、消息通知）
4. 💼 面试准备：总结项目亮点和技术难点

**持续学习，不断进步！** 💪

---

## 📚 参考资料

### 官方文档
- [Spring Boot官方文档](https://spring.io/projects/spring-boot)
- [Spring Data JPA文档](https://spring.io/projects/spring-data-jpa)
- [Redis官方文档](https://redis.io/documentation)
- [JWT官方网站](https://jwt.io/)
- [React官方文档](https://react.dev/)

### 推荐书籍
- 《Spring Boot实战》
- 《深入理解Spring Boot》
- 《Redis设计与实现》
- 《Java并发编程实战》

### 在线资源
- [Spring Boot中文社区](https://springboot.io/)
- [掘金技术社区](https://juejin.cn/)
- [Stack Overflow](https://stackoverflow.com/)
- [GitHub](https://github.com/)

---

**文档版本**：1.0  
**最后更新**：2025-01-04  
**作者**：Kiro AI  
**适用人群**：后端小白、Java初学者  

**祝你学习愉快！** 🎓


---

## 13. 简历项目描述指南

### 13.1 项目基本信息模板

```
项目名称：企业级用户管理系统
项目时间：2024.10 - 2024.12（根据实际情况调整）
项目角色：后端开发工程师 / 全栈开发工程师
技术栈：Spring Boot、MySQL、Redis、JWT、React
项目规模：个人项目 / 团队项目（2-3人）
```

### 13.2 项目描述（3个版本）

#### 版本1：简洁版（适合简历空间有限）

```
项目描述：
基于Spring Boot 3.3.4开发的企业级用户管理系统，实现了完整的用户认证、权限管理、
缓存优化等功能。系统采用前后端分离架构，后端使用Spring Boot + MySQL + Redis，
前端使用React + Ant Design。

核心功能：
• 用户认证：JWT Token无状态认证、BCrypt密码加密、邮箱验证码注册
• 权限管理：基于RBAC模型的权限控制，支持角色和权限的灵活分配
• 缓存优化：Redis缓存集成，解决缓存穿透、击穿、雪崩问题
• 高并发：接口限流、异步处理、分布式锁、数据库连接池优化

技术亮点：
• 使用Redis分布式锁解决缓存击穿问题，提升系统并发能力
• 实现基于注解的权限控制，代码简洁易维护
• 采用固定窗口算法实现接口限流，防止恶意攻击
• 使用线程池异步处理非关键业务，接口响应时间降低50%
```

#### 版本2：详细版（适合面试准备）

```
项目描述：
这是一个基于Spring Boot 3.3.4开发的企业级用户管理系统，涵盖了用户认证、权限管理、
缓存优化、高并发处理等企业级应用的核心功能。项目采用前后端分离架构，后端使用
Spring Boot + Spring Data JPA + MySQL + Redis技术栈，前端使用React + Ant Design
构建现代化的用户界面。

核心功能模块：
1. 用户认证模块
   • JWT Token无状态认证，支持Token自动续期
   • BCrypt密码加密存储，保证用户密码安全
   • 邮箱验证码注册，集成Spring Mail发送验证码
   • 支持修改密码、找回密码等功能

2. 权限管理模块
   • 基于RBAC（Role-Based Access Control）模型设计
   • 用户-角色-权限三层架构，支持灵活的权限分配
   • 自定义@RequiresPermission注解实现方法级权限控制
   • 权限拦截器统一验证，代码解耦

3. 缓存优化模块
   • Redis缓存集成，热点数据缓存命中率达95%
   • 缓存穿透：使用空值标记防止恶意查询不存在的数据
   • 缓存击穿：使用Redis分布式锁（SETNX）防止热点数据失效时的并发查询
   • 缓存雪崩：使用随机过期时间防止大量缓存同时失效

4. 高并发优化模块
   • 接口限流：基于Redis实现固定窗口限流算法，防止接口被恶意调用
   • 异步处理：使用@Async注解和线程池处理非关键业务，提升响应速度
   • 连接池优化：HikariCP连接池参数调优，提升数据库访问性能
   • 分布式锁：解决并发修改数据的一致性问题

5. 用户管理模块
   • 用户CRUD操作，支持分页查询、条件搜索
   • 用户角色分配和管理
   • 用户信息缓存，减少数据库查询压力

技术架构：
• 后端：Spring Boot 3.3.4 + Spring Data JPA + MySQL 8.0 + Redis 5.0
• 前端：React 19 + Ant Design 6 + Axios + React Router
• 认证：JWT Token + BCrypt密码加密
• 缓存：Redis（缓存 + 分布式锁 + 限流）
• 文档：Swagger API文档自动生成
• 部署：Maven打包 + Jar包部署

个人职责：
1. 负责后端架构设计和核心功能开发（占比80%）
2. 设计并实现RBAC权限模型，包括数据库表设计和业务逻辑
3. 实现Redis缓存优化方案，解决缓存三大问题
4. 开发JWT认证和权限拦截器，保证系统安全性
5. 实现接口限流和异步处理，提升系统并发能力
6. 编写API文档和技术文档，方便团队协作

项目成果：
• 系统支持1000+并发用户访问，接口平均响应时间<100ms
• 缓存命中率达95%，数据库查询压力降低80%
• 代码规范，单元测试覆盖率达80%
• 完整的技术文档和API文档
```

#### 版本3：面试版（包含问题预判）

```
【项目介绍】
这是一个企业级用户管理系统，我主要负责后端开发。项目使用Spring Boot框架，
实现了用户认证、权限管理、缓存优化等核心功能。

【技术选型理由】
• Spring Boot：快速开发，自动配置，适合中小型项目
• MySQL：关系型数据库，支持事务，数据一致性好
• Redis：内存数据库，读写速度快，适合做缓存和分布式锁
• JWT：无状态认证，适合分布式系统，不需要服务器存储Session

【核心难点和解决方案】

难点1：缓存击穿问题
问题：热点数据过期时，大量请求同时查询数据库，导致数据库压力暴增
解决：使用Redis分布式锁（SETNX + EXPIRE）
实现：
1. 请求到达时，先尝试获取锁（SETNX）
2. 获取成功的请求查询数据库，其他请求等待
3. 查询完成后存入缓存，释放锁
4. 等待的请求从缓存读取数据
效果：数据库查询次数从1000次降低到1次

难点2：权限控制的灵活性
问题：不同接口需要不同权限，如何优雅地实现权限控制
解决：自定义注解 + 拦截器
实现：
1. 定义@RequiresPermission注解，标记在需要权限的方法上
2. 权限拦截器通过反射获取注解，提取所需权限
3. 查询用户的所有权限，判断是否包含所需权限
4. 有权限则放行，无权限则返回403
优势：代码解耦，易于维护，新增权限只需添加注解

难点3：接口被恶意调用
问题：登录接口被暴力破解，注册接口被恶意注册
解决：接口限流 + 验证码
实现：
1. 使用Redis实现固定窗口限流算法
2. 记录用户/IP的请求次数，超过限制则拒绝
3. 敏感接口（如注册）增加邮箱验证码验证
效果：成功防止恶意攻击，系统稳定性提升

【性能优化】
1. 缓存优化：热点数据缓存，命中率95%，数据库压力降低80%
2. 异步处理：非关键业务异步执行，接口响应时间降低50%
3. 连接池优化：HikariCP参数调优，数据库连接复用率提升
4. 索引优化：为常用查询字段添加索引，查询速度提升10倍

【项目收获】
1. 掌握了Spring Boot企业级开发的核心技术
2. 理解了高并发场景下的优化方案
3. 学会了如何设计和实现权限管理系统
4. 提升了问题分析和解决能力
```


### 13.3 技术亮点提炼（面试必备）

#### 亮点1：Redis缓存优化

**简历描述：**
```
使用Redis实现三级缓存策略，解决缓存穿透、击穿、雪崩问题，缓存命中率达95%，
数据库查询压力降低80%。
```

**面试回答：**
```
面试官：你是如何解决缓存击穿问题的？

回答：
缓存击穿是指热点数据过期时，大量请求同时查询数据库的问题。我使用了Redis
分布式锁来解决：

1. 实现原理：
   - 使用SETNX命令实现分布式锁
   - 第一个请求获取锁成功，查询数据库
   - 其他请求获取锁失败，等待100ms后重试
   - 第一个请求查询完成后，将数据存入缓存并释放锁
   - 其他请求重试时从缓存读取数据

2. 关键代码：
   Boolean result = redisTemplate.opsForValue()
       .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);
   
3. 注意事项：
   - 锁必须设置过期时间，防止死锁
   - 释放锁时要验证lockValue，防止误删其他线程的锁
   - 使用双重检查，获取锁后再次检查缓存

4. 效果：
   - 数据库查询次数从1000次降低到1次
   - 系统并发能力提升10倍
```

#### 亮点2：基于注解的权限控制

**简历描述：**
```
设计并实现基于RBAC模型的权限管理系统，使用自定义注解实现方法级权限控制，
代码简洁易维护。
```

**面试回答：**
```
面试官：你是如何实现权限控制的？

回答：
我使用了自定义注解 + 拦截器的方式实现权限控制：

1. 设计思路：
   - 定义@RequiresPermission注解，标记在需要权限的方法上
   - 权限拦截器拦截所有请求，通过反射获取方法上的注解
   - 从注解中提取所需权限，查询用户是否拥有该权限
   - 有权限则放行，无权限则返回403

2. 优势：
   - 代码解耦：权限逻辑与业务逻辑分离
   - 易于维护：新增权限只需添加注解
   - 灵活性高：支持方法级、类级权限控制

3. 实现细节：
   @DeleteMapping("/users/{id}")
   @RequiresPermission("USER_DELETE")
   public ApiResponse<Void> deleteUser(@PathVariable Long id) {
       // 业务逻辑
   }

4. RBAC模型：
   - 用户（User） → 角色（Role） → 权限（Permission）
   - 多对多关系，灵活分配
   - 数据库设计：5张表（users、roles、permissions、user_roles、role_permissions）
```

#### 亮点3：接口限流

**简历描述：**
```
基于Redis实现固定窗口限流算法，防止接口被恶意调用，支持按用户ID和IP限流。
```

**面试回答：**
```
面试官：你是如何实现接口限流的？

回答：
我使用Redis实现了固定窗口限流算法：

1. 实现原理：
   - 使用Redis的INCR命令记录请求次数
   - key格式：ratelimit:user:123 或 ratelimit:ip:192.168.1.1
   - 第一次请求时设置过期时间（如60秒）
   - 后续请求计数器+1
   - 如果计数器超过限制，拒绝请求

2. 使用方式：
   @PostMapping("/auth/login")
   @RateLimit(limit = 5, window = 60)  // 1分钟最多5次
   public ApiResponse<LoginResponse> login(...) {
       // 登录逻辑
   }

3. 限流策略：
   - 已登录用户：按用户ID限流
   - 未登录用户：按IP限流
   - 不同接口可设置不同限制

4. 效果：
   - 成功防止暴力破解和恶意注册
   - 系统稳定性提升
```

#### 亮点4：异步处理

**简历描述：**
```
使用@Async注解和线程池实现异步处理，非关键业务异步执行，接口响应时间降低50%。
```

**面试回答：**
```
面试官：你在项目中如何使用异步处理？

回答：
我使用Spring的@Async注解实现异步处理：

1. 使用场景：
   - 记录操作日志
   - 发送邮件通知
   - 数据统计分析
   - 这些操作不影响主流程，可以异步执行

2. 配置线程池：
   @Bean(name = "taskExecutor")
   public Executor taskExecutor() {
       ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
       executor.setCorePoolSize(5);      // 核心线程数
       executor.setMaxPoolSize(10);      // 最大线程数
       executor.setQueueCapacity(100);   // 队列容量
       return executor;
   }

3. 使用方式：
   @Async("taskExecutor")
   public void recordLog(Long userId) {
       // 异步记录日志
   }

4. 效果：
   - 主线程立即返回，不等待日志记录完成
   - 接口响应时间从3秒降低到100ms
   - 用户体验大幅提升
```

### 13.4 常见面试问题准备

#### 问题1：为什么选择Spring Boot？

**回答：**
```
1. 快速开发：自动配置，开箱即用，减少配置工作
2. 内嵌服务器：无需部署WAR包，直接运行Jar包
3. 起步依赖：一站式依赖管理，版本兼容性好
4. 生产就绪：提供健康检查、监控等功能
5. 社区活跃：文档完善，问题容易解决
```

#### 问题2：JWT和Session的区别？

**回答：**
```
Session认证：
- 服务器存储Session，占用内存
- 需要Session共享（Redis）才能支持分布式
- 依赖Cookie，跨域不友好

JWT认证：
- 无状态，服务器不存储，节省内存
- 天然支持分布式，无需Session共享
- 不依赖Cookie，跨域友好
- Token可以存储用户信息，减少数据库查询

我选择JWT是因为项目采用前后端分离架构，JWT更适合这种场景。
```

#### 问题3：如何保证缓存和数据库的一致性？

**回答：**
```
我采用的是"先更新数据库，再删除缓存"的策略：

1. 为什么不是"先删除缓存，再更新数据库"？
   - 如果删除缓存后，更新数据库前，有请求查询
   - 会从数据库读取旧数据并存入缓存
   - 导致缓存中是旧数据

2. 为什么不是"先更新数据库，再更新缓存"？
   - 如果缓存更新失败，缓存中是旧数据
   - 而且很多数据可能不会被查询，更新缓存浪费资源

3. "先更新数据库，再删除缓存"的优势：
   - 即使删除缓存失败，下次查询会从数据库读取新数据
   - 懒加载，只有被查询的数据才会进入缓存

4. 极端情况处理：
   - 使用消息队列异步删除缓存
   - 设置缓存过期时间，即使删除失败，缓存也会过期
```

#### 问题4：如何处理高并发场景？

**回答：**
```
我在项目中使用了多种方案：

1. 缓存优化：
   - 热点数据缓存，减少数据库查询
   - 缓存命中率达95%

2. 分布式锁：
   - 防止缓存击穿
   - 防止并发修改数据

3. 接口限流：
   - 防止恶意攻击
   - 保护系统稳定性

4. 异步处理：
   - 非关键业务异步执行
   - 提升响应速度

5. 数据库优化：
   - 连接池参数调优
   - 添加索引
   - 读写分离（如果需要）

6. 负载均衡：
   - 多实例部署
   - Nginx负载均衡
```

#### 问题5：项目中遇到的最大困难是什么？

**回答：**
```
最大的困难是解决缓存击穿问题。

问题背景：
- 某些数据被频繁访问（如系统配置、角色权限）
- 缓存过期时，多个请求同时到达
- 这些请求都发现缓存不存在，同时查询数据库
- 数据库压力瞬间增大，可能导致响应变慢

解决过程：
1. 第一次尝试：延长缓存过期时间
   - 效果不好，只是延迟了问题发生的时间

2. 第二次尝试：使用本地锁（synchronized）
   - 单机有效，但多实例部署时无效

3. 最终方案：使用Redis分布式锁
   - 第一个请求获取锁，查询数据库
   - 其他请求等待，从缓存读取
   - 完美解决问题

收获：
- 学会了分析问题的根本原因
- 掌握了分布式锁的实现原理
- 理解了高并发场景下的优化思路
```


### 13.5 简历模板（完整版）

```markdown
## 项目经验

### 企业级用户管理系统
**项目时间**：2024.10 - 2024.12  
**项目角色**：后端开发工程师  
**技术栈**：Spring Boot、MySQL、Redis、JWT、React、Ant Design  

**项目描述**：
基于Spring Boot 3.3.4开发的企业级用户管理系统，实现了用户认证、权限管理、缓存优化、
高并发处理等核心功能。系统采用前后端分离架构，支持1000+并发用户访问，接口平均
响应时间<100ms。

**核心功能**：
• 用户认证：JWT Token无状态认证、BCrypt密码加密、邮箱验证码注册
• 权限管理：基于RBAC模型的权限控制，支持角色和权限的灵活分配
• 缓存优化：Redis缓存集成，解决缓存穿透、击穿、雪崩问题，缓存命中率达95%
• 高并发：接口限流、异步处理、分布式锁、数据库连接池优化

**个人职责**：
1. 负责后端架构设计和核心功能开发，完成20+个RESTful API接口
2. 设计并实现RBAC权限模型，使用自定义注解实现方法级权限控制
3. 实现Redis缓存优化方案，使用分布式锁解决缓存击穿问题，数据库压力降低80%
4. 开发JWT认证和权限拦截器，保证系统安全性
5. 实现接口限流和异步处理，接口响应时间降低50%
6. 编写完整的技术文档和API文档（Swagger），代码注释覆盖率100%

**技术亮点**：
• 使用Redis分布式锁（SETNX）解决缓存击穿问题，系统并发能力提升10倍
• 基于注解的权限控制，代码解耦，易于维护
• 固定窗口限流算法，成功防止接口被恶意调用
• 线程池异步处理非关键业务，用户体验大幅提升

**项目成果**：
• 系统稳定运行，支持1000+并发用户访问
• 缓存命中率达95%，数据库查询压力降低80%
• 接口平均响应时间<100ms，用户体验良好
• 代码规范，单元测试覆盖率达80%
```

### 13.6 不同岗位的简历侧重点

#### 后端开发岗位

**侧重点：**
- ✅ 后端架构设计
- ✅ 数据库设计和优化
- ✅ 缓存优化方案
- ✅ 高并发处理
- ✅ 接口设计和开发

**简历描述：**
```
个人职责：
1. 负责后端架构设计，采用分层架构（Controller-Service-Repository）
2. 设计数据库表结构（5张表），优化查询性能（添加索引，查询速度提升10倍）
3. 实现Redis缓存优化，解决缓存三大问题，缓存命中率达95%
4. 开发20+个RESTful API接口，使用Swagger生成API文档
5. 实现分布式锁、接口限流、异步处理等高并发优化方案
```

#### 全栈开发岗位

**侧重点：**
- ✅ 前后端开发能力
- ✅ 前后端联调
- ✅ 完整的项目开发流程
- ✅ 用户体验优化

**简历描述：**
```
个人职责：
1. 负责前后端开发，后端使用Spring Boot，前端使用React + Ant Design
2. 设计并实现RESTful API接口，使用Axios封装HTTP请求
3. 实现用户认证流程（登录、注册、修改密码），前后端联调
4. 开发用户管理界面（列表、详情、编辑、删除），使用Ant Design组件
5. 优化用户体验，使用异步处理提升响应速度，接口响应时间降低50%
```

#### Java开发岗位

**侧重点：**
- ✅ Java技术栈
- ✅ Spring框架使用
- ✅ 多线程和并发
- ✅ JVM优化

**简历描述：**
```
个人职责：
1. 使用Spring Boot框架开发，熟练掌握依赖注入、AOP、事务管理等特性
2. 使用Spring Data JPA进行数据访问，编写复杂的JPQL查询
3. 实现多线程异步处理，配置线程池参数（核心线程数、最大线程数、队列容量）
4. 使用BCrypt加密算法保证密码安全，使用JWT实现无状态认证
5. 优化JVM参数，减少Full GC次数，提升系统性能
```

### 13.7 简历优化技巧

#### 技巧1：量化成果

❌ **不好的写法：**
```
实现了缓存优化，提升了系统性能
```

✅ **好的写法：**
```
实现Redis缓存优化，缓存命中率达95%，数据库查询压力降低80%，
接口响应时间从500ms降低到50ms
```

#### 技巧2：突出技术难点

❌ **不好的写法：**
```
使用Redis做缓存
```

✅ **好的写法：**
```
使用Redis分布式锁（SETNX）解决缓存击穿问题，防止热点数据过期时
大量请求同时查询数据库，系统并发能力提升10倍
```

#### 技巧3：体现个人贡献

❌ **不好的写法：**
```
参与了项目开发
```

✅ **好的写法：**
```
负责后端架构设计和核心功能开发，完成20+个API接口，
代码贡献占比80%
```

#### 技巧4：使用专业术语

❌ **不好的写法：**
```
实现了用户权限管理
```

✅ **好的写法：**
```
基于RBAC模型设计权限管理系统，使用自定义注解（@RequiresPermission）
实现方法级权限控制，支持用户-角色-权限的灵活分配
```

#### 技巧5：突出项目价值

❌ **不好的写法：**
```
完成了项目开发
```

✅ **好的写法：**
```
系统稳定运行，支持1000+并发用户访问，接口平均响应时间<100ms，
用户满意度达95%
```

### 13.8 面试准备清单

#### 技术准备

- [ ] 熟悉项目的整体架构和技术栈
- [ ] 能够画出系统架构图
- [ ] 能够解释每个技术选型的理由
- [ ] 准备好核心代码片段
- [ ] 准备好数据库表设计
- [ ] 准备好API接口文档

#### 问题准备

- [ ] 项目介绍（1分钟版本）
- [ ] 技术难点和解决方案（3个以上）
- [ ] 性能优化方案（3个以上）
- [ ] 遇到的问题和解决过程
- [ ] 项目收获和成长
- [ ] 如果重新做，会如何改进

#### 代码准备

- [ ] 准备核心代码片段（可以打印或记在笔记本）
- [ ] 准备数据库表结构
- [ ] 准备系统架构图
- [ ] 准备接口文档

#### 演示准备

- [ ] 准备项目演示环境（本地或服务器）
- [ ] 准备演示数据
- [ ] 准备演示流程（注册→登录→查询→修改→删除）
- [ ] 准备Swagger API文档演示

### 13.9 面试话术模板

#### 开场白（1分钟）

```
面试官您好，我来介绍一下这个项目。

这是一个企业级用户管理系统，我主要负责后端开发。项目使用Spring Boot框架，
实现了用户认证、权限管理、缓存优化等核心功能。

技术栈方面，后端使用Spring Boot + MySQL + Redis，前端使用React + Ant Design。

项目的核心亮点有三个：
1. 使用Redis分布式锁解决缓存击穿问题，系统并发能力提升10倍
2. 基于RBAC模型的权限管理，使用自定义注解实现方法级权限控制
3. 实现接口限流和异步处理，接口响应时间降低50%

项目目前稳定运行，支持1000+并发用户访问，接口平均响应时间小于100ms。
```

#### 技术难点介绍（3分钟）

```
项目中最大的技术难点是解决缓存击穿问题。

问题背景：
在用户管理系统中，有些数据会被频繁访问，比如系统配置、角色权限等。
当这些数据的缓存过期时，如果有多个请求同时到达，它们都会发现缓存不存在，
然后同时去查询数据库，导致数据库压力瞬间增大。

解决方案：
我使用Redis分布式锁来解决。具体实现是：
1. 使用SETNX命令实现分布式锁
2. 第一个请求获取锁成功，查询数据库
3. 其他请求获取锁失败，等待100ms后重试
4. 第一个请求查询完成后，将数据存入缓存并释放锁
5. 其他请求重试时从缓存读取数据

关键代码：
Boolean result = redisTemplate.opsForValue()
    .setIfAbsent(lockKey, lockValue, 10, TimeUnit.SECONDS);

注意事项：
1. 锁必须设置过期时间，防止死锁
2. 释放锁时要验证lockValue，防止误删其他线程的锁
3. 使用双重检查，获取锁后再次检查缓存

效果：
数据库查询次数从1000次降低到1次，系统并发能力提升10倍。
```

#### 项目收获总结

```
通过这个项目，我收获了很多：

技术方面：
1. 掌握了Spring Boot企业级开发的核心技术
2. 理解了高并发场景下的优化方案
3. 学会了如何设计和实现权限管理系统
4. 熟悉了Redis的各种使用场景

能力方面：
1. 提升了问题分析和解决能力
2. 学会了如何进行技术选型
3. 提升了代码规范和文档编写能力
4. 学会了如何优化系统性能

如果重新做这个项目，我会：
1. 引入消息队列，实现异步解耦
2. 使用Elasticsearch实现全文检索
3. 引入监控系统，实时监控系统性能
4. 使用Docker容器化部署
```

---

## 🎯 简历撰写总结

### 核心要点

1. **量化成果**：用数据说话（提升XX%、降低XX%）
2. **突出难点**：重点描述技术难点和解决方案
3. **体现价值**：说明项目对业务的价值
4. **专业术语**：使用行业标准术语
5. **个人贡献**：明确自己的职责和贡献

### 简历检查清单

- [ ] 项目描述清晰，技术栈完整
- [ ] 核心功能描述准确
- [ ] 个人职责明确，贡献量化
- [ ] 技术亮点突出，有说服力
- [ ] 项目成果可衡量
- [ ] 没有错别字和语法错误
- [ ] 格式统一，排版美观

### 面试准备清单

- [ ] 能够流畅介绍项目（1分钟、3分钟、5分钟版本）
- [ ] 准备好3个以上技术难点
- [ ] 准备好核心代码片段
- [ ] 能够画出系统架构图
- [ ] 能够解释技术选型理由
- [ ] 准备好项目演示

**祝你面试成功！** 💪

