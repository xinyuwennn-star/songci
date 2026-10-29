"""v6：用侧视图提取轮廓，平滑宽度，保留颜色"""
from PIL import Image
import json, os, math

BASE = r"C:\Users\LENOVO\Desktop\宋瓷五窑纪"

IMAGES = {
    "ruyao":   "img/ref_ru.png",
    "guanyao": "img/ref_guan.png",
    "geyao":   "img/ref_ge.png",
    "junyao":  "img/ref_jun.png",
    "dingyao": "img/ref_ding.png",
}

def extract_vase(path, target_h=320):
    img = Image.open(path).convert("RGB")
    w, h = img.size
    mid_w = w // 3
    img = img.crop((mid_w, 0, mid_w * 2, h))
    w, h = mid_w, h
    scale = target_h / h
    new_w = int(w * scale)
    img = img.resize((new_w, target_h), Image.LANCZOS)
    px = img.load()

    def is_vase(r, g, b):
        return (r + g + b) > 60

    row_data = []
    row_has = []
    for y in range(target_h):
        left = -1
        right = -1
        sum_r, sum_g, sum_b, cnt = 0, 0, 0, 0
        for x in range(new_w):
            r, g, b = px[x, y]
            if is_vase(r, g, b):
                if left == -1: left = x
                right = x
                if (r + g + b) > 280:
                    sum_r += r; sum_g += g; sum_b += b; cnt += 1
        if left > 0 and right > left:
            row_has.append(y)
            if cnt > 0:
                ar = sum_r // cnt; ag = sum_g // cnt; ab = sum_b // cnt
            else:
                ar = ag = ab = 200
            row_data.append({'y': y, 'left': left, 'right': right, 'r': ar, 'g': ag, 'b': ab})

    best_start, best_len = 0, 0
    cur_start, cur_len = 0, 0
    for i, y in enumerate(row_has):
        if i == 0:
            cur_start = i; cur_len = 1
        else:
            if row_has[i] - row_has[i-1] <= 4:
                cur_len += 1
            else:
                if cur_len > best_len:
                    best_len = cur_len; best_start = cur_start
                cur_start = i; cur_len = 1
    if cur_len > best_len:
        best_len = cur_len; best_start = cur_start
    rows = row_data[best_start:best_start + best_len]

    for i in range(2, len(rows)-2):
        w_avg = (rows[i-2]['right']-rows[i-2]['left'] +
                 rows[i-1]['right']-rows[i-1]['left'] +
                 rows[i+1]['right']-rows[i+1]['left'] +
                 rows[i+2]['right']-rows[i+2]['left']) / 4
        w_now = rows[i]['right'] - rows[i]['left']
        if w_now > w_avg * 1.3:
            center = (rows[i]['left'] + rows[i]['right']) // 2
            rows[i]['left'] = int(center - w_avg/2)
            rows[i]['right'] = int(center + w_avg/2)

    min_y = rows[0]['y']
    max_y = rows[-1]['y']
    vase_h_px = max_y - min_y
    max_w_px = max(r['right'] - r['left'] for r in rows)
    s = 0.85 / (max_w_px / 2)
    half_h = vase_h_px * s / 2

    points = []
    ANGULAR = 240
    for row in rows:
        width = row['right'] - row['left']
        t = (row['y'] - min_y) / vase_h_px
        radius = (width / 2) * s
        y_norm = (t - 0.5) * 2 * half_h
        for j in range(ANGULAR):
            theta = (j / ANGULAR) * 2 * math.pi
            points.append([
                round(radius * math.cos(theta), 4),
                round(y_norm, 4),
                round(radius * math.sin(theta), 4),
                row['r'], row['g'], row['b']
            ])

    bottom_r = (rows[0]['right'] - rows[0]['left']) / 2 * s
    for j in range(100):
        theta = (j/100)*2*math.pi
        rr = math.sqrt(j/100)*bottom_r
        points.append([round(rr*math.cos(theta),4), -half_h, round(rr*math.sin(theta),4), rows[0]['r'],rows[0]['g'],rows[0]['b']])

    top_r = (rows[-1]['right'] - rows[-1]['left']) / 2 * s
    for j in range(100):
        theta = (j/100)*2*math.pi
        rr = math.sqrt(j/100)*top_r
        points.append([round(rr*math.cos(theta),4), half_h, round(rr*math.sin(theta),4), rows[-1]['r'],rows[-1]['g'],rows[-1]['b']])

    return points

all_data = {}
for kiln, rel in IMAGES.items():
    path = os.path.join(BASE, rel)
    print(f"Processing {kiln}...")
    pts = extract_vase(path)
    all_data[kiln] = pts
    print(f"  {len(pts)} points")

out = os.path.join(BASE, "js", "porcelain_data.js")
with open(out, "w", encoding="utf-8") as f:
    f.write("/* 瓷瓶3D点云v6 */\n")
    f.write("const PORCELAIN_DATA = ")
    json.dump(all_data, f, separators=(',', ':'))
    f.write(";\n")
print(f"\nSaved: {out} ({os.path.getsize(out)} bytes)")
