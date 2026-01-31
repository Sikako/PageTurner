# GitHub Actions Quick Reference

## 快速指令參考

### 🚀 發布新版本

```bash
# 1. 確保在 main 分支且程式碼最新
git checkout main
git pull origin main

# 2. 建立版本標籤
git tag -a v1.0.0 -m "Release version 1.0.0"

# 3. 推送標籤
git push origin v1.0.0

# 4. 檢查 Release
# 訪問: https://github.com/Sikako/PageTurner/releases
```

### 📥 下載 APK

#### 正式版本
```
URL: https://github.com/Sikako/PageTurner/releases
檔案: PageTurner-{version}.apk
```

#### 開發版本
```
1. https://github.com/Sikako/PageTurner/actions
2. 選擇 "Build APK"
3. 點擊成功的 run
4. 下載 Artifacts
```

### 🧪 測試工作流程

```bash
# 本地測試（在推送前）
npm test                 # 執行測試
npm run lint            # 執行 linting
npx tsc --noEmit        # TypeScript 檢查

# 推送後自動執行
git push origin develop  # 觸發 Test + Build
```

### 🏗️ 手動觸發 Release

```
1. 訪問: https://github.com/Sikako/PageTurner/actions
2. 選擇 "Production Release"
3. 點擊 "Run workflow"
4. 選擇分支: main
5. 輸入版本號: 1.0.0 (不含 v)
6. 點擊 "Run workflow"
```

## 工作流程狀態

### 查看狀態
```
Actions 頁面: https://github.com/Sikako/PageTurner/actions

圖示說明:
✅ 綠色勾勾 = 成功
❌ 紅色叉叉 = 失敗
🟡 黃色圓圈 = 進行中
⚪ 灰色圓圈 = 排隊中
```

### 查看日誌
```
1. 點擊失敗的 workflow run
2. 點擊失敗的 job
3. 展開失敗的步驟
4. 查看錯誤訊息
```

## 版本號規則

### 語義化版本
```
格式: v{major}.{minor}.{patch}

範例:
v1.0.0   - 首次正式發布
v1.1.0   - 新增功能
v1.1.1   - Bug 修復
v2.0.0   - 重大更新

預發布版本:
v1.0.0-beta.1   - Beta 版
v1.0.0-rc.1     - Release Candidate
```

## 常見操作

### 刪除標籤

```bash
# 本地刪除
git tag -d v1.0.0

# 遠端刪除
git push origin :refs/tags/v1.0.0

# 或使用
git push origin --delete v1.0.0
```

### 修改標籤

```bash
# 無法直接修改，需要刪除後重建
git tag -d v1.0.0
git push origin :refs/tags/v1.0.0
git tag -a v1.0.0 -m "Updated release notes"
git push origin v1.0.0
```

### 列出所有標籤

```bash
# 列出本地標籤
git tag

# 列出遠端標籤
git ls-remote --tags origin

# 查看標籤詳情
git show v1.0.0
```

## Artifacts 管理

### 保留期限
```
Test coverage:    7 天
Debug APK:       14 天
Release APK:     14 天
Production APK:  90 天
```

### 手動刪除
```
1. Settings → Actions → General
2. Artifact and log retention
3. 可設定全域保留期限
```

## 疑難排解

### Workflow 沒有觸發

**檢查清單:**
- [ ] 分支名稱正確 (main, develop)
- [ ] 標籤格式正確 (v*)
- [ ] 檔案在正確位置 (.github/workflows/)
- [ ] YAML 語法正確
- [ ] Repository 設定允許 Actions

**解決方法:**
```bash
# 檢查語法
cat .github/workflows/release.yml

# 手動觸發
# 使用 workflow_dispatch
```

### 建置失敗

**常見原因:**
1. 依賴安裝失敗
   ```bash
   # 本地測試
   rm -rf node_modules
   npm ci
   ```

2. Gradle 建置失敗
   ```bash
   # 本地測試
   cd android
   ./gradlew clean
   ./gradlew assembleRelease
   ```

3. 測試失敗
   ```bash
   # 本地執行
   npm test
   ```

### APK 無法下載

**檢查:**
- [ ] Workflow 成功完成
- [ ] Artifacts 還在保留期限內
- [ ] 有權限訪問 Repository
- [ ] Release 已建立（對於 production）

## 權限設定

### Repository Settings
```
Settings → Actions → General

Workflow permissions:
✅ Read and write permissions
✅ Allow GitHub Actions to create and approve pull requests
```

### Branch Protection
```
Settings → Branches → Branch protection rules

For main branch:
☐ Require status checks to pass (可選)
  - Test (CI)
  - Build APK
```

## 徽章嵌入

### Markdown 格式
```markdown
[![Test](https://github.com/Sikako/PageTurner/actions/workflows/test.yml/badge.svg)](https://github.com/Sikako/PageTurner/actions/workflows/test.yml)
[![Build](https://github.com/Sikako/PageTurner/actions/workflows/build.yml/badge.svg)](https://github.com/Sikako/PageTurner/actions/workflows/build.yml)
[![Release](https://github.com/Sikako/PageTurner/actions/workflows/release.yml/badge.svg)](https://github.com/Sikako/PageTurner/actions/workflows/release.yml)
```

### HTML 格式
```html
<img src="https://github.com/Sikako/PageTurner/actions/workflows/test.yml/badge.svg" alt="Test">
```

## 最佳實踐

### 提交前
```bash
# 1. 執行本地測試
npm test

# 2. 檢查程式碼
npm run lint

# 3. 確認可建置
cd android && ./gradlew assembleRelease

# 4. 提交
git add .
git commit -m "Your message"
git push
```

### 發布前
```bash
# 1. 更新版本號
# 編輯 android/app/build.gradle
versionCode X
versionName "X.Y.Z"

# 2. 更新 CHANGELOG.md
# 記錄變更內容

# 3. 提交版本變更
git add .
git commit -m "Bump version to X.Y.Z"
git push

# 4. 建立標籤
git tag -a vX.Y.Z -m "Release version X.Y.Z"
git push origin vX.Y.Z
```

### 發布後
```bash
# 1. 檢查 Release
# 訪問 Releases 頁面確認

# 2. 測試下載
# 下載 APK 並在測試裝置安裝

# 3. 發布公告
# 在 Discussions 或 社群媒體分享
```

## 連結快速訪問

```
Actions:    https://github.com/Sikako/PageTurner/actions
Releases:   https://github.com/Sikako/PageTurner/releases
Settings:   https://github.com/Sikako/PageTurner/settings
Issues:     https://github.com/Sikako/PageTurner/issues
Wiki:       https://github.com/Sikako/PageTurner/wiki
```

## 聯絡支援

**遇到問題？**
1. 查看 [GitHub Actions 文件](docs/GITHUB_ACTIONS.md)
2. 查看 [工作流程圖表](docs/WORKFLOWS_DIAGRAM.md)
3. 建立 [Issue](https://github.com/Sikako/PageTurner/issues)

---

**最後更新**: 2026-01-31
