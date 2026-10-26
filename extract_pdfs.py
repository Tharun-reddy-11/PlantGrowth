from pathlib import Path
from pypdf import PdfReader

paths = [
    Path(r"C:\Users\Tharu\OneDrive\Desktop\Diabetic_Prediction.pdf"),
    Path(r"C:\Users\Tharu\OneDrive\Desktop\Jagadeesh Project\Abstract_1_corrected_v2 (1).pdf"),
    Path(r"C:\Users\Tharu\OneDrive\Desktop\Jagadeesh Project\An_Innovative_Self-Adhesive_Wearable_Sensor_Based_on_Fiber_Bragg_Grating_Technology_for_Plant_Growth_Monitoring.pdf"),
    Path(r"C:\Users\Tharu\OneDrive\Desktop\Jagadeesh Project\TITLE1.pdf"),
]
for path in paths:
    reader = PdfReader(str(path))
    text = "".join(page.extract_text() or "" for page in reader.pages)
    print(f"\nFILE: {path.name}\nPAGES: {len(reader.pages)}\n{text[:14000]}\n--- END ---")
