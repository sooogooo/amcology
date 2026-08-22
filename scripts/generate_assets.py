import zlib
import struct
import math
import os

def create_png(width, height, draw_func, filename):
    # Initialize RGBA buffer
    pixels = bytearray([24, 24, 27, 255] * (width * height)) # Default #18181b dark background
    
    def set_pixel(x, y, r, g, b, a=255):
        if 0 <= x < width and 0 <= y < height:
            idx = (y * width + x) * 4
            if a == 255:
                pixels[idx] = r
                pixels[idx+1] = g
                pixels[idx+2] = b
                pixels[idx+3] = 255
            else:
                alpha = a / 255.0
                pixels[idx] = int(r * alpha + pixels[idx] * (1 - alpha))
                pixels[idx+1] = int(g * alpha + pixels[idx+1] * (1 - alpha))
                pixels[idx+2] = int(b * alpha + pixels[idx+2] * (1 - alpha))
                pixels[idx+3] = 255

    draw_func(width, height, set_pixel)

    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0) # Filter None
        start = y * width * 4
        raw_data.extend(pixels[start:start + width * 4])

    def chunk(tag, data):
        return struct.pack('>I', len(data)) + tag + data + struct.pack('>I', zlib.crc32(tag + data) & 0xffffffff)

    png = b'\x89PNG\r\n\x1a\n'
    png += chunk(b'IHDR', struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0))
    png += chunk(b'IDAT', zlib.compress(bytes(raw_data), 9))
    png += chunk(b'IEND', b'')

    with open(filename, 'wb') as f:
        f.write(png)
    print(f'Generated {filename} ({len(png)} bytes)')

def draw_line(x0, y0, x1, y1, width_stroke, r, g, b, set_pixel, img_w, img_h):
    dx = x1 - x0
    dy = y1 - y0
    length = math.hypot(dx, dy)
    if length == 0:
        return
    nx = -dy / length
    ny = dx / length
    
    # Bounding box
    min_x = max(0, int(min(x0, x1) - width_stroke - 2))
    max_x = min(img_w, int(max(x0, x1) + width_stroke + 2))
    min_y = max(0, int(min(y0, y1) - width_stroke - 2))
    max_y = min(img_h, int(max(y0, y1) + width_stroke + 2))
    
    half_w = width_stroke / 2.0
    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            # Distance from point (x,y) to line segment (x0,y0)-(x1,y1)
            px = x - x0
            py = y - y0
            proj = (px * dx + py * dy) / (length * length)
            if proj < 0:
                dist = math.hypot(x - x0, y - y0)
            elif proj > 1:
                dist = math.hypot(x - x1, y - y1)
            else:
                dist = abs(px * nx + py * ny)
            
            if dist <= half_w + 1.0:
                alpha = max(0, min(255, int((1.0 - max(0.0, dist - half_w)) * 255)))
                set_pixel(x, y, r, g, b, alpha)

def draw_circle(cx, cy, radius, width_stroke, r, g, b, set_pixel, img_w, img_h):
    min_x = max(0, int(cx - radius - width_stroke - 2))
    max_x = min(img_w, int(cx + radius + width_stroke + 2))
    min_y = max(0, int(cy - radius - width_stroke - 2))
    max_y = min(img_h, int(cy + radius + width_stroke + 2))
    half_w = width_stroke / 2.0

    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            d = math.hypot(x - cx, y - cy)
            dist = abs(d - radius)
            if dist <= half_w + 1.0:
                alpha = max(0, min(255, int((1.0 - max(0.0, dist - half_w)) * 255)))
                set_pixel(x, y, r, g, b, alpha)

def draw_filled_circle(cx, cy, radius, r, g, b, set_pixel, img_w, img_h):
    min_x = max(0, int(cx - radius - 2))
    max_x = min(img_w, int(cx + radius + 2))
    min_y = max(0, int(cy - radius - 2))
    max_y = min(img_h, int(cy + radius + 2))

    for y in range(min_y, max_y):
        for x in range(min_x, max_x):
            d = math.hypot(x - cx, y - cy)
            if d <= radius + 1.0:
                alpha = max(0, min(255, int((1.0 - max(0.0, d - radius)) * 255)))
                set_pixel(x, y, r, g, b, alpha)

def draw_share_icon(w, h, set_pixel):
    # Dark zinc-900 background #18181b
    cx, cy = w / 2, h / 2
    
    # Outer thin border
    draw_circle(cx, cy, w * 0.44, 2.0, 63, 63, 70, set_pixel, w, h) # zinc-700
    
    # Inner gold border
    draw_circle(cx, cy, w * 0.38, 2.5, 217, 119, 6, set_pixel, w, h) # amber-600
    
    # Diamond / Square rotated
    s = w * 0.22
    draw_line(cx, cy - s, cx + s, cy, 1.8, 161, 161, 170, set_pixel, w, h) # zinc-400
    draw_line(cx + s, cy, cx, cy + s, 1.8, 161, 161, 170, set_pixel, w, h)
    draw_line(cx, cy + s, cx - s, cy, 1.8, 161, 161, 170, set_pixel, w, h)
    draw_line(cx - s, cy, cx, cy - s, 1.8, 161, 161, 170, set_pixel, w, h)

    # Greek Lambda / Delta A-frame (Aesthetics & Adam Smith)
    draw_line(cx - w * 0.16, cy + w * 0.16, cx, cy - w * 0.22, 2.5, 250, 250, 249, set_pixel, w, h)
    draw_line(cx, cy - w * 0.22, cx + w * 0.16, cy + w * 0.16, 2.5, 250, 250, 249, set_pixel, w, h)
    draw_line(cx - w * 0.09, cy + w * 0.04, cx + w * 0.09, cy + w * 0.04, 2.0, 217, 119, 6, set_pixel, w, h)

    # Center glowing gold core
    draw_filled_circle(cx, cy - w * 0.03, w * 0.035, 245, 158, 11, set_pixel, w, h) # amber-500

def draw_light_logo(w, h, set_pixel):
    # #fafaf9 light linen background
    for y in range(h):
        for x in range(w):
            set_pixel(x, y, 250, 250, 249, 255)
    
    cx, cy = w / 2, h / 2
    # Outer ring
    draw_circle(cx, cy, w * 0.42, 2.0, 24, 24, 27, set_pixel, w, h)
    # Inner gold ring
    draw_circle(cx, cy, w * 0.38, 1.5, 180, 83, 9, set_pixel, w, h)
    # Architectural triangle
    draw_line(cx - w * 0.2, cy + w * 0.2, cx, cy - w * 0.22, 2.5, 24, 24, 27, set_pixel, w, h)
    draw_line(cx, cy - w * 0.22, cx + w * 0.2, cy + w * 0.2, 2.5, 24, 24, 27, set_pixel, w, h)
    draw_line(cx - w * 0.1, cy + w * 0.06, cx + w * 0.1, cy + w * 0.06, 2.0, 180, 83, 9, set_pixel, w, h)
    # Center dot
    draw_filled_circle(cx, cy, w * 0.03, 180, 83, 9, set_pixel, w, h)

os.makedirs('public', exist_ok=True)
create_png(512, 512, draw_share_icon, 'public/share-icon.png')
create_png(512, 512, draw_share_icon, 'public/wechat-thumb.png')
create_png(512, 512, draw_light_logo, 'public/logo.png')
create_png(256, 256, draw_share_icon, 'public/favicon.png')
create_png(800, 800, draw_share_icon, 'public/share-cover.png')
