# WebView
-keepclassmembers class * {
    @android.webkit.JavascriptInterface <methods>;
}

# Keep UpdateChecker
-keep class com.onair.app.UpdateChecker { *; }
