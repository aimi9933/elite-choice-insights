# Adult Dating Bridge Page

极简、高转化的成人约会类Offer落地页，专为 Vercel 部署设计。集成 Firebase Firestore 进行实时点击追踪。

## 特性

- **极简设计**: 针对欧美市场的地道视觉风格。
- **极速性能**: 纯静态 HTML/JS，无框架开销，基于 TailwindCSS CDN。
- **精准追踪**: 集成 Firebase Firestore，记录每次点击的指纹信息 (UserAgent, Referer, Timestamp)。
- **安全可靠**: 异步 `async/await` 机制确保数据写入后再跳转。
- **Vercel Ready**: 开箱即用的 Vercel 配置。

## 快速开始

### 1. 部署到 Vercel (推荐)

点击下方按钮一键部署到 Vercel：

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-repo%2Fdating-lp&env=OFFER_URL,FIREBASE_API_KEY,FIREBASE_AUTH_DOMAIN,FIREBASE_PROJECT_ID,FIREBASE_STORAGE_BUCKET,FIREBASE_MESSAGING_SENDER_ID,FIREBASE_APP_ID)

> **注意**: 部署过程中 Vercel 会提示输入环境变量，请准备好你的 Offer 链接和 Firebase 配置。

### 2. 环境变量配置

在 Vercel 项目设置中配置以下变量：

| 变量名 | 说明 | 示例 |
|--------|------|------|
| `OFFER_URL` | **[必填]** 最终跳转的 Offer 链接 | `https://example.com/dating` |
| `FIREBASE_API_KEY` | Firebase API Key | `AIzaSy...` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `app.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `dating-lp-123` |
| `FIREBASE_STORAGE_BUCKET`| Firebase Storage Bucket | `dating-lp.appspot.com` |
| `FIREBASE_MESSAGING_SENDER_ID` | Sender ID | `123456789` |
| `FIREBASE_APP_ID` | App ID | `1:123456:web:abc...` |

### 3. 本地开发

1. 克隆项目
2. 创建 `.env` 文件（参考 `.env.example`）
   *(注意：本地静态文件无法直接读取 .env，需手动修改 `script.js` 或使用 `vercel dev`)*
3. 启动本地服务器：
   ```bash
   npx serve .
   ```

### 4. Firestore 数据结构

系统会自动在 Firestore 创建 `clicks` 集合：

- `clickId`: 客户端生成的 UUID
- `timestamp`: 服务器时间戳
- `userAgent`: 用户浏览器信息
- `referer`: 流量来源
- `targetUrl`: 跳转目标
- `screen`: 屏幕分辨率

## 性能优化建议

- 在 Firebase Console 中为 `clicks` 集合的 `timestamp` 字段创建索引。
- 确保 Firebase 规则允许写入：
  ```javascript
  match /clicks/{document=**} {
    allow create: if true;
  }
  ```
