from PIL import Image
from pathlib import Path
pages = sorted(Path('qa').glob('paper-*.png'))
thumb_width = 420
thumbs = []
for page in pages:
    image = Image.open(page).convert('RGB')
    height = int(image.height * thumb_width / image.width)
    thumbs.append(image.resize((thumb_width, height)))
height = max(image.height for image in thumbs)
sheet = Image.new('RGB', (thumb_width * 3, height * 2), (235, 235, 235))
for index, image in enumerate(thumbs):
    sheet.paste(image, ((index % 3) * thumb_width, (index // 3) * height))
sheet.save('qa/contact.png')
