"""从.obj文件提取3D点云 + 贴图颜色（全五窑）"""
import json, os, math, random
from PIL import Image

random.seed(42)
BASE = r"C:\Users\LENOVO\Desktop\宋瓷五窑纪"

KILNS = {
    "ruyao": {
        "obj": r"G:\a答辩\2\汝窑\2c6b13e81ac215bc3bcc071196208a67.obj",
        "tex": r"G:\a答辩\2\汝窑\texture_pbr_20250901.png",
    },
    "guanyao": {
        "obj": r"G:\a答辩\2\官窑\54eb3a57cc46c14d2aa04b834d0db231.obj",
        "tex": r"G:\a答辩\2\官窑\texture_pbr_20250901.png",
    },
    "geyao": {
        "obj": r"G:\a答辩\2\哥窑\32bda8a0e473d48a3c873e7fcca64399.obj",
        "tex": r"G:\a答辩\2\哥窑\texture_pbr_20250901.png",
    },
    "junyao": {
        "obj": r"G:\a答辩\2\钧窑\851a919c872094948ff0e58833244551.obj",
        "tex": r"G:\a答辩\2\钧窑\texture_pbr_20250901.png",
    },
    "dingyao": {
        "obj": r"G:\a答辩\2\定窑\d16fc6f6d61e8d02978cd3fd1a78feeb.obj",
        "tex": r"G:\a答辩\2\定窑\texture_pbr_20250901.png",
    },
}

def parse_obj(obj_path):
    vertices = []
    texcoords = []
    faces = []
    with open(obj_path, 'r', encoding='utf-8', errors='ignore') as f:
        for line in f:
            if line.startswith('v '):
                parts = line.split()
                vertices.append((float(parts[1]), float(parts[2]), float(parts[3])))
            elif line.startswith('vt '):
                parts = line.split()
                texcoords.append((float(parts[1]), float(parts[2])))
            elif line.startswith('f '):
                parts = line.split()[1:]
                face = []
                for p in parts:
                    idx = p.split('/')
                    vi = int(idx[0]) - 1
                    ti = int(idx[1]) - 1 if len(idx) > 1 and idx[1] else -1
                    face.append((vi, ti))
                faces.append(face)
    return vertices, texcoords, faces

def build_pointcloud(vertices, texcoords, faces, tex_img, target_points=60000):
    tw, th = tex_img.size
    tex_px = tex_img.load()
    samples_per_face = max(1, target_points // len(faces) + 1)
    points = []
    for face in faces:
        if len(face) < 3: continue
        v0 = vertices[face[0][0]]; v1 = vertices[face[1][0]]; v2 = vertices[face[2][0]]
        t0 = texcoords[face[0][1]] if face[0][1] >= 0 else (0.5,0.5)
        t1 = texcoords[face[1][1]] if face[1][1] >= 0 else (0.5,0.5)
        t2 = texcoords[face[2][1]] if face[2][1] >= 0 else (0.5,0.5)
        for _ in range(samples_per_face):
            r1 = random.random(); r2 = random.random()
            if r1 + r2 > 1: r1 = 1-r1; r2 = 1-r2
            a, b, c = r1, r2, 1-r1-r2
            x = a*v0[0]+b*v1[0]+c*v2[0]
            y = a*v0[1]+b*v1[1]+c*v2[1]
            z = a*v0[2]+b*v1[2]+c*v2[2]
            u = a*t0[0]+b*t1[0]+c*t2[0]
            v = a*t0[1]+b*t1[1]+c*t2[1]
            px = int(u*tw) % tw; py = int((1-v)*th) % th
            r,g,b = tex_px[px,py][:3]
            if (r+g+b) < 100: r,g,b = 200,200,200
            points.append((x,y,z,r,g,b))
    if len(points) > target_points*2:
        step = len(points) // target_points
        points = points[::step]
    xs=[p[0] for p in points]; ys=[p[1] for p in points]; zs=[p[2] for p in points]
    cx=(min(xs)+max(xs))/2; cy=(min(ys)+max(ys))/2; cz=(min(zs)+max(zs))/2
    max_range = max(max(xs)-min(xs), max(ys)-min(ys), max(zs)-min(zs))
    scale = 1.7 / max_range
    result = []
    for p in points:
        nx=(p[0]-cx)*scale; ny=-(p[1]-cy)*scale; nz=(p[2]-cz)*scale
        result.append([round(nx,4),round(ny,4),round(nz,4),p[3],p[4],p[5]])
    return result

all_data = {}
for kiln, paths in KILNS.items():
    print(f"Parsing {kiln}...")
    vertices, texcoords, faces = parse_obj(paths['obj'])
    print(f"  v:{len(vertices)} f:{len(faces)} vt:{len(texcoords)}")
    tex_img = Image.open(paths['tex']).convert("RGB")
    pts = build_pointcloud(vertices, texcoords, faces, tex_img, target_points=80000)
    all_data[kiln] = pts
    print(f"  -> {len(pts)} points")

out = os.path.join(BASE, "js", "porcelain_data.js")
with open(out, "w", encoding="utf-8") as f:
    f.write("/* 瓷瓶3D点云v9 全obj */\n")
    f.write("const PORCELAIN_DATA = ")
    json.dump(all_data, f, separators=(',', ':'))
    f.write(";\n")
print(f"\nSaved: {out} ({os.path.getsize(out)} bytes)")
