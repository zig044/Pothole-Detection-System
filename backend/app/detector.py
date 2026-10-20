from ultralytics import YOLO

model = YOLO("best.pt")


def detect_pothole(image_path):
    results = model(
        image_path,
        conf=0.20,
        imgsz=1280
    )

    best_detection = None

    for result in results:
        for box in result.boxes:
            class_id = int(box.cls[0])
            confidence = float(box.conf[0])

            # Class 2 = pothole
            if class_id != 2:
                continue

            x1, y1, x2, y2 = box.xyxy[0].tolist()

            image_height, image_width = result.orig_shape

            detection = {
                "confidence": confidence,
                "x": int(x1),
                "y": int(y1),
                "width": int(x2 - x1),
                "height": int(y2 - y1),
                "image_width": image_width,
                "image_height": image_height
            }

            if (
                best_detection is None
                or confidence > best_detection["confidence"]
            ):
                best_detection = detection

    return best_detection