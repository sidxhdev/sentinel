#include "esp_camera.h"
#include <WiFi.h>
#include "esp_timer.h"
#include "img_converters.h"
#include "Arduino.h"
#include "fb_gfx.h"
#include "esp_http_server.h"

// ================= CAMERA MODEL =================
#define CAMERA_MODEL_AI_THINKER
#include "camera_pins.h"

// ================= WIFI CREDENTIALS ==============
// Multiple WiFi networks - will connect to first available
struct WiFiNetwork {
  const char* ssid;
  const char* password;
};

WiFiNetwork networks[] = {
  {"siddesh", "qwerty123"},
  {"We go gym", "siddesh@1903"}
};

const int numNetworks = sizeof(networks) / sizeof(networks[0]);

// ================= HTTP SERVER ==================
static httpd_handle_t stream_httpd = NULL;

// Stream handler
static esp_err_t stream_handler(httpd_req_t *req) {
  camera_fb_t *fb = NULL;
  esp_err_t res = ESP_OK;
  size_t jpg_buf_len;
  uint8_t *jpg_buf;
  char part_buf[64];

  res = httpd_resp_set_type(req, "multipart/x-mixed-replace;boundary=frame");
  if (res != ESP_OK) return res;

  while (true) {
    fb = esp_camera_fb_get();
    if (!fb) {
      Serial.println("Camera capture failed");
      res = ESP_FAIL;
    } else {
      if (fb->format != PIXFORMAT_JPEG) {
        bool jpeg_converted = frame2jpg(fb, 80, &jpg_buf, &jpg_buf_len);
        esp_camera_fb_return(fb);
        fb = NULL;
        if (!jpeg_converted) {
          Serial.println("JPEG compression failed");
          res = ESP_FAIL;
        }
      } else {
        jpg_buf_len = fb->len;
        jpg_buf = fb->buf;
      }
    }

    if (res == ESP_OK) {
      size_t hlen = snprintf(part_buf, 64,
                             "--frame\r\nContent-Type: image/jpeg\r\n\r\n");
      httpd_resp_send_chunk(req, part_buf, hlen);
      httpd_resp_send_chunk(req, (const char*)jpg_buf, jpg_buf_len);
      httpd_resp_send_chunk(req, "\r\n", 2);
    }

    if (fb) esp_camera_fb_return(fb);
    if (res != ESP_OK) break;
    vTaskDelay(30 / portTICK_PERIOD_MS); // small delay between frames
  }
  return res;
}

// Start server
void startCameraServer() {
  httpd_config_t config = HTTPD_DEFAULT_CONFIG();
  config.server_port = 80;

  httpd_uri_t stream_uri = {
    .uri       = "/stream",
    .method    = HTTP_GET,
    .handler   = stream_handler,
    .user_ctx  = NULL
  };

  if (httpd_start(&stream_httpd, &config) == ESP_OK) {
    httpd_register_uri_handler(stream_httpd, &stream_uri);
    Serial.println("Camera stream started on /stream");
  }
}

// ================= SETUP =================
void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

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
  config.frame_size   = FRAMESIZE_VGA;   // 🔹 640x480 - Good quality and speed
  config.pixel_format = PIXFORMAT_JPEG;
  config.fb_location  = CAMERA_FB_IN_PSRAM;
  config.jpeg_quality = 10;                // 🔹 Lower = better quality (0–63)
  config.fb_count     = 2;

  // Initialize camera
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }

  // 🔧 Adjust camera sensor settings
  sensor_t *s = esp_camera_sensor_get();
  s->set_brightness(s, 1);
  s->set_contrast(s, 1);
  s->set_saturation(s, 1);
  s->set_sharpness(s, 1);
  s->set_whitebal(s, 1);
  s->set_awb_gain(s, 1);
  s->set_gain_ctrl(s, 1);
  s->set_exposure_ctrl(s, 1);
  s->set_hmirror(s, 1);
  s->set_vflip(s, 0);

  // Connect WiFi - Try all networks
  WiFi.setSleep(false);
  bool connected = false;
  
  for (int i = 0; i < numNetworks && !connected; i++) {
    Serial.print("Attempting to connect to: ");
    Serial.println(networks[i].ssid);
    
    WiFi.begin(networks[i].ssid, networks[i].password);
    
    int attempts = 0;
    while (WiFi.status() != WL_CONNECTED && attempts < 20) {
      delay(500);
      Serial.print(".");
      attempts++;
    }
    
    if (WiFi.status() == WL_CONNECTED) {
      connected = true;
      Serial.println("\n");
      Serial.println("========================================");
      Serial.println("✅ WiFi Connected Successfully!");
      Serial.println("========================================");
      Serial.print("📶 Network: ");
      Serial.println(networks[i].ssid);
      Serial.print("📍 IP Address: ");
      Serial.println(WiFi.localIP());
      Serial.print("📷 Stream URL: http://");
      Serial.print(WiFi.localIP());
      Serial.println("/stream");
      Serial.println("========================================");
    } else {
      Serial.println("\n❌ Failed to connect to this network");
      WiFi.disconnect();
    }
  }
  
  if (!connected) {
    Serial.println("❌ Could not connect to any WiFi network!");
    return;
  }

  startCameraServer();
}

void loop() {
  delay(10000);
}