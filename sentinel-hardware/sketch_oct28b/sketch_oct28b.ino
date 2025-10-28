/*
 * SENTINEL AI - Motion Detection System
 * STM32F103C8T6 Blue Pill
 * 
 * Hardware Connections:
 * - PIR Sensor Signal → PA0
 * - Buzzer (+)       → PA1
 * - PIR VCC          → 3.3V
 * - PIR GND          → GND
 * - Buzzer (-)       → GND
 * 
 * Function:
 * - Beeps 3 times IMMEDIATELY when motion detected
 * - Then beeps 3 times every 1 minute if motion continues
 * - LED indicator during motion
 * 
 * Author: Sentinel AI Team
 * Date: October 28, 2025
 */

// ==================== PIN DEFINITIONS ====================
#define PIR_PIN PA0        // PIR motion sensor input
#define BUZZER_PIN PA1     // Buzzer output
#define LED_PIN PC13       // Onboard LED (active LOW)

// ==================== TIMING CONSTANTS ====================
const unsigned long BEEP_INTERVAL = 60000;  // 1 minute in milliseconds
const int BEEP_DURATION = 300;              // Beep length (ms)
const int BEEP_GAP = 200;                   // Gap between beeps (ms)
const int NUM_BEEPS = 3;                    // Number of beeps

// ==================== GLOBAL VARIABLES ====================
unsigned long motionStartTime = 0;          // When motion first detected
unsigned long lastBeepTime = 0;             // Timestamp of last beep
bool motionActive = false;                  // Motion flag
bool firstBeepDone = false;                 // Track if first beep completed

// ==================== SETUP ====================
void setup() {
  // Initialize Serial Monitor
  Serial.begin(115200);
  delay(1000);
  
  // Print startup banner
  Serial.println();
  Serial.println("========================================");
  Serial.println("  SENTINEL AI - MOTION DETECTION SYSTEM");
  Serial.println("========================================");
  Serial.println("  STM32 Blue Pill (STM32F103C8T6)");
  Serial.println("========================================");
  Serial.println();
  
  // Configure pins
  pinMode(PIR_PIN, INPUT);
  pinMode(BUZZER_PIN, OUTPUT);
  pinMode(LED_PIN, OUTPUT);
  
  // Set initial states
  digitalWrite(BUZZER_PIN, LOW);   // Buzzer OFF
  digitalWrite(LED_PIN, HIGH);     // LED OFF (active LOW)
  
  // Print configuration
  Serial.println("Configuration:");
  Serial.println("  PIR Sensor    : PA0");
  Serial.println("  Buzzer        : PA1");
  Serial.println("  LED Indicator : PC13");
  Serial.println();
  Serial.println("Operation:");
  Serial.println("  - Beeps 3 times IMMEDIATELY on motion");
  Serial.println("  - Repeats every 1 minute if motion continues");
  Serial.println("  - LED ON during motion detection");
  Serial.println();
  Serial.println("========================================");
  Serial.println("✅ SYSTEM READY - Monitoring Started");
  Serial.println("========================================");
  Serial.println();
}

// ==================== MAIN LOOP ====================
void loop() {
  // Read PIR sensor state
  int pirState = digitalRead(PIR_PIN);
  
  // Check if motion is detected
  if (pirState == HIGH) {
    // Motion detected
    
    if (!motionActive) {
      // ===== FIRST DETECTION - Motion just started =====
      motionActive = true;
      firstBeepDone = false;
      
      // Turn LED ON
      digitalWrite(LED_PIN, LOW);  // Active LOW
      
      // Record motion start time
      motionStartTime = millis();
      lastBeepTime = millis();
      
      // Log to serial
      Serial.println("👤 MOTION DETECTED!");
      Serial.print("   Time: ");
      Serial.print(millis() / 1000);
      Serial.println(" seconds");
      Serial.println();
      
      // ===== BEEP IMMEDIATELY (First Beep) =====
      Serial.println("🔊 IMMEDIATE ALERT - First Detection");
      soundAlarm();
      firstBeepDone = true;
      
      Serial.println("   Waiting for 1 minute...");
      Serial.println();
    }
    else if (firstBeepDone) {
      // ===== Motion is continuing - check if 1 minute passed =====
      unsigned long currentTime = millis();
      unsigned long elapsedTime = currentTime - lastBeepTime;
      
      if (elapsedTime >= BEEP_INTERVAL) {
        // 1 minute has elapsed since last beep
        Serial.println("⏰ 1 MINUTE PASSED - Motion Still Active");
        Serial.print("   Time: ");
        Serial.print(currentTime / 1000);
        Serial.println(" seconds");
        Serial.print("   Elapsed: ");
        Serial.print(elapsedTime / 1000);
        Serial.println(" seconds since last beep");
        Serial.println();
        
        // Sound alarm again
        Serial.println("🔊 REPEAT ALERT - Motion Continues");
        soundAlarm();
        
        // Update last beep time
        lastBeepTime = currentTime;
        
        Serial.println("   Waiting for next 1 minute...");
        Serial.println();
      }
    }
    
  } else {
    // ===== No motion detected =====
    
    if (motionActive) {
      // Motion just stopped
      motionActive = false;
      firstBeepDone = false;
      
      // Turn LED OFF
      digitalWrite(LED_PIN, HIGH);  // Active LOW
      
      // Calculate total motion duration
      unsigned long totalDuration = millis() - motionStartTime;
      
      // Log to serial
      Serial.println("✓ MOTION ENDED");
      Serial.print("   Time: ");
      Serial.print(millis() / 1000);
      Serial.println(" seconds");
      Serial.print("   Total duration: ");
      Serial.print(totalDuration / 1000);
      Serial.println(" seconds");
      Serial.println("   System reset - Ready for next detection");
      Serial.println();
      
      // Reset timers
      motionStartTime = 0;
      lastBeepTime = 0;
    }
  }
  
  // Small delay to avoid excessive readings
  delay(100);
}

// ==================== SOUND ALARM FUNCTION ====================
void soundAlarm() {
  for (int i = 0; i < NUM_BEEPS; i++) {
    Serial.print("   🔊 Beep ");
    Serial.println(i + 1);
    
    // Turn buzzer ON
    digitalWrite(BUZZER_PIN, HIGH);
    delay(BEEP_DURATION);
    
    // Turn buzzer OFF
    digitalWrite(BUZZER_PIN, LOW);
    
    // Gap between beeps (except after last beep)
    if (i < NUM_BEEPS - 1) {
      delay(BEEP_GAP);
    }
  }
  
  Serial.println("✅ Alarm complete");
  Serial.println();
}
