# GitHub Actions Workflow Diagram

## 工作流程架構圖

```
┌─────────────────────────────────────────────────────────────────┐
│                     PageTurner CI/CD Pipeline                    │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐     ┌──────────────┐     ┌──────────────────────┐
│   開發流程   │     │   建置流程   │     │    發布流程          │
└──────────────┘     └──────────────┘     └──────────────────────┘

Push to main/develop     Push to main/develop     Push tag v*
       │                        │                        │
       │                        │                   Manual Trigger
       ▼                        ▼                        │
┌──────────────┐     ┌──────────────────┐               ▼
│  Test (CI)   │     │   Build APK      │     ┌──────────────────┐
│              │     │                  │     │ Production       │
│ ✓ Linting    │     │ ✓ Build Debug    │     │ Release          │
│ ✓ Type Check │     │ ✓ Build Release  │     │                  │
│ ✓ Unit Tests │     │                  │     │ ✓ Run Tests      │
│ ✓ Coverage   │     │                  │     │ ✓ Build APK      │
└──────┬───────┘     └────────┬─────────┘     │ ✓ Create Release │
       │                      │                │ ✓ Upload to      │
       │                      │                │   GitHub         │
       ▼                      ▼                └────────┬─────────┘
  ┌─────────┐          ┌──────────┐                    │
  │Coverage │          │APK Files │                    ▼
  │ Report  │          │(Artifacts)│           ┌───────────────┐
  └─────────┘          └──────────┘           │GitHub Release │
                                              │               │
                                              │PageTurner.apk │
                                              └───────────────┘
```

## 詳細流程說明

### 1. Test (CI) Workflow
```yaml
觸發條件:
  - Push → main, develop
  - Pull Request → main, develop

執行步驟:
  1. Checkout code
  2. Setup Node.js (with cache)
  3. Install dependencies (npm ci)
  4. Run ESLint
  5. Run TypeScript check
  6. Run Jest tests (with coverage)
  7. Upload coverage report

產出:
  - Coverage report (artifact, 7 days)
  
執行時間: ~2-3 分鐘
```

### 2. Build APK Workflow
```yaml
觸發條件:
  - Push → main, develop
  - Pull Request → main, develop

執行步驟:
  1. Checkout code
  2. Setup Node.js (with cache)
  3. Setup Java 17 (with cache)
  4. Install dependencies
  5. Cache Gradle packages
  6. Build Debug APK
  7. Upload Debug APK
  8. Build Release APK
  9. Upload Release APK

產出:
  - app-debug-{sha}.apk (artifact, 14 days)
  - app-release-{sha}.apk (artifact, 14 days)
  
執行時間: ~8-10 分鐘
```

### 3. Production Release Workflow
```yaml
觸發條件:
  - Push tag → v*
  - Manual workflow_dispatch

執行步驟:
  1. Checkout code
  2. Setup Node.js (with cache)
  3. Setup Java 17 (with cache)
  4. Install dependencies
  5. Run tests
  6. Run linter
  7. Cache Gradle packages
  8. Extract version from tag
  9. Build Release APK
  10. Rename APK with version
  11. Generate changelog
  12. Create GitHub Release
  13. Upload APK to release
  14. Upload as artifact

產出:
  - GitHub Release (永久)
  - PageTurner-{version}.apk (release)
  - app-release.apk (release)
  - PageTurner-{version}.apk (artifact, 90 days)
  
執行時間: ~10-12 分鐘
```

## 使用場景

### 場景 1: 日常開發
```bash
# 開發者推送程式碼
git add .
git commit -m "Add new feature"
git push origin develop

# 自動觸發:
# ✓ Test (CI) - 確保程式碼品質
# ✓ Build APK - 產生測試用 APK

# 結果:
# - 可從 Actions 下載 APK 測試
```

### 場景 2: Pull Request
```bash
# 建立 PR
git checkout -b feature/new-feature
git push origin feature/new-feature
# 在 GitHub 建立 PR

# 自動觸發:
# ✓ Test (CI) - PR 檢查
# ✓ Build APK - 確保可建置

# 結果:
# - PR 顯示測試狀態
# - 可下載 APK 供審查者測試
```

### 場景 3: 正式發布
```bash
# 準備發布
git checkout main
git pull origin main

# 建立版本標籤
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 自動觸發:
# ✓ Production Release

# 結果:
# - 在 Releases 頁面建立新版本
# - 使用者可下載 PageTurner-1.0.0.apk
```

### 場景 4: 緊急修正
```bash
# 發現 bug，需要快速發布修正版

# 方法 1: 標籤
git tag -a v1.0.1 -m "Hotfix: Fix critical bug"
git push origin v1.0.1

# 方法 2: 手動觸發
# 1. 進入 GitHub Actions 頁面
# 2. 選擇 "Production Release"
# 3. 點擊 "Run workflow"
# 4. 輸入版本號: 1.0.1
# 5. 執行

# 結果:
# - 立即產生新版本
```

## 下載 APK 的方式

### 方式 1: 從 GitHub Releases (推薦給使用者)
```
1. 訪問: https://github.com/Sikako/PageTurner/releases
2. 找到最新版本
3. 在 Assets 區段點擊 PageTurner-{version}.apk
4. 下載並安裝
```

### 方式 2: 從 Actions Artifacts (開發用)
```
1. 訪問: https://github.com/Sikako/PageTurner/actions
2. 選擇 "Build APK" workflow
3. 點擊想要的 run (顯示綠色勾勾)
4. 往下滾動到 "Artifacts" 區段
5. 下載 app-debug 或 app-release
6. 解壓縮 zip 檔案
7. 安裝 APK
```

## Workflow 狀態徽章

可以在 README.md 添加以下徽章:

```markdown
![Test](https://github.com/Sikako/PageTurner/actions/workflows/test.yml/badge.svg)
![Build](https://github.com/Sikako/PageTurner/actions/workflows/build.yml/badge.svg)
![Release](https://github.com/Sikako/PageTurner/actions/workflows/release.yml/badge.svg)
```

## 效能優化

### Cache 策略
```
Node modules cache:
  - Key: OS + package-lock.json hash
  - 節省時間: ~1-2 分鐘

Gradle cache:
  - Key: OS + gradle files hash
  - 節省時間: ~3-5 分鐘
  
總節省: ~4-7 分鐘/run
```

### 並行執行
```
同一個 commit 會觸發:
  - Test (CI)      } 並行執行
  - Build APK      }
  
總執行時間 = max(Test, Build) ≈ 10 分鐘
而非 Test + Build ≈ 13 分鐘
```

## 成本估算 (GitHub Free)

```
GitHub Free 方案:
  - 2000 分鐘/月 (Linux runners)
  - 500 MB Artifacts 儲存空間

預估使用:
  - 每次 push: ~10 分鐘
  - 每月 100 次 push: 1000 分鐘
  - Artifacts: ~50 MB (會自動清理)
  
結論: 在免費額度內
```

## 維護建議

### 定期檢查
- [ ] 每季檢查 actions 版本更新
- [ ] 監控 workflow 執行時間
- [ ] 清理舊的 artifacts

### 版本管理
- [ ] 使用語義化版本 (v1.0.0)
- [ ] 主要版本更新時更新 CHANGELOG.md
- [ ] 標籤訊息包含變更摘要

### 疑難排解
- [ ] 檢查 Actions 執行日誌
- [ ] 驗證 Gradle 和 npm 版本
- [ ] 確保分支保護規則正確設定
