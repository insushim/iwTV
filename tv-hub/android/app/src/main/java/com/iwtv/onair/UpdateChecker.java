package com.iwtv.onair;

import android.app.Activity;
import android.app.DownloadManager;
import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.Intent;
import android.content.IntentFilter;
import android.content.pm.PackageInfo;
import android.net.Uri;
import android.os.Build;
import android.os.Environment;
import android.util.Log;
import android.widget.Toast;

import androidx.appcompat.app.AlertDialog;

import org.json.JSONArray;
import org.json.JSONObject;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;

public class UpdateChecker {

    private static final String TAG = "UpdateChecker";
    private static final String GITHUB_API =
            "https://api.github.com/repos/insushim/iwTV/releases/latest";

    public static void check(Activity activity) {
        new Thread(() -> {
            try {
                URL url = new URL(GITHUB_API);
                HttpURLConnection conn = (HttpURLConnection) url.openConnection();
                conn.setRequestMethod("GET");
                conn.setRequestProperty("Accept", "application/vnd.github+json");
                conn.setConnectTimeout(5000);
                conn.setReadTimeout(5000);

                if (conn.getResponseCode() != 200) return;

                BufferedReader reader = new BufferedReader(
                        new InputStreamReader(conn.getInputStream()));
                StringBuilder sb = new StringBuilder();
                String line;
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
                reader.close();
                conn.disconnect();

                JSONObject json = new JSONObject(sb.toString());
                String tagName = json.getString("tag_name");
                String latestVersion = tagName.startsWith("v") ? tagName.substring(1) : tagName;

                PackageInfo pInfo = activity.getPackageManager()
                        .getPackageInfo(activity.getPackageName(), 0);
                String currentVersion = pInfo.versionName;

                if (!isNewer(latestVersion, currentVersion)) return;

                JSONArray assets = json.getJSONArray("assets");
                String downloadUrl = null;
                for (int i = 0; i < assets.length(); i++) {
                    JSONObject asset = assets.getJSONObject(i);
                    if (asset.getString("name").endsWith(".apk")) {
                        downloadUrl = asset.getString("browser_download_url");
                        break;
                    }
                }

                if (downloadUrl != null) {
                    String body = json.optString("body", "");
                    showUpdateDialog(activity, latestVersion, downloadUrl, body);
                }
            } catch (Exception e) {
                Log.e(TAG, "Update check failed", e);
            }
        }).start();
    }

    private static boolean isNewer(String latest, String current) {
        try {
            String[] l = latest.split("\\.");
            String[] c = current.split("\\.");
            for (int i = 0; i < Math.max(l.length, c.length); i++) {
                int lv = i < l.length ? Integer.parseInt(l[i]) : 0;
                int cv = i < c.length ? Integer.parseInt(c[i]) : 0;
                if (lv > cv) return true;
                if (lv < cv) return false;
            }
        } catch (NumberFormatException e) {
            Log.e(TAG, "Version parse error", e);
        }
        return false;
    }

    private static void showUpdateDialog(Activity activity, String version,
                                          String downloadUrl, String notes) {
        activity.runOnUiThread(() -> {
            String message = "v" + version + " 버전이 출시되었습니다.";
            if (notes != null && !notes.isEmpty()) {
                message += "\n\n" + notes;
            }
            message += "\n\n업데이트하시겠습니까?";

            new AlertDialog.Builder(activity)
                    .setTitle("새 버전 사용 가능")
                    .setMessage(message)
                    .setPositiveButton("업데이트", (d, w) ->
                            downloadAndInstall(activity, downloadUrl, version))
                    .setNegativeButton("나중에", null)
                    .show();
        });
    }

    private static void downloadAndInstall(Activity activity, String url, String version) {
        try {
            DownloadManager.Request request = new DownloadManager.Request(Uri.parse(url));
            request.setTitle("온에어 v" + version);
            request.setDescription("업데이트 다운로드 중...");
            request.setNotificationVisibility(
                    DownloadManager.Request.VISIBILITY_VISIBLE_NOTIFY_COMPLETED);
            request.setDestinationInExternalPublicDir(
                    Environment.DIRECTORY_DOWNLOADS, "onair-v" + version + ".apk");
            request.setMimeType("application/vnd.android.package-archive");

            DownloadManager dm = (DownloadManager) activity.getSystemService(
                    Context.DOWNLOAD_SERVICE);
            long downloadId = dm.enqueue(request);

            Toast.makeText(activity, "다운로드를 시작합니다...", Toast.LENGTH_SHORT).show();

            BroadcastReceiver receiver = new BroadcastReceiver() {
                @Override
                public void onReceive(Context context, Intent intent) {
                    long id = intent.getLongExtra(DownloadManager.EXTRA_DOWNLOAD_ID, -1);
                    if (id == downloadId) {
                        Uri apkUri = dm.getUriForDownloadedFile(downloadId);
                        if (apkUri != null) {
                            Intent installIntent = new Intent(Intent.ACTION_VIEW);
                            installIntent.setDataAndType(apkUri,
                                    "application/vnd.android.package-archive");
                            installIntent.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION);
                            installIntent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
                            try {
                                activity.startActivity(installIntent);
                            } catch (Exception e) {
                                Toast.makeText(activity,
                                        "Downloads 폴더에서 APK를 설치해주세요.",
                                        Toast.LENGTH_LONG).show();
                            }
                        }
                        try {
                            context.unregisterReceiver(this);
                        } catch (Exception ignored) {}
                    }
                }
            };

            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                activity.registerReceiver(receiver,
                        new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE),
                        Context.RECEIVER_EXPORTED);
            } else {
                activity.registerReceiver(receiver,
                        new IntentFilter(DownloadManager.ACTION_DOWNLOAD_COMPLETE));
            }
        } catch (Exception e) {
            Toast.makeText(activity, "다운로드 실패. 다시 시도해주세요.", Toast.LENGTH_SHORT).show();
            Log.e(TAG, "Download failed", e);
        }
    }
}
