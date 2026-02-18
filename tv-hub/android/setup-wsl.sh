#!/bin/bash
set -e

echo "=== 온에어 Android 빌드 환경 설정 ==="

# Install JDK 17
if ! command -v java &>/dev/null; then
    echo ">>> JDK 17 설치 중..."
    sudo apt-get update -qq
    sudo apt-get install -y -qq openjdk-17-jdk-headless unzip wget
fi
echo "Java: $(java -version 2>&1 | head -1)"

# Set JAVA_HOME
export JAVA_HOME=$(dirname $(dirname $(readlink -f $(which java))))
echo "JAVA_HOME=$JAVA_HOME"

# Install Android SDK
ANDROID_HOME="$HOME/android-sdk"
export ANDROID_HOME
export PATH="$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH"

if [ ! -d "$ANDROID_HOME/cmdline-tools/latest" ]; then
    echo ">>> Android SDK 커맨드라인 도구 설치 중..."
    mkdir -p "$ANDROID_HOME"
    cd /tmp
    wget -q "https://dl.google.com/android/repository/commandlinetools-linux-11076708_latest.zip" -O cmdline-tools.zip
    unzip -q -o cmdline-tools.zip
    mkdir -p "$ANDROID_HOME/cmdline-tools"
    rm -rf "$ANDROID_HOME/cmdline-tools/latest"
    mv cmdline-tools "$ANDROID_HOME/cmdline-tools/latest"
    rm cmdline-tools.zip
fi

echo ">>> Android SDK 라이선스 동의 및 플랫폼 설치..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true
sdkmanager --install "platforms;android-34" "build-tools;34.0.0" > /dev/null 2>&1

echo ">>> Android SDK 설치 완료"
echo "ANDROID_HOME=$ANDROID_HOME"

# Add to bashrc for persistence
if ! grep -q "ANDROID_HOME" ~/.bashrc 2>/dev/null; then
    echo "" >> ~/.bashrc
    echo "# Android SDK" >> ~/.bashrc
    echo "export ANDROID_HOME=$ANDROID_HOME" >> ~/.bashrc
    echo 'export PATH=$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$PATH' >> ~/.bashrc
fi

echo ""
echo "=== 환경 설정 완료! ==="
echo "이제 APK를 빌드합니다..."
