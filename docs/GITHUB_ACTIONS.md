# GitHub Actions 工作流程說明

本專案包含三個主要的 GitHub Actions 工作流程，用於自動化測試、建置和發布。

## 📋 工作流程概覽

### 1. Test (CI) - 測試工作流程
**檔案**: `.github/workflows/test.yml`

**觸發時機**:
- 推送到 `main` 或 `develop` 分支
- 對 `main` 或 `develop` 分支的 Pull Request

**執行內容**:
- ✅ 安裝依賴套件
- ✅ 執行 ESLint 程式碼檢查
- ✅ 執行 TypeScript 型別檢查
- ✅ 執行 Jest 單元測試
- ✅ 產生測試覆蓋率報告

**產出**:
- 測試覆蓋率報告（保留 7 天）

---

### 2. Build APK - 建置工作流程
**檔案**: `.github/workflows/build.yml`

**觸發時機**:
- 推送到 `main` 或 `develop` 分支
- 對 `main` 或 `develop` 分支的 Pull Request

**執行內容**:
- ✅ 建置 Android Debug APK（用於開發測試）
- ✅ 建置 Android Release APK（未簽名）

**產出**:
- `app-debug-{commit}.apk` - 除錯版本（保留 14 天）
- `app-release-{commit}.apk` - 發布版本（保留 14 天）

**如何下載**:
1. 進入 GitHub Actions 頁面
2. 找到對應的 workflow run
3. 在 "Artifacts" 區段下載 APK

---

### 3. Production Release - 生產發布工作流程
**檔案**: `.github/workflows/release.yml`

**觸發時機**:
- 推送版本標籤（例如：`v1.0.0`）
- 手動觸發（透過 GitHub Actions 頁面）

**執行內容**:
- ✅ 執行完整測試
- ✅ 執行程式碼檢查
- ✅ 建置 Android Release APK
- ✅ 建立 GitHub Release
- ✅ 自動上傳 APK 到 Release

**產出**:
- GitHub Release 頁面的可下載 APK
- APK 檔案名稱：`PageTurner-{version}.apk`

---

## 🚀 使用指南

### 發布新版本

#### 方法 1: 使用 Git 標籤（推薦）

```bash
# 1. 確保程式碼已提交
git add .
git commit -m "準備發布 v1.0.0"

# 2. 建立並推送標籤
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 3. GitHub Actions 會自動建置並建立 Release
```

#### 方法 2: 手動觸發

1. 進入 GitHub 專案頁面
2. 點擊 "Actions" 標籤
3. 選擇 "Production Release" 工作流程
4. 點擊 "Run workflow"
5. 輸入版本號（例如：1.0.0）
6. 點擊 "Run workflow" 按鈕

### 下載 APK

#### 從 GitHub Releases（生產版本）

1. 進入專案的 [Releases 頁面](../../releases)
2. 找到對應的版本
3. 在 "Assets" 區段下載 `PageTurner-{version}.apk`

#### 從 Actions Artifacts（開發版本）

1. 進入專案的 [Actions 頁面](../../actions)
2. 選擇 "Build APK" 工作流程
3. 點擊想要的 run
4. 在 "Artifacts" 區段下載 APK

---

## 📦 APK 類型說明

| 類型 | 用途 | 來源 | 保留時間 |
|------|------|------|---------|
| **Debug APK** | 開發測試 | Build workflow | 14 天 |
| **Release APK (unsigned)** | 測試發布流程 | Build workflow | 14 天 |
| **Production APK** | 正式發布 | Release workflow | 永久 |

---

## 🔧 工作流程配置

### 修改觸發條件

編輯對應的 `.github/workflows/*.yml` 檔案，修改 `on:` 區段。

### 新增分支

例如新增 `staging` 分支到建置流程：

```yaml
on:
  push:
    branches:
      - main
      - develop
      - staging  # 新增這行
```

### 自訂 APK 檔名

在 `release.yml` 中修改 `Rename APK with version` 步驟。

---

## 🐛 疑難排解

### 建置失敗

1. **檢查測試**: 確保本地 `npm test` 通過
2. **檢查 Linting**: 確保本地 `npm run lint` 通過
3. **檢查 Gradle**: 確保本地 `cd android && ./gradlew assembleRelease` 成功

### 無法下載 APK

1. 確認 workflow 已成功完成
2. 檢查 Actions 頁面的執行日誌
3. 確認有足夠的權限訪問 repository

### Release 沒有建立

1. 確認標籤格式正確（必須是 `v*`，如 `v1.0.0`）
2. 檢查 `GITHUB_TOKEN` 權限
3. 查看 Actions 執行日誌中的錯誤訊息

---

## 📝 版本號規則

建議使用 [語義化版本](https://semver.org/lang/zh-TW/)：

- `v1.0.0` - 主要版本.次要版本.修訂版本
- `v1.0.0-beta.1` - Beta 版本
- `v1.0.0-alpha.1` - Alpha 版本

---

## 🔐 安全性注意事項

### Debug Keystore

目前使用 Android 預設的 debug keystore。生產環境應該：

1. 生成專用的 release keystore
2. 將 keystore 加密後存放在 GitHub Secrets
3. 在 workflow 中使用 secrets 進行簽名

### 敏感資訊

不要在 workflow 檔案中硬編碼：
- API Keys
- Passwords
- Keystore 資訊

使用 GitHub Secrets 存放敏感資訊。

---

## 📚 參考資源

- [GitHub Actions 文件](https://docs.github.com/actions)
- [React Native Android 簽名](https://reactnative.dev/docs/signed-apk-android)
- [Gradle 建置配置](https://developer.android.com/studio/build)

---

## 🤝 貢獻

如需修改工作流程：

1. Fork 專案
2. 建立功能分支
3. 修改 `.github/workflows/*.yml`
4. 提交 Pull Request

---

**最後更新**: 2026-01-31
