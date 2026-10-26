import os
import sys
import shutil
import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import qrcode

# Paths
BRAIN_DIR = r"C:\Users\royok\.gemini\antigravity\brain\5a54f75e-7e2c-429c-abdc-25229a56d1e0"
WORKSPACE_DIR = r"c:\Users\royok\OneDrive\Documents\Coding\greenwave-society"
PUBLIC_POSTERS = os.path.join(WORKSPACE_DIR, "public", "posters")
PUBLIC_DOWNLOADS = os.path.join(WORKSPACE_DIR, "public", "downloads")
WIN_FONTS = os.environ.get("WINDIR", r"C:\Windows") + r"\Fonts"

# Fonts
FONT_GEORGIA_BOLD = os.path.join(WIN_FONTS, "georgiab.ttf")
FONT_GEORGIA = os.path.join(WIN_FONTS, "georgia.ttf")
FONT_SEGOE_BOLD = os.path.join(WIN_FONTS, "segoeuib.ttf")
FONT_SEGOE_REG = os.path.join(WIN_FONTS, "segoeui.ttf")
FONT_SEGOE_SEMIBOLD = os.path.join(WIN_FONTS, "seguisb.ttf") if os.path.exists(os.path.join(WIN_FONTS, "seguisb.ttf")) else FONT_SEGOE_BOLD

# Colors
DARK_GREEN_BG = (0, 30, 20, 255)
GOLD_TEXT = (245, 195, 75)
GOLD_BORDER = (212, 175, 55)
GOLD_ACCENT = (245, 215, 120)
MINT_SUB = (160, 235, 200)
MINT_MUTED = (160, 210, 190)
WHITE = (255, 255, 255)

def get_font(path, size):
    try:
        return ImageFont.truetype(path, size)
    except:
        return ImageFont.load_default()

def create_gradient_mask(width, height, stops):
    mask = Image.new("L", (width, height), 0)
    draw = ImageDraw.Draw(mask)
    stops = sorted(stops, key=lambda x: x[0])
    for y in range(height):
        r = y / float(height - 1)
        if r <= stops[0][0]:
            val = stops[0][1]
        elif r >= stops[-1][0]:
            val = stops[-1][1]
        else:
            for i in range(len(stops) - 1):
                if stops[i][0] <= r <= stops[i+1][0]:
                    seg_r = (r - stops[i][0]) / (stops[i+1][0] - stops[i][0])
                    val = int(stops[i][1] + seg_r * (stops[i+1][1] - stops[i][1]))
                    break
        draw.line([(0, y), (width, y)], fill=val)
    return mask

def create_smooth_ring(size, outer_w=4, inner_w=2):
    scale = 4
    big_size = size * scale
    ring = Image.new("RGBA", (big_size, big_size), (0, 0, 0, 0))
    d = ImageDraw.Draw(ring)
    d.ellipse([scale, scale, big_size - scale, big_size - scale], outline=(212, 175, 55, 245), width=outer_w * scale)
    if inner_w > 0:
        d.ellipse([scale * 3, scale * 3, big_size - scale * 3, big_size - scale * 3], outline=(245, 220, 120, 180), width=inner_w * scale)
    return ring.resize((size, size), Image.Resampling.LANCZOS)

def create_qr(data, size=280, border=1, fill_color=(0, 45, 30), back_color=(255, 255, 255)):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_M,
        box_size=10,
        border=border,
    )
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color=fill_color, back_color=back_color).convert("RGBA")
    return img.resize((size, size), Image.Resampling.LANCZOS)

def prepare_cleaned_stage_base():
    """
    Produces the master photographic stage backdrop with:
    1. Complete, razor-sharp removal of duplicate 'EMPOWER 360 COHORT I' lettering behind fellows.
    2. Zero smearing, preserving 100% authentic photographic hair, face, ears, and clothing.
    3. Seamless blending of the official Greenwave circular emblem into the stage lighting fixture.
    """
    W, H = 1446, 2048
    base_path = os.path.join(BRAIN_DIR, "empower360_graduation_poster_1792948476703.jpg")
    base_cv = cv2.imread(base_path)
    bh, bw = base_cv.shape[:2]
    scale = max(W / float(bw), (H * 0.75) / float(bh))
    new_w = int(bw * scale)
    new_h = int(bh * scale)
    scaled_base = cv2.resize(base_cv, (new_w, new_h), interpolation=cv2.INTER_LANCZOS4)
    crop_x = (new_w - W) // 2
    bg_sub = scaled_base[:int(H * 0.72), crop_x:crop_x + W].copy()

    # 1. Flawless inpainting to eliminate duplicate EMPOWER 360 COHORT I stage lettering
    gray = cv2.cvtColor(bg_sub, cv2.COLOR_BGR2GRAY)
    mask = np.zeros(bg_sub.shape[:2], dtype=np.uint8)

    # Box 1: EMPOWER 360 (y: 785 to 852, x: 505 to 945)
    mask[785:852, 505:945] = (gray[785:852, 505:945] > 68).astype(np.uint8) * 255
    # Box 2: Left CO (y: 852 to 930, x: 565 to 670)
    mask[852:930, 565:670] = (gray[852:930, 565:670] > 68).astype(np.uint8) * 255
    # Box 3: Right ORT I (y: 852 to 898, x: 736 to 900)
    mask[852:898, 736:900] = (gray[852:898, 736:900] > 68).astype(np.uint8) * 255
    # Strictly protect center fellow head & hair:
    mask[852:, 670:736] = 0

    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (7, 7))
    mask_dil = cv2.dilate(mask, kernel)
    mask_dil[852:, 670:736] = 0

    clean_stage = cv2.inpaint(bg_sub, mask_dil, 4, cv2.INPAINT_TELEA)

    # 2. Blend Official Greenwave Emblem seamlessly into authentic stage disc fixture
    cx, cy, r = 739, 632, 62
    size = r * 2 + 16 # 140
    x1, y1 = cx - size // 2, cy - size // 2
    x2, y2 = x1 + size, y1 + size

    emblem_path = os.path.join(BRAIN_DIR, "official_circle_emblem.png")
    emblem = cv2.imread(emblem_path, cv2.IMREAD_UNCHANGED)
    alpha = emblem[:, :, 3]
    bgr = emblem[:, :, :3]
    gray_emb = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)

    is_graphic = (alpha > 128) & (gray_emb < 165)
    is_ocean = (alpha > 128) & (gray_emb >= 165)

    emb_size = 100
    graphic_res = cv2.resize(is_graphic.astype(np.uint8) * 255, (emb_size, emb_size), interpolation=cv2.INTER_AREA)
    ocean_res = cv2.resize(is_ocean.astype(np.uint8) * 255, (emb_size, emb_size), interpolation=cv2.INTER_AREA)

    patch = np.zeros((size, size, 3), dtype=np.float32)
    patch[:] = [22, 46, 26] # BGR dark acrylic matching GREENWAVE SOCIETY pill

    pcx, pcy = size // 2, size // 2
    off = (size - emb_size) // 2

    g_mask = np.zeros((size, size), dtype=np.float32)
    g_mask[off:off + emb_size, off:off + emb_size] = graphic_res.astype(np.float32) / 255.0

    o_mask = np.zeros((size, size), dtype=np.float32)
    o_mask[off:off + emb_size, off:off + emb_size] = ocean_res.astype(np.float32) / 255.0

    # Emerald ocean
    patch = patch * (1.0 - o_mask[:, :, None] * 0.65) + np.array([28, 72, 36], dtype=np.float32) * (o_mask[:, :, None] * 0.65)

    # Ambient glow behind graphic
    g_pil = Image.fromarray((g_mask * 255).astype(np.uint8))
    glow_pil = g_pil.filter(ImageFilter.GaussianBlur(3))
    glow_mask = np.array(glow_pil).astype(np.float32) / 255.0
    patch = patch * (1.0 - glow_mask[:, :, None] * 0.45) + np.array([145, 235, 165], dtype=np.float32) * (glow_mask[:, :, None] * 0.45)

    # Luminous mint neon graphic matching GREENWAVE SOCIETY lettering
    neon_color = np.array([180, 248, 185], dtype=np.float32)
    patch = patch * (1.0 - g_mask[:, :, None] * 0.92) + neon_color * (g_mask[:, :, None] * 0.92)

    # PIL smooth rim rendering
    patch_pil = Image.fromarray(np.clip(patch, 0, 255).astype(np.uint8)).convert("RGBA")
    scale_pil = 4
    big_s = size * scale_pil
    ring_img = Image.new("RGBA", (big_s, big_s), (0, 0, 0, 0))
    d_ring = ImageDraw.Draw(ring_img)
    d_ring.ellipse([(pcx - r) * scale_pil, (pcy - r) * scale_pil, (pcx + r) * scale_pil, (pcy + r) * scale_pil], outline=(175, 245, 185, 240), width=2 * scale_pil)
    d_ring.ellipse([(pcx - r + 2) * scale_pil, (pcy - r + 2) * scale_pil, (pcx + r - 2) * scale_pil, (pcy + r - 2) * scale_pil], outline=(140, 220, 160, 180), width=1 * scale_pil)
    ring_res = ring_img.resize((size, size), Image.Resampling.LANCZOS)

    halo_img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d_h = ImageDraw.Draw(halo_img)
    d_h.ellipse([pcx - r - 4, pcy - r - 4, pcx + r + 4, pcy + r + 4], fill=(212, 175, 55, 60))
    d_h.ellipse([pcx - r, pcy - r, pcx + r, pcy + r], fill=(80, 200, 140, 80))
    halo_blur = halo_img.filter(ImageFilter.GaussianBlur(6))

    mask_circle = Image.new("L", (size, size), 0)
    ImageDraw.Draw(mask_circle).ellipse([pcx - r, pcy - r, pcx + r, pcy + r], fill=255)

    comp = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    comp.paste(patch_pil, (0, 0), mask_circle)
    comp = Image.alpha_composite(comp, ring_res)

    disc_alpha = cv2.GaussianBlur(np.array(mask_circle), (5, 5), 0).astype(np.float32) / 255.0

    patch_comp_cv = cv2.cvtColor(np.array(comp), cv2.COLOR_RGBA2BGR).astype(np.float32)
    np.random.seed(42)
    grain = np.random.normal(0, 1.8, patch_comp_cv.shape).astype(np.float32)
    patch_comp_cv = np.clip(patch_comp_cv + grain, 0, 255)

    halo_cv = cv2.cvtColor(np.array(halo_blur), cv2.COLOR_RGBA2BGRA)
    halo_a = halo_cv[:, :, 3].astype(np.float32) / 255.0

    stage_bg = clean_stage[y1:y2, x1:x2].astype(np.float32)
    stage_bg = halo_cv[:, :, :3] * halo_a[:, :, None] + stage_bg * (1.0 - halo_a[:, :, None])

    final_patch = patch_comp_cv * disc_alpha[:, :, None] + stage_bg * (1.0 - disc_alpha[:, :, None])
    clean_stage[y1:y2, x1:x2] = np.clip(final_patch, 0, 255).astype(np.uint8)

    clean_stage_rgba = cv2.cvtColor(clean_stage, cv2.COLOR_BGR2RGBA)
    return Image.fromarray(clean_stage_rgba)

def render_v2_stage_2x(cleaned_stage):
    W, H = 1446, 2048
    canvas = Image.new("RGBA", (W, H), DARK_GREEN_BG)
    
    # 1. Base Image with clean backdrop and unified stage emblem
    canvas.paste(cleaned_stage, (0, 0))
    
    # 2. Vignette Overlays
    top_overlay = Image.new("RGBA", (W, 460), (0, 25, 17, 255))
    top_mask = create_gradient_mask(W, 460, [(0.0, 248), (0.65, 205), (1.0, 0)])
    canvas.paste(top_overlay, (0, 0), top_mask)
    
    mid_overlay = Image.new("RGBA", (W, 380), (0, 28, 19, 255))
    mid_mask = create_gradient_mask(W, 380, [(0.0, 0), (0.4, 160), (1.0, 255)])
    canvas.paste(mid_overlay, (0, 1100), mid_mask)
    
    bottom_fill = Image.new("RGBA", (W, H - 1480), (0, 28, 19, 255))
    canvas.paste(bottom_fill, (0, 1480))
    
    draw = ImageDraw.Draw(canvas)
    
    # 3. Top Masthead Lockup (Region 1 Luxury Crest)
    cx = W // 2
    cy_top = 68
    top_emblem_size = 78
    emblem_path = os.path.join(BRAIN_DIR, "official_circle_emblem.png")
    emblem = Image.open(emblem_path).convert("RGBA")
    emblem_top = emblem.resize((top_emblem_size, top_emblem_size), Image.Resampling.LANCZOS)
    ring_top = create_smooth_ring(top_emblem_size, outer_w=2, inner_w=0)
    emblem_top = Image.alpha_composite(emblem_top, ring_top)
    canvas.paste(emblem_top, (cx - top_emblem_size // 2, cy_top - top_emblem_size // 2), emblem_top)
    
    # Elegant flanking hairlines with diamond accents
    line_left_x = cx - 380
    line_right_x = cx + 380
    draw.line([(line_left_x, cy_top), (cx - 62, cy_top)], fill=(212, 175, 55, 180), width=1)
    draw.line([(cx + 62, cy_top), (line_right_x, cy_top)], fill=(212, 175, 55, 180), width=1)
    
    # Diamond terminal accents
    draw.polygon([(cx - 62, cy_top), (cx - 68, cy_top - 4), (cx - 74, cy_top), (cx - 68, cy_top + 4)], fill=GOLD_BORDER)
    draw.polygon([(cx + 62, cy_top), (cx + 68, cy_top - 4), (cx + 74, cy_top), (cx + 68, cy_top + 4)], fill=GOLD_BORDER)
    
    # Brand Text below emblem
    f_mast = get_font(FONT_SEGOE_BOLD, 22)
    mast_txt = "GREENWAVE SOCIETY   •   EMPOWER 360 LEADERSHIP PROGRAMME"
    tb_m = draw.textbbox((0, 0), mast_txt, font=f_mast)
    draw.text(((W - (tb_m[2] - tb_m[0])) // 2, 118), mast_txt, font=f_mast, fill=GOLD_ACCENT)
    
    # 4. Event Titles
    f_head1 = get_font(FONT_GEORGIA_BOLD, 68)
    h1_text = "COHORT I"
    tb1 = draw.textbbox((0, 0), h1_text, font=f_head1)
    draw.text(((W - (tb1[2] - tb1[0])) // 2, 160), h1_text, font=f_head1, fill=GOLD_TEXT)
    
    f_head2 = get_font(FONT_GEORGIA_BOLD, 74)
    h2_text = "GRADUATION CEREMONY"
    tb2 = draw.textbbox((0, 0), h2_text, font=f_head2)
    draw.text(((W - (tb2[2] - tb2[0])) // 2, 240), h2_text, font=f_head2, fill=WHITE)
    
    f_sub = get_font(FONT_SEGOE_SEMIBOLD, 32)
    sub_text = "Celebrating Kenya's Pioneer Changemakers & Green Leaders"
    tb_sub = draw.textbbox((0, 0), sub_text, font=f_sub)
    draw.text(((W - (tb_sub[2] - tb_sub[0])) // 2, 335), sub_text, font=f_sub, fill=MINT_SUB)
    
    # Gold divider with diamond
    gw = 240
    gx = (W - gw) // 2
    draw.line([(gx, 395), (gx + gw, 395)], fill=(212, 175, 55, 200), width=2)
    draw.polygon([(W // 2 - 6, 390), (W // 2 + 6, 390), (W // 2, 400)], fill=GOLD_TEXT)
    
    # 5. Center Milestone Badge
    comm_f = get_font(FONT_SEGOE_BOLD, 24)
    comm_text = "INAUGURAL FELLOWSHIP COMMENCEMENT"
    tb_c = draw.textbbox((0, 0), comm_text, font=comm_f)
    cw = tb_c[2] - tb_c[0]
    cx_c = (W - cw) // 2
    cy_c = 1260
    draw.rounded_rectangle([cx_c - 28, cy_c - 10, cx_c + cw + 28, cy_c + (tb_c[3] - tb_c[1]) + 12], radius=22, fill=(0, 48, 32, 210), outline=(212, 175, 55, 180), width=2)
    draw.text((cx_c, cy_c), comm_text, font=comm_f, fill=GOLD_ACCENT)
    
    # 6. Bottom Card
    card_x1, card_y1 = 70, 1340
    card_x2, card_y2 = W - 70, 1940
    draw.rounded_rectangle([card_x1, card_y1, card_x2, card_y2], radius=32, fill=(0, 42, 28, 248), outline=(212, 175, 55, 230), width=3)
    draw.rounded_rectangle([card_x1 + 8, card_y1 + 8, card_x2 - 8, card_y2 - 8], radius=24, fill=None, outline=(212, 175, 55, 70), width=1)
    
    label_f = get_font(FONT_SEGOE_BOLD, 23)
    val_f = get_font(FONT_GEORGIA_BOLD, 33)
    sub_f = get_font(FONT_SEGOE_REG, 23)
    
    start_y = 1380
    row_gap = 125
    left_x = 115
    
    # Row 1: DATE
    draw.text((left_x, start_y), "EVENT DATE", font=label_f, fill=GOLD_BORDER)
    draw.text((left_x, start_y + 30), "Friday, 30th October 2026", font=val_f, fill=WHITE)
    draw.text((left_x, start_y + 72), "Cohort I Milestone Gathering", font=sub_f, fill=MINT_MUTED)
    
    # Row 2: TIME
    draw.text((left_x, start_y + row_gap), "PROGRAM TIME", font=label_f, fill=GOLD_BORDER)
    draw.text((left_x, start_y + row_gap + 30), "10:30 AM to 3:00 PM EAT", font=val_f, fill=WHITE)
    draw.text((left_x, start_y + row_gap + 72), "Doors open promptly at 10:00 AM for check-in", font=sub_f, fill=MINT_MUTED)
    
    # Row 3: VENUE & ACCESS
    draw.text((left_x, start_y + row_gap * 2), "VENUE & ACCESS", font=label_f, fill=GOLD_BORDER)
    draw.text((left_x, start_y + row_gap * 2 + 30), "Ubunifu Hub, Nairobi", font=val_f, fill=WHITE)
    draw.text((left_x, start_y + row_gap * 2 + 72), "Free Admission  •  All Guests & +1s Welcome", font=sub_f, fill=MINT_SUB)
    
    # Row 4: Feature Badges
    badge_y = start_y + row_gap * 3 + 12
    mini_f = get_font(FONT_SEGOE_BOLD, 20)
    draw.rounded_rectangle([left_x, badge_y, left_x + 365, badge_y + 44], radius=16, fill=(0, 62, 42), outline=(212, 175, 55, 140), width=1)
    draw.text((left_x + 20, badge_y + 10), "Eco-Refreshments Included", font=mini_f, fill=GOLD_ACCENT)
    
    draw.rounded_rectangle([left_x + 385, badge_y, left_x + 750, badge_y + 44], radius=16, fill=(0, 62, 42), outline=(212, 175, 55, 140), width=1)
    draw.text((left_x + 405, badge_y + 10), "Community Market Co-Located", font=mini_f, fill=GOLD_ACCENT)
    
    # Right Column: QR Code Box
    qr_box_w = 420
    qr_box_x = W - 70 - qr_box_w - 40
    qr_box_y = 1375
    qr_box_h = 525
    draw.rounded_rectangle([qr_box_x, qr_box_y, qr_box_x + qr_box_w, qr_box_y + qr_box_h], radius=24, fill=WHITE, outline=GOLD_BORDER, width=3)
    
    qr_head_f = get_font(FONT_SEGOE_BOLD, 25)
    qhb = draw.textbbox((0, 0), "RSVP & GUEST PASS", font=qr_head_f)
    draw.text((qr_box_x + (qr_box_w - (qhb[2] - qhb[0])) // 2, qr_box_y + 22), "RSVP & GUEST PASS", font=qr_head_f, fill=(0, 45, 30))
    
    qr_img = create_qr("https://greenwavesociety.org/events/graduation-cohort-1", size=280)
    qr_px = qr_box_x + (qr_box_w - 280) // 2
    qr_py = qr_box_y + 68
    canvas.paste(qr_img, (qr_px, qr_py))
    
    scan_f = get_font(FONT_SEGOE_BOLD, 22)
    stb = draw.textbbox((0, 0), "SCAN TO REGISTER", font=scan_f)
    draw.text((qr_box_x + (qr_box_w - (stb[2] - stb[0])) // 2, qr_py + 290), "SCAN TO REGISTER", font=scan_f, fill=(2, 92, 62))
    
    url_f = get_font(FONT_SEGOE_REG, 17)
    short_url = "greenwavesociety.org/events"
    utb = draw.textbbox((0, 0), short_url, font=url_f)
    draw.text((qr_box_x + (qr_box_w - (utb[2] - utb[0])) // 2, qr_py + 322), short_url, font=url_f, fill=(100, 116, 110))
    
    url2_f = get_font(FONT_SEGOE_SEMIBOLD, 17)
    badge_note = "Free • Instant Pass Confirmation"
    u2tb = draw.textbbox((0, 0), badge_note, font=url2_f)
    draw.text((qr_box_x + (qr_box_w - (u2tb[2] - u2tb[0])) // 2, qr_py + 348), badge_note, font=url2_f, fill=(195, 142, 32))
    
    # 7. Footer
    foot_f = get_font(FONT_SEGOE_SEMIBOLD, 22)
    foot_text = "www.greenwavesociety.org   •   #Empower360   •   Rooted in Community, Leading Kenya's Green Future"
    ftb = draw.textbbox((0, 0), foot_text, font=foot_f)
    draw.text(((W - (ftb[2] - ftb[0])) // 2, 1985), foot_text, font=foot_f, fill=(160, 205, 185))
    
    return canvas

def render_v2_story(cleaned_stage_1446):
    W, H = 1080, 1920
    canvas = Image.new("RGBA", (W, H), DARK_GREEN_BG)
    
    # Resize cleaned stage backdrop proportionally to width 1080
    new_h = int(cleaned_stage_1446.height * 1080 / 1446)
    bg_story = cleaned_stage_1446.resize((1080, new_h), Image.Resampling.LANCZOS)
    canvas.paste(bg_story, (0, 0))
    
    # Overlays
    top_overlay = Image.new("RGBA", (W, 440), (0, 25, 17, 255))
    top_mask = create_gradient_mask(W, 440, [(0.0, 250), (0.7, 210), (1.0, 0)])
    canvas.paste(top_overlay, (0, 0), top_mask)
    
    mid_overlay = Image.new("RGBA", (W, 360), (0, 28, 19, 255))
    mid_mask = create_gradient_mask(W, 360, [(0.0, 0), (0.4, 160), (1.0, 255)])
    canvas.paste(mid_overlay, (0, 1000), mid_mask)
    
    bottom_fill = Image.new("RGBA", (W, H - 1360), (0, 28, 19, 255))
    canvas.paste(bottom_fill, (0, 1360))
    
    draw = ImageDraw.Draw(canvas)
    
    # Top Masthead Lockup
    cx = W // 2
    cy_top = 60
    top_emblem_size = 62
    emblem_path = os.path.join(BRAIN_DIR, "official_circle_emblem.png")
    emblem = Image.open(emblem_path).convert("RGBA")
    emblem_top = emblem.resize((top_emblem_size, top_emblem_size), Image.Resampling.LANCZOS)
    ring_top = create_smooth_ring(top_emblem_size, outer_w=2, inner_w=0)
    emblem_top = Image.alpha_composite(emblem_top, ring_top)
    canvas.paste(emblem_top, (cx - top_emblem_size // 2, cy_top - top_emblem_size // 2), emblem_top)
    
    draw.line([(cx - 280, cy_top), (cx - 50, cy_top)], fill=(212, 175, 55, 180), width=1)
    draw.line([(cx + 50, cy_top), (cx + 280, cy_top)], fill=(212, 175, 55, 180), width=1)
    draw.polygon([(cx - 50, cy_top), (cx - 55, cy_top - 3), (cx - 60, cy_top), (cx - 55, cy_top + 3)], fill=GOLD_BORDER)
    draw.polygon([(cx + 50, cy_top), (cx + 55, cy_top - 3), (cx + 60, cy_top), (cx + 55, cy_top + 3)], fill=GOLD_BORDER)
    
    f_mast = get_font(FONT_SEGOE_BOLD, 18)
    mast_txt = "GREENWAVE SOCIETY   •   EMPOWER 360"
    tb_m = draw.textbbox((0, 0), mast_txt, font=f_mast)
    draw.text(((W - (tb_m[2] - tb_m[0])) // 2, 102), mast_txt, font=f_mast, fill=GOLD_ACCENT)
    
    # Titles
    font_head1 = get_font(FONT_GEORGIA_BOLD, 52)
    h1 = "COHORT I"
    tb1 = draw.textbbox((0, 0), h1, font=font_head1)
    draw.text(((W - (tb1[2] - tb1[0])) // 2, 138), h1, font=font_head1, fill=GOLD_TEXT)
    
    font_head2 = get_font(FONT_GEORGIA_BOLD, 56)
    h2 = "GRADUATION CEREMONY"
    tb2 = draw.textbbox((0, 0), h2, font=font_head2)
    draw.text(((W - (tb2[2] - tb2[0])) // 2, 202), h2, font=font_head2, fill=WHITE)
    
    font_sub = get_font(FONT_SEGOE_SEMIBOLD, 24)
    sub = "Celebrating Kenya's Pioneer Changemakers & Green Leaders"
    tbs = draw.textbbox((0, 0), sub, font=font_sub)
    draw.text(((W - (tbs[2] - tbs[0])) // 2, 276), sub, font=font_sub, fill=MINT_SUB)
    
    # Accent Line
    gw = 180
    gx = (W - gw) // 2
    draw.line([(gx, 320), (gx + gw, 320)], fill=(212, 175, 55, 200), width=2)
    draw.polygon([(W // 2 - 5, 316), (W // 2 + 5, 316), (W // 2, 324)], fill=GOLD_TEXT)
    
    # Milestone pill
    badge_f = get_font(FONT_SEGOE_BOLD, 18)
    b_text = "INAUGURAL FELLOWSHIP COMMENCEMENT"
    btb = draw.textbbox((0, 0), b_text, font=badge_f)
    bx = (W - (btb[2] - btb[0])) // 2
    draw.rounded_rectangle([bx - 20, 1150, bx + (btb[2] - btb[0]) + 20, 1188], radius=16, fill=(0, 48, 32, 210), outline=(212, 175, 55, 180), width=1)
    draw.text((bx, 1158), b_text, font=badge_f, fill=GOLD_ACCENT)
    
    # Bottom Card (1080 Story)
    card_x1, card_y1 = 50, 1220
    card_x2, card_y2 = W - 50, 1820
    draw.rounded_rectangle([card_x1, card_y1, card_x2, card_y2], radius=28, fill=(0, 42, 28, 248), outline=(212, 175, 55, 230), width=3)
    draw.rounded_rectangle([card_x1 + 6, card_y1 + 6, card_x2 - 6, card_y2 - 6], radius=22, fill=None, outline=(212, 175, 55, 70), width=1)
    
    l_f = get_font(FONT_SEGOE_BOLD, 19)
    v_f = get_font(FONT_GEORGIA_BOLD, 26)
    s_f = get_font(FONT_SEGOE_REG, 19)
    
    start_y = 1250
    row_gap = 100
    lx = 85
    
    draw.text((lx, start_y), "EVENT DATE", font=l_f, fill=GOLD_BORDER)
    draw.text((lx, start_y + 24), "Friday, 30th October 2026", font=v_f, fill=WHITE)
    draw.text((lx, start_y + 58), "Cohort I Milestone Gathering", font=s_f, fill=MINT_MUTED)
    
    draw.text((lx, start_y + row_gap), "PROGRAM TIME", font=l_f, fill=GOLD_BORDER)
    draw.text((lx, start_y + row_gap + 24), "10:30 AM to 3:00 PM EAT", font=v_f, fill=WHITE)
    draw.text((lx, start_y + row_gap + 58), "Doors open at 10:00 AM", font=s_f, fill=MINT_MUTED)
    
    draw.text((lx, start_y + row_gap * 2), "VENUE & ACCESS", font=l_f, fill=GOLD_BORDER)
    draw.text((lx, start_y + row_gap * 2 + 24), "Ubunifu Hub, Nairobi", font=v_f, fill=WHITE)
    draw.text((lx, start_y + row_gap * 2 + 58), "Free Admission • +1s Welcome", font=s_f, fill=MINT_SUB)
    
    # Badges
    by = start_y + row_gap * 3 + 6
    mf = get_font(FONT_SEGOE_BOLD, 16)
    draw.rounded_rectangle([lx, by, lx + 270, by + 36], radius=14, fill=(0, 62, 42), outline=(212, 175, 55, 140), width=1)
    draw.text((lx + 15, by + 8), "Eco-Refreshments Included", font=mf, fill=GOLD_ACCENT)
    
    draw.rounded_rectangle([lx + 285, by, lx + 535, by + 36], radius=14, fill=(0, 62, 42), outline=(212, 175, 55, 140), width=1)
    draw.text((lx + 300, by + 8), "Market Co-Located", font=mf, fill=GOLD_ACCENT)
    
    # QR box
    qw = 340
    qx = W - 50 - qw - 30
    qy = 1250
    qh = 530
    draw.rounded_rectangle([qx, qy, qx + qw, qy + qh], radius=20, fill=WHITE, outline=GOLD_BORDER, width=2)
    
    qhf = get_font(FONT_SEGOE_BOLD, 21)
    draw.text((qx + 35, qy + 18), "RSVP & GUEST PASS", font=qhf, fill=(0, 45, 30))
    
    qr_img = create_qr("https://greenwavesociety.org/events/graduation-cohort-1", size=240)
    canvas.paste(qr_img, (qx + 50, qy + 55))
    
    scf = get_font(FONT_SEGOE_BOLD, 19)
    draw.text((qx + 52, qy + 310), "SCAN TO REGISTER", font=scf, fill=(2, 92, 62))
    
    uf = get_font(FONT_SEGOE_REG, 15)
    draw.text((qx + 46, qy + 338), "greenwavesociety.org/events", font=uf, fill=(100, 116, 110))
    
    u2f = get_font(FONT_SEGOE_SEMIBOLD, 14)
    draw.text((qx + 42, qy + 362), "Free • Instant Pass Confirmation", font=u2f, fill=(195, 142, 32))
    
    # Story Footer
    foot_f = get_font(FONT_SEGOE_SEMIBOLD, 19)
    foot_txt = "greenwavesociety.org  •  #Empower360  •  Leading Kenya's Green Future"
    ftb = draw.textbbox((0, 0), foot_txt, font=foot_f)
    draw.text(((W - (ftb[2] - ftb[0])) // 2, 1855), foot_txt, font=foot_f, fill=(160, 205, 185))
    
    return canvas

def clean_v1_emblem():
    base_v1_path = os.path.join(BRAIN_DIR, "v1_empower360-cohort-1-graduation-flyer.png")
    if not os.path.exists(base_v1_path):
        return
    im = Image.open(base_v1_path).convert("RGBA")
    v1_723 = im.copy()
    v1_2x = v1_723.resize((1446, 2048), Image.Resampling.LANCZOS)
    
    for p in [PUBLIC_POSTERS, PUBLIC_DOWNLOADS]:
        v1_723.save(os.path.join(p, "v1-empower360-graduation-flyer.png"), optimize=True)
        v1_2x.save(os.path.join(p, "v1-empower360-graduation-flyer-2x.png"), optimize=True)
        v1_723.save(os.path.join(p, "empower360-cohort-1-graduation-flyer.png"), optimize=True)
        v1_2x.save(os.path.join(p, "empower360-cohort-1-graduation-flyer-2x.png"), optimize=True)
    print("Version 1 pristine assets saved!")

def main():
    print("Step 1: Generating master clean stage backdrop...")
    cleaned_stage_1446 = prepare_cleaned_stage_base()
    print("Master stage backdrop generated successfully!")
    
    print("Step 2: Rendering Version 2 2X Flyer (1446x2048)...")
    v2_2x = render_v2_stage_2x(cleaned_stage_1446)
    v2_web = v2_2x.resize((723, 1024), Image.Resampling.LANCZOS)
    
    for p in [PUBLIC_POSTERS, PUBLIC_DOWNLOADS]:
        v2_2x.save(os.path.join(p, "v2-empower360-graduation-stage-flyer-2x.png"), optimize=True)
        v2_web.save(os.path.join(p, "v2-empower360-graduation-stage-flyer.png"), optimize=True)
    print("V2 Stage 2X and Web flyers saved successfully!")
    
    print("Step 3: Rendering Version 2 Story (1080x1920)...")
    v2_story = render_v2_story(cleaned_stage_1446)
    for p in [PUBLIC_POSTERS, PUBLIC_DOWNLOADS]:
        v2_story.save(os.path.join(p, "v2-empower360-graduation-story.png"), optimize=True)
    print("V2 Story saved successfully!")
    
    print("Step 4: Ensuring clean Version 1 assets...")
    clean_v1_emblem()
    
    print("All poster assets updated and synchronized successfully!")

if __name__ == "__main__":
    main()
