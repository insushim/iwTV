package com.onair.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.content.Intent;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Handler;
import android.os.Looper;

import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

public class UpdateChecker {

    private static final String GITHUB_API_URL =
            "https://api.github.com/repos/insushim/iwTV/releases/latest";

    private final Activity activity;
    private final ExecutorService executor = Executors.newSingleThreadExecutor();
    private final Handler mainHandler = new Handler(Looper.getMainLooper());

    public UpdateChecker(Activity activity) {
        this.activity = activity;
    }

    public void checkForUpdate() {
        executor.execute(() -> {
            try {
                URL url = new URL(GITHUB_API_URL);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/vnd.github.v3+json");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                if (conn.getResponseCode() == 200) {
                    BufferedReader reader = new BufferedReader(
                            new InputStreamReader(conn.getInputStream()));
                    StringBuilder response = new StringBuilder();
                    String line;
                    while ((line = reader.readLine()) != null) {
                        response.append(line);
                    }
                    reader.close();

                    JSONObject release = new JSONObject(response.toString());
                    String latestVersion = release.getString("tag_name").replaceFirst("^v", "");
                    String currentVersion = getCurrentVersion();
                    String releaseNotes = release.optString("body", "");
                    String downloadUrl = "";

                    for (int i = 0; i < release.getJSONArray("assets").length(); i++) {
                        JSONObject asset = release.getJSONArray("assets").getJSONObject(i);
                        if (asset.getString("name").endsWith(".apk")) {
                            downloadUrl = asset.getString("browser_download_url");
                            break;
                        }
                    }

                    if (isNewerVersion(currentVersion, latestVersion) && !downloadUrl.isEmpty()) {
                        String finalDownloadUrl = downloadUrl;
                        mainHandler.post(() -> showUpdateDialog(
                                latestVersion, releaseNotes, finalDownloadUrl));
                    }
                }

                conn.disconnect();
            } catch (Exception e) {
                // Silently fail - update check is non-critical
            }
        });
    }

    private String getCurrentVersion() {
        try {
            PackageInfo info = activity.getPackageManager()
                    .getPackageInfo(activity.getPackageName(), 0);
            return info.versionName;
        } catch (PackageManager.NameNotFoundException e) {
            return "0.0.0";
        }
    }

    private boolean isNewerVersion(String current, String latest) {
        String[] currentParts = current.split("\\.");
        String[] latestParts = latest.split("\\.");

        for (int i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
            int c = i < currentParts.length ? Integer.parseInt(currentParts[i]) : 0;
            int l = i < latestParts.length ? Integer.parseInt(latestParts[i]) : 0;
            if (l > c) return true;
            if (l < c) return false;
        }
        return false;
    }

    private void showUpdateDialog(String version, String notes, String downloadUrl) {
        if (activity.isFinishing() || activity.isDestroyed()) return;

        String message = "새 버전 v" + version + "이 있습니다.\n\n";
        if (!notes.isEmpty()) {
            message += notes + "\n\n";
        }
        message += "지금 업데이트하시겠습니까?";

        new AlertDialog.Builder(activity)
                .setTitle("온에어 업데이트")
                .setMessage(message)
                .setPositiveButton("업데이트", (dialog, which) -> {
                    Intent intent = new Intent(Intent.ACTION_VIEW, Uri.parse(downloadUrl));
                    activity.startActivity(intent);
                })
                .setNegativeButton("나중에", null)
                .setCancelable(true)
                .show();
    }
}
