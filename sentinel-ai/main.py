import cv2
import face_recognition
import numpy as np
import os
import requests
from flask import Flask, Response, jsonify

# ==============================
# CONFIGURATION
# ==============================
ESP32_URL = "http://10.186.71.99/stream"  # 🔹 Change to your ESP32-CAM IP
API_URL = "http://localhost:3000/face-data"  # 🔹 Node API endpoint

# ==============================
# LOAD KNOWN FACES
# ==============================
print("🔍 Loading known faces...")
known_faces_dir = "known_faces"
known_face_encodings = []
known_face_names = []

# Load images directly from known_faces folder
for filename in os.listdir(known_faces_dir):
    if filename.lower().endswith(('.jpg', '.jpeg', '.png')):
        path = os.path.join(known_faces_dir, filename)
        img = face_recognition.load_image_file(path)
        encodings = face_recognition.face_encodings(img)
        
        if len(encodings) > 0:
            # Use filename without extension as the person's name
            name = os.path.splitext(filename)[0]
            known_face_encodings.append(encodings[0])
            known_face_names.append(name)
            print(f"✅ Loaded face for {name}")
        else:
            print(f"⚠️ No face detected in {filename}")

print(f"📸 Total known faces: {len(known_face_encodings)}")

# ==============================
# FLASK APP FOR STREAMING
# ==============================
app = Flask(__name__)

# Store current stats
current_stats = {
    "face_count": 0,
    "recognized_faces": [],
    "intrusion_detected": False
}

def generate_frames():
    cap = cv2.VideoCapture(ESP32_URL)
    if not cap.isOpened():
        print("❌ Cannot connect to ESP32 stream. Check URL or Wi-Fi.")
        return

    while True:
        ret, frame = cap.read()
        if not ret or frame is None:
            print("⚠ Frame lost, reconnecting...")
            cap.release()
            cap = cv2.VideoCapture(ESP32_URL)
            continue

        # Face detection and recognition
        rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        face_locations = face_recognition.face_locations(rgb_frame)
        face_encodings = face_recognition.face_encodings(rgb_frame, face_locations)

        face_names = []
        intrusion = False

        for encoding in face_encodings:
            matches = face_recognition.compare_faces(known_face_encodings, encoding)
            name = "Unknown"

            face_distances = face_recognition.face_distance(known_face_encodings, encoding)
            if len(face_distances) > 0:
                best_match_index = np.argmin(face_distances)
                if matches[best_match_index]:
                    name = known_face_names[best_match_index]

            if name == "Unknown":
                intrusion = True  # 🚨 Unknown face detected!
            face_names.append(name)

        # Update current stats
        current_stats["face_count"] = len(face_locations)
        current_stats["recognized_faces"] = face_names
        current_stats["intrusion_detected"] = intrusion

        # Draw green boxes for known, red for unknown
        for (top, right, bottom, left), name in zip(face_locations, face_names):
            color = (0, 255, 0) if name != "Unknown" else (0, 0, 255)
            cv2.rectangle(frame, (left, top), (right, bottom), color, 2)
            cv2.putText(frame, name, (left, top - 10),
                        cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 2)

        # Send data to Node API
        try:
            requests.post(API_URL, json={
                "count": len(face_locations),
                "people": face_names,
                "intrusion": intrusion
            }, timeout=1)
        except requests.exceptions.RequestException as e:
            print(f"⚠ Failed to send data: {e}")

        # Stream to frontend
        ret, buffer = cv2.imencode('.jpg', frame)
        frame_bytes = buffer.tobytes()
        yield (b'--frame\r\n'
               b'Content-Type: image/jpeg\r\n\r\n' + frame_bytes + b'\r\n')

@app.route('/video_feed')
def video_feed():
    """Stream the processed video to browser"""
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stats')
def stats():
    """Get current face detection stats"""
    return jsonify(current_stats)

@app.route('/')
def index():
    return jsonify({"status": "AI Stream Running", "source": ESP32_URL})

# ==============================
# START FLASK SERVER
# ==============================
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)