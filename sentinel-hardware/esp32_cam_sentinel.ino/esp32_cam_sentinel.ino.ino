#include "esp_camera.h"
#include <WiFi.h>
#include "esp_http_server.h"

#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// ================= WIFI CONFIGURATION =================
struct WiFiNetwork {
  const char* ssid;
  const char* password;
};

// Add your WiFi networks here
WiFiNetwork networks[] = {
  {"siddesh", "qwerty123"},
  {"We go gym", "siddesh@1903"}
};
const int numNetworks = sizeof(networks) / sizeof(networks[0]);

// ================= VARIABLES =================
String lastFaceResult = "NO_FACE";
unsigned long lastFaceTime = 0;

// ================= HTTP SERVER =================
static httpd_handle_t stream_httpd = NULL;

// ================= MJPEG STREAM HANDLER =================
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t *fb = NULL;
  esp_err_t res = ESP_OK;
  size_t jpg_buf_len;
  uint8_t *jpg_buf;
  char part_buf[64];

  res = httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=frame");
  if (res != ESP_OK) {
    return res;
  }

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("❌ Camera capture failed");
      res = ESP_FAIL;
      break;
    }

    if (fb->format != PIXFORMAT_JPEG) {
      bool jpeg_converted = frame2jpg(fb, 80, &jpg_buf, &jpg_buf_len);
      esp_camera_fb_return(fb);
      fb = NULL;
      if (!jpeg_converted) {
        Serial.println("❌ JPEG compression failed");
        res = ESP_FAIL;
        break;
      }
    } else {
      jpg_buf_len = fb->len;
      jpg_buf = fb->buf;
    }

    if (res == ESP_OK) {
      size_t hlen = snprintf(part_buf, 64, 
                             "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %u\r\n\r\n", 
                             jpg_buf_len);
      res = httpd_resp_send_chunk(req, part_buf, hlen);
    }

    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, (const char *)jpg_buf, jpg_buf_len);
    }

    if (res == ESP_OK) {
      res = httpd_resp_send_chunk(req, "\r\n", 2);
    }

    if (fb) {
      esp_camera_fb_return(fb);
      fb = NULL;
      jpg_buf = NULL;
    } else if (jpg_buf) {
      free(jpg_buf);
      jpg_buf = NULL;
    }

    if (res != ESP_OK) {
      break;
    }
  }

  return res;
}

// ================= FACE RESULT HANDLER =================
// Python backend sends face recognition results here
static esp_err_t face_result_handler(httpd_req_t *req) {
  char content[100];
  size_t recv_size = min(req->content_len, sizeof(content));

  int ret = httpd_req_recv(req, content, recv_size);
  if (ret <= 0) {
    if (ret == HTTPD_SOCK_ERR_TIMEOUT) {
      httpd_resp_send_408(req);
    }
    return ESP_FAIL;
  }

  content[recv_size] = '\0';
  lastFaceResult = String(content);
  lastFaceTime = millis();
  
  Serial.println("========================================");
  Serial.print("📩 Face Result: ");
  Serial.println(lastFaceResult);
  Serial.println("========================================");
  
  httpd_resp_send(req, "OK", 2);
  return ESP_OK;
}

// ================= STATUS PAGE HANDLER =================
static esp_err_t status_handler(httpd_req_t *req) {
  char response[500];
  unsigned long uptime = millis() / 1000;
  
  snprintf(response, sizeof(response),
    "<!DOCTYPE html>"
    "<html><head><meta name='viewport' content='width=device-width,initial-scale=1'>"
    "<style>body{font-family:Arial;margin:20px;background:#f0f0f0}"
    "h1{color:#333}.info{background:white;padding:15px;margin:10px 0;border-radius:5px}"
    ".result{font-size:24px;font-weight:bold;color:%s}</style></head>"
    "<body><h1>ESP32-CAM Sentinel AI</h1>"
    "<div class='info'><strong>Status:</strong> Running</div>"
    "<div class='info'><strong>Uptime:</strong> %lu seconds</div>"
    "<div class='info'><strong>IP Address:</strong> %s</div>"
    "<div class='info'><strong>Last Face Result:</strong><br><span class='result'>%s</span></div>"
    "<div class='info'><strong>Stream URL:</strong><br><a href='/stream'>http://%s/stream</a></div>"
    "</body></html>",
    (lastFaceResult == "UNKNOWN" || lastFaceResult.startsWith("UNKNOWN")) ? "#ff0000" : "#00aa00",
    uptime,
    WiFi.localIP().toString().c_str(),
    lastFaceResult.c_str(),
    WiFi.localIP().toString().c_str()
  );
  
  httpd_resp_set_type(req, "text/html");
  httpd_resp_send(req, response, strlen(response));
  return ESP_OK;
}

// ================= START CAMERA SERVER =================
void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;
  config.ctrl_port = 32768;

  // Video stream endpoint
  httpd_uri_t stream_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };

  // Face recognition result endpoint
  httpd_uri_t face_uri = {
    .uri       = "/face-result",
    .method    = HTTP_POST,
    .handler   = face_result_handler,
    .user_ctx  = NULL
  };

  // Status page endpoint
  httpd_uri_t status_uri = {
    .uri       = "/",
    .method    = HTTP_GET,
    .handler   = status_handler,
    .user_ctx  = NULL
  };

  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
    httpd_register_uri_handler(stream_httpd, &face_uri);
    httpd_register_uri_handler(stream_httpd, &status_uri);
    
    Serial.println("✅ HTTP Server Started");
    Serial.println("   📹 /stream - MJPEG video stream");
    Serial.println("   📨 /face-result - Receive face data (POST)");
    Serial.println("   🏠 / - Status page");
  } else {
    Serial.println("❌ Failed to start HTTP server");
  }
}

// ================= SETUP =================
void setup() {
  // Serial for debugging
  Serial.begin(115200);
  Serial.setDebugOutput(false);
  delay(2000);
  
  Serial.println();
  Serial.println();
  Serial.println("========================================");
  Serial.println("🔵 ESP32-CAM SENTINEL AI");
  Serial.println("========================================");

  // ================= CAMERA CONFIGURATION =================
  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer   = LEDC_TIMER_0;
  config.pin_d0       = Y2_GPIO_NUM;
  config.pin_d1       = Y3_GPIO_NUM;
  config.pin_d2       = Y4_GPIO_NUM;
  config.pin_d3       = Y5_GPIO_NUM;
  config.pin_d4       = Y6_GPIO_NUM;
  config.pin_d5       = Y7_GPIO_NUM;
  config.pin_d6       = Y8_GPIO_NUM;
  config.pin_d7       = Y9_GPIO_NUM;
  config.pin_xclk     = XCLK_GPIO_NUM;
  config.pin_pclk     = PCLK_GPIO_NUM;
  config.pin_vsync    = VSYNC_GPIO_NUM;
  config.pin_href     = HREF_GPIO_NUM;
  config.pin_sccb_sda = SIOD_GPIO_NUM;
  config.pin_sccb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn     = PWDN_GPIO_NUM;
  config.pin_reset    = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;
  config.frame_size   = FRAMESIZE_VGA;  // 640x480
  config.jpeg_quality = 12;  // 0-63 (lower = higher quality)
  config.fb_count     = 1;
  config.fb_location  = CAMERA_FB_IN_PSRAM;
  config.grab_mode    = CAMERA_GRAB_LATEST;

  // Camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("❌ Camera init failed with error 0x%x\n", err);
    Serial.println("⚠️ Check camera cable connection!");
    return;
  }
  Serial.println("✅ Camera initialized");

  // Camera settings
  sensor_t *s = esp_camera_sensor_get();
  s->set_brightness(s, 0);     // -2 to 2
  s->set_contrast(s, 0);       // -2 to 2
  s->set_saturation(s, 0);     // -2 to 2
  s->set_special_effect(s, 0); // 0-6 (0=None)
  s->set_whitebal(s, 1);       // 0=disable, 1=enable
  s->set_awb_gain(s, 1);       // 0=disable, 1=enable
  s->set_wb_mode(s, 0);        // 0-4
  s->set_exposure_ctrl(s, 1);  // 0=disable, 1=enable
  s->set_aec2(s, 0);           // 0=disable, 1=enable
  s->set_ae_level(s, 0);       // -2 to 2
  s->set_aec_value(s, 300);    // 0 to 1200
  s->set_gain_ctrl(s, 1);      // 0=disable, 1=enable
  s->set_agc_gain(s, 0);       // 0 to 30
  s->set_gainceiling(s, (gainceiling_t)0); // 0 to 6
  s->set_bpc(s, 0);            // 0=disable, 1=enable
  s->set_wpc(s, 1);            // 0=disable, 1=enable
  s->set_raw_gma(s, 1);        // 0=disable, 1=enable
  s->set_lenc(s, 1);           // 0=disable, 1=enable
  s->set_hmirror(s, 0);        // 0=disable, 1=enable
  s->set_vflip(s, 0);          // 0=disable, 1=enable
  s->set_dcw(s, 1);            // 0=disable, 1=enable
  s->set_colorbar(s, 0);       // 0=disable, 1=enable

  // ================= WIFI CONNECTION =================
  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);
  
  bool connected = false;
  
  Serial.println("📡 Connecting to WiFi...");
  
  for (int i = 0; i < numNetworks && !connected; i++) {
    Serial.print("   Trying: ");
    Serial.print(networks[i].ssid);
    Serial.print(" ... ");
    
    WiFi.begin(networks[i].ssid, networks[i].password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      connected = true;
      Serial.println(" ✅ Connected!");
    } else {
      Serial.println(" ❌ Failed");
      WiFi.disconnect();
    }
  }

  if (!connected) {
    Serial.println("========================================");
    Serial.println("❌ No WiFi networks available!");
    Serial.println("========================================");
    return;
  }

  // Display connection info
  Serial.println();
  Serial.println("========================================");
  Serial.println("✅ SYSTEM READY");
  Serial.println("========================================");
  Serial.print("📶 Network: ");
  Serial.println(WiFi.SSID());
  Serial.print("📍 IP Address: ");
  Serial.println(WiFi.localIP());
  Serial.print("📶 Signal Strength: ");
  Serial.print(WiFi.RSSI());
  Serial.println(" dBm");
  Serial.println();
  Serial.println("🌐 URLs:");
  Serial.print("   Status Page:  http://");
  Serial.println(WiFi.localIP());
  Serial.print("   Video Stream: http://");
  Serial.print(WiFi.localIP());
  Serial.println("/stream");
  Serial.print("   Face Result:  http://");
  Serial.print(WiFi.localIP());
  Serial.println("/face-result");
  Serial.println("========================================");

  // Start HTTP server
  startCameraServer();
  
  Serial.println("✅ ESP32-CAM is running!");
  Serial.println("   Waiting for face recognition results...");
}

// ================= MAIN LOOP =================
void loop() {
  // Main loop - server runs in background
  delay(1000);
  
  // Optional: Print periodic status
  static unsigned long lastPrint = 0;
  if (millis() - lastPrint > 60000) {  // Every 60 seconds
    lastPrint = millis();
    Serial.print("⏰ Uptime: ");
    Serial.print(millis() / 1000);
    Serial.print(" seconds | Last face: ");
    Serial.println(lastFaceResult);
  }
}
