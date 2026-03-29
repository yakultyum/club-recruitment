# 实现计划：社团招新智能匹配平台

## 概述

按照设计文档，将平台拆分为以下实现阶段：项目基础搭建 → 数据模型与数据库 → 认证与用户模块 → 社团管理模块 → 匹配引擎 → 申请管理模块 → 搜索与筛选 → 通知服务 → 统计模块 → 集成与收尾。

---

## 任务列表

- [x] 1. 搭建项目基础结构与开发环境
  - 初始化 monorepo，创建 `packages/backend`（Express + TypeScript）和 `packages/frontend`（React + TypeScript）目录结构
  - 配置 TypeScript、ESLint、Prettier
  - 安装并配置测试框架：Vitest（单元测试）+ fast-check（属性测试）
  - 创建 `docker-compose.yml`，配置 PostgreSQL 和 Redis 服务
  - _需求：全局基础设施_

- [x] 2. 实现数据模型与数据库迁移
  - [x] 2.1 创建数据库 Schema 和迁移脚本
    - 按照设计文档中的数据模型，创建 `users`、`student_profiles`、`clubs`、`applications`、`notifications` 表
    - 添加必要的索引（email 唯一索引、club name 唯一索引、student_id+club_id 联合索引）
    - _需求：2.2, 2.3, 4.3_

  - [x] 2.2 为数据模型编写属性测试
    - **属性 8：统计数据一致性** — 对任意社团，申请总数 = 通过数 + 拒绝数 + 待审核数 + 撤回数
    - `// Feature: club-recruitment-matching, Property 8: 统计数据各项之和等于总数`
    - _需求：6.1_

- [x] 3. 实现认证模块（AuthService）
  - [x] 3.1 实现用户注册与登录接口
    - 实现 `POST /api/auth/register` 和 `POST /api/auth/login`
    - 使用 bcrypt 对密码进行哈希处理，使用 JWT 生成 token
    - 实现 `verifyToken` 中间件，用于保护需要认证的路由
    - _需求：1.1（注册前提）_

  - [x] 3.2 为认证模块编写单元测试
    - 测试 token 生成与验证的正确性
    - 测试密码哈希与验证
    - _需求：1.1_

- [x] 4. 实现学生画像模块（StudentProfileService）
  - [x] 4.1 实现兴趣标签的创建与更新接口
    - 实现 `POST /api/profile/tags` 和 `PUT /api/profile/tags`
    - 实现标签数量验证：提交空标签列表时返回 `TAGS_REQUIRED` 错误
    - _需求：1.1, 1.3, 1.5_

  - [x] 4.2 为画像更新编写属性测试
    - **属性 3：标签更新后推荐列表一致性** — 对任意标签集合 T，更新后获取画像，返回的标签集合应等于 T（轮回属性）
    - `// Feature: club-recruitment-matching, Property 3: 标签更新后推荐列表使用新标签`
    - _需求：1.5, 3.4_

- [x] 5. 实现社团管理模块（ClubService）
  - [x] 5.1 实现社团 CRUD 接口
    - 实现 `POST /api/clubs`、`GET /api/clubs/:id`、`PUT /api/clubs/:id`
    - 实现社团名称长度验证（2–50 字符）和唯一性检查
    - 实现名额满员时自动将 `isOpen` 设为 `false`
    - _需求：2.1, 2.2, 2.3, 2.5_

  - [x] 5.2 为社团名称验证编写属性测试
    - **属性（名称长度）** — 对任意长度 < 2 或 > 50 的字符串，创建社团应返回验证错误
    - `// Feature: club-recruitment-matching, Property: 社团名称长度验证`
    - _需求：2.2_

  - [x] 5.3 为名额满员逻辑编写属性测试
    - **属性 5：名额满员时拒绝新申请** — 对任意 currentCount == capacity 的社团，提交申请应返回 `CLUB_CAPACITY_FULL` 错误
    - `// Feature: club-recruitment-matching, Property 5: 名额满时拒绝新申请`
    - _需求：2.5_

- [x] 6. 实现匹配引擎（MatchingEngine）
  - [x] 6.1 实现 Jaccard 相似度匹配分数计算函数
    - 实现 `computeScore(studentTags, clubTags): number`，使用 Jaccard 公式
    - 处理边界情况：两个集合均为空时返回 0
    - _需求：3.2_

  - [x] 6.2 为匹配分数编写属性测试
    - **属性 1：匹配分数范围不变式** — 对任意标签集合，分数始终在 [0, 100] 内
    - `// Feature: club-recruitment-matching, Property 1: 匹配分数始终在 [0, 100] 内`
    - _需求：3.2_

  - [x] 6.3 实现推荐列表生成接口
    - 实现 `GET /api/recommendations`，计算当前学生与所有社团的匹配分数
    - 按分数降序排序，若所有分数为 0 则按社团热度（申请总数）排序
    - 实现分页：每页最多 10 条
    - 将推荐结果缓存至 Redis，TTL 设为 5 分钟
    - _需求：3.1, 3.3, 3.5, 3.6_

  - [x] 6.4 为推荐列表排序编写属性测试
    - **属性 2：推荐列表排序单调性** — 对任意推荐列表，相邻两项分数满足前者 >= 后者
    - `// Feature: club-recruitment-matching, Property 2: 推荐列表按分数非递增排序`
    - _需求：3.3_

- [x] 7. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户反馈。

- [x] 8. 实现申请管理模块（ApplicationService）
  - [x] 8.1 实现申请提交与撤回接口
    - 实现 `POST /api/applications` 和 `DELETE /api/applications/:id`
    - 实现重复申请检测：同一学生对同一社团只能有一条非撤回状态的申请
    - 实现撤回约束：只有 `pending` 状态的申请可以被撤回
    - _需求：4.2, 4.3, 4.6_

  - [x] 8.2 为申请唯一性编写属性测试
    - **属性 4：申请唯一性不变式** — 对任意学生和社团，提交两次申请，第二次应返回 `APPLICATION_DUPLICATE` 错误
    - `// Feature: club-recruitment-matching, Property 4: 同一学生对同一社团无重复有效申请`
    - _需求：4.3_

  - [x] 8.3 实现申请审核接口
    - 实现 `PUT /api/applications/:id/review`，支持 `approved`、`rejected`、`pending` 三种状态
    - 实现状态流转合法性校验：只允许从 `pending` 流转到其他状态
    - 审核通过时，更新社团的 `currentCount`
    - _需求：4.4_

  - [x] 8.4 为申请状态流转编写属性测试
    - **属性 6：申请状态流转合法性** — 对任意终态（approved/rejected/withdrawn）的申请，尝试再次变更状态应返回 `INVALID_STATUS_TRANSITION` 错误
    - `// Feature: club-recruitment-matching, Property 6: 申请状态流转路径合法`
    - _需求：4.4, 4.6_

- [x] 9. 实现通知服务（NotificationService）
  - [x] 9.1 实现站内通知的发送与查询接口
    - 实现 `GET /api/notifications` 和 `PUT /api/notifications/:id/read`
    - 在申请状态变更时（审核通过/拒绝）自动触发通知创建
    - _需求：4.5_

  - [x] 9.2 为通知触发编写属性测试
    - **属性（通知触发）** — 对任意申请，当状态从 `pending` 变更为 `approved` 或 `rejected` 时，学生的通知列表中应新增一条对应通知
    - `// Feature: club-recruitment-matching, Property: 状态变更触发通知`
    - _需求：4.5_

- [x] 10. 实现搜索与筛选模块
  - [x] 10.1 实现社团搜索与类型筛选接口
    - 实现 `GET /api/clubs?keyword=&type=&page=`
    - 关键词匹配社团名称或简介（大小写不敏感）
    - 支持类型筛选和关键词的组合查询
    - 搜索无结果时返回热门社团列表
    - _需求：5.1, 5.2, 5.3, 5.4_

  - [x] 10.2 为搜索相关性编写属性测试
    - **属性 7：搜索结果相关性** — 对任意非空关键词，返回的每条社团记录，其名称或简介必须包含该关键词（大小写不敏感）
    - `// Feature: club-recruitment-matching, Property 7: 搜索结果包含关键词`
    - _需求：5.1, 5.4_

- [x] 11. 实现统计模块（StatisticsService）
  - [x] 11.1 实现招新数据统计接口
    - 实现 `GET /api/clubs/:id/stats`，返回申请总数、通过数、拒绝数、待审核数
    - 实现 `GET /api/clubs/:id/stats/trend?days=30`，返回每日申请数量趋势
    - 实现 `GET /api/clubs/:id/stats/tags`，返回申请者兴趣标签分布
    - _需求：6.1, 6.2, 6.3_

  - [x] 11.2 为统计数据一致性编写属性测试
    - **属性 8：统计数据一致性** — 对任意社团，申请总数 = 通过数 + 拒绝数 + 待审核数 + 撤回数
    - `// Feature: club-recruitment-matching, Property 8: 统计数据各项之和等于总数`
    - _需求：6.1_

- [x] 12. 检查点 — 确保所有测试通过
  - 确保所有测试通过，如有问题请向用户反馈。

- [x] 13. 实现前端核心页面
  - [x] 13.1 实现学生端页面
    - 创建注册/登录页、兴趣标签选择页、推荐列表页、社团详情页、我的申请页
    - 接入后端 API，实现完整的学生端交互流程
    - _需求：1.1–1.5, 3.1–3.6, 4.1–4.6_

  - [x] 13.2 实现社团管理员端页面
    - 创建社团信息编辑页、申请审核列表页、招新数据统计看板
    - 接入后端 API，实现完整的管理员端交互流程
    - _需求：2.1–2.6, 4.4, 6.1–6.3_

- [x] 14. 最终检查点 — 集成验证
  - 确保所有单元测试和属性测试通过，如有问题请向用户反馈。

---

## 备注

- 标有 `*` 的子任务为可选任务，可在 MVP 阶段跳过以加快交付速度
- 每个属性测试使用 fast-check 库，最少运行 100 次迭代
- 每个任务均引用了具体的需求条款，便于追溯
- 检查点任务确保每个阶段的增量验证
