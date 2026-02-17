# 온에어 Android APK 빌드 가이드

## 사전 요구사항
- Android Studio (Arctic Fox 이상)
- JDK 17
- Android SDK 34

## 로컬 빌드

1. Android Studio에서 `onair-android` 폴더를 엽니다
2. Gradle Sync를 실행합니다
3. Build > Build Bundle(s) / APK(s) > Build APK(s)
4. `app/build/outputs/apk/debug/app-debug.apk` 생성됨

## GitHub Releases 자동 배포 설정

### 1. 서명 키 생성
```bash
keytool -genkey -v -keystore onair-release.jks -keyalg RSA -keysize 2048 -validity 10000 -alias onair
```

### 2. GitHub Secrets 설정
Repository > Settings > Secrets and variables > Actions에서:

| Secret | 설명 |
|--------|------|
| `SIGNING_KEY` | `base64 -i onair-release.jks` 출력값 |
| `KEY_ALIAS` | `onair` (위에서 설정한 alias) |
| `KEY_STORE_PASSWORD` | 키스토어 비밀번호 |
| `KEY_PASSWORD` | 키 비밀번호 |

### 3. UpdateChecker 설정
`app/src/main/java/com/onair/app/UpdateChecker.java`에서:
```java
private static final String GITHUB_API_URL =
    "https://api.github.com/repos/YOUR_USERNAME/YOUR_REPO/releases/latest";
```
`YOUR_USERNAME/YOUR_REPO`를 실제 GitHub 저장소로 변경합니다.

### 4. 릴리스 배포
```bash
git tag v1.0.0
git push origin v1.0.0
```
태그를 push하면 GitHub Actions가 자동으로:
1. APK를 빌드합니다
2. 서명합니다
3. GitHub Releases에 업로드합니다

### 5. 수동 배포
GitHub > Actions > "Build & Release APK" > Run workflow > 버전 입력 후 실행

## 웹앱 URL 변경
`MainActivity.java`의 `APP_URL`을 배포된 웹앱 URL로 변경하세요:
```java
private static final String APP_URL = "https://your-app.vercel.app";
```

## 자동 업데이트
앱 실행 시 GitHub Releases의 최신 버전을 확인합니다.
새 버전이 있으면 업데이트 다이얼로그가 표시됩니다.
