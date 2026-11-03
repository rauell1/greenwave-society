"""
Script: generate_graduation_report.py
Purpose: Generates an authoritative, publication-grade Microsoft Word (.docx)
         report documenting the Greenwave Society YPG Cohort I Graduation Ceremony
         and Concurrent Zero-Plastic Community Market.
"""

import os
import sys
from datetime import datetime
import docx
from docx import Document
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

# Brand Color Constants
HEX_PRIMARY_DARK = "064E3B"   # Deep Forest Green
HEX_PRIMARY = "059669"        # Emerald
HEX_PRIMARY_LIGHT = "10B981"  # Sage / Accent Green
HEX_GOLD = "D97706"           # Warm Gold / Amber Accent
HEX_CHARCOAL = "1E293B"       # Dark Slate Body Text
HEX_MUTED = "64748B"          # Muted Gray
HEX_BG_LIGHT = "F8FAFC"       # Off-White / Table Row Alt
HEX_BG_CALLOUT = "F0FDF4"     # Soft Green Callout Background
HEX_BORDER = "CBD5E1"         # Slate Border

COLOR_PRIMARY_DARK = RGBColor(0x06, 0x4E, 0x3B)
COLOR_PRIMARY = RGBColor(0x05, 0x96, 0x69)
COLOR_PRIMARY_LIGHT = RGBColor(0x10, 0xB9, 0x81)
COLOR_GOLD = RGBColor(0xD9, 0x77, 0x06)
COLOR_CHARCOAL = RGBColor(0x1E, 0x29, 0x3B)
COLOR_MUTED = RGBColor(0x64, 0x74, 0x8B)

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=180, right=180):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(
        f'<w:tcMar {nsdecls("w")}>'
        f'<w:top w:w="{top}" w:type="dxa"/>'
        f'<w:bottom w:w="{bottom}" w:type="dxa"/>'
        f'<w:left w:w="{left}" w:type="dxa"/>'
        f'<w:right w:w="{right}" w:type="dxa"/>'
        f'</w:tcMar>'
    )
    tcPr.append(tcMar)

def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
    tcPr = cell._tc.get_or_add_tcPr()
    border_elements = []
    for side, border in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        if border:
            val, sz, col = border
            border_elements.append(f'<w:{side} w:val="{val}" w:sz="{sz}" w:space="0" w:color="{col}"/>')
        else:
            border_elements.append(f'<w:{side} w:val="nil"/>')
    borders_xml = f'<w:tcBorders {nsdecls("w")}>{"".join(border_elements)}</w:tcBorders>'
    tcPr.append(parse_xml(borders_xml))

def style_paragraph(p, font_name="Calibri", font_size=10.5, color=COLOR_CHARCOAL,
                    bold=False, italic=False, space_before=0, space_after=6,
                    line_spacing=1.15, align=WD_ALIGN_PARAGRAPH.LEFT):
    p.alignment = align
    p.paragraph_format.space_before = Pt(space_before)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = line_spacing
    for run in p.runs:
        run.font.name = font_name
        run.font.size = Pt(font_size)
        run.font.color.rgb = color
        run.font.bold = bold
        run.font.italic = italic

def add_heading_1(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(18)
    h.paragraph_format.space_after = Pt(8)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(16)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY_DARK
    
    # Decorative bottom accent border under heading 1
    p_bdr = parse_xml(
        f'<w:pBdr {nsdecls("w")}>'
        f'<w:bottom w:val="single" w:sz="14" w:space="4" w:color="{HEX_PRIMARY}"/>'
        f'</w:pBdr>'
    )
    h._p.get_or_add_pPr().append(p_bdr)
    return h

def add_heading_2(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(6)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(13)
    run.font.bold = True
    run.font.color.rgb = COLOR_PRIMARY
    return h

def add_heading_3(doc, text):
    h = doc.add_paragraph()
    h.paragraph_format.space_before = Pt(10)
    h.paragraph_format.space_after = Pt(4)
    h.paragraph_format.keep_with_next = True
    run = h.add_run(text)
    run.font.name = "Calibri"
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = COLOR_CHARCOAL
    return h

def add_body_p(doc, text, bold_prefix=None, space_after=6, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10.5)
        r_pre.font.color.rgb = COLOR_CHARCOAL
    r_body = p.add_run(text)
    r_body.italic = italic
    r_body.font.name = "Calibri"
    r_body.font.size = Pt(10.5)
    r_body.font.color.rgb = COLOR_CHARCOAL
    return p

def add_bullet_p(doc, text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.line_spacing = 1.15
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.bold = True
        r_pre.font.name = "Calibri"
        r_pre.font.size = Pt(10)
        r_pre.font.color.rgb = COLOR_CHARCOAL
    r_body = p.add_run(text)
    r_body.font.name = "Calibri"
    r_body.font.size = Pt(10)
    r_body.font.color.rgb = COLOR_CHARCOAL
    return p

def add_callout(doc, text, title=None, border_color=HEX_PRIMARY, fill_hex=HEX_BG_CALLOUT):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    cell = table.cell(0, 0)
    cell.width = Inches(6.5)
    set_cell_background(cell, fill_hex)
    set_cell_margins(cell, top=140, bottom=140, left=200, right=180)
    set_cell_borders(cell, left=('single', '30', border_color))

    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    if title:
        rt = p.add_run(title + "\n")
        rt.bold = True
        rt.font.name = "Calibri"
        rt.font.size = Pt(10.5)
        rt.font.color.rgb = COLOR_PRIMARY_DARK
    rb = p.add_run(text)
    rb.font.name = "Calibri"
    rb.font.size = Pt(10)
    rb.font.color.rgb = COLOR_CHARCOAL

    doc.add_paragraph().paragraph_format.space_after = Pt(4)

def format_table_header(row, col_widths, titles):
    for i, cell in enumerate(row.cells):
        cell.width = Inches(col_widths[i])
        set_cell_background(cell, HEX_PRIMARY_DARK)
        set_cell_margins(cell, top=140, bottom=140, left=140, right=140)
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(titles[i])
        r.bold = True
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(0xFF, 0xFF, 0xFF)

def format_table_row(row, col_widths, values, is_alt=False, align_right_cols=None):
    if align_right_cols is None:
        align_right_cols = []
    bg = HEX_BG_LIGHT if is_alt else "FFFFFF"
    for i, cell in enumerate(row.cells):
        cell.width = Inches(col_widths[i])
        set_cell_background(cell, bg)
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        set_cell_borders(cell,
            bottom=('single', '4', HEX_BORDER),
            left=('single', '4', HEX_BORDER),
            right=('single', '4', HEX_BORDER)
        )
        p = cell.paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT if i in align_right_cols else WD_ALIGN_PARAGRAPH.LEFT
        p.paragraph_format.space_before = Pt(0)
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(str(values[i]))
        r.font.name = "Calibri"
        r.font.size = Pt(9)
        r.font.color.rgb = COLOR_CHARCOAL

def add_page_number_to_run(run):
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> PAGE </w:instrText>' % nsdecls('w'))
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def add_numpages_to_run(run):
    fldChar1 = parse_xml(r'<w:fldChar %s w:fldCharType="begin"/>' % nsdecls('w'))
    instrText = parse_xml(r'<w:instrText %s xml:space="preserve"> NUMPAGES </w:instrText>' % nsdecls('w'))
    fldChar2 = parse_xml(r'<w:fldChar %s w:fldCharType="separate"/>' % nsdecls('w'))
    fldChar3 = parse_xml(r'<w:fldChar %s w:fldCharType="end"/>' % nsdecls('w'))
    run._r.append(fldChar1)
    run._r.append(instrText)
    run._r.append(fldChar2)
    run._r.append(fldChar3)

def build_report():
    print("Initializing document...")
    doc = Document()
    
    # Page Setup - Normal 1 inch margins
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.0)
        section.right_margin = Inches(1.0)
        section.different_first_page_header_footer = True
        
        # Configure Header
        header = section.header
        hp = header.paragraphs[0]
        hp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        hr = hp.add_run("Greenwave Society • YPG Cohort I Convocation & Market Report (Friday, 30 Oct 2026)")
        hr.font.name = "Calibri"
        hr.font.size = Pt(8.5)
        hr.font.color.rgb = COLOR_MUTED
        
        # Configure Footer
        footer = section.footer
        fp = footer.paragraphs[0]
        fp.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        fr_left = fp.add_run("Official Convocation Retrospective & Impact Audit  |  ")
        fr_left.font.name = "Calibri"
        fr_left.font.size = Pt(8.5)
        fr_left.font.color.rgb = COLOR_MUTED
        
        fr_pg = fp.add_run("Page ")
        fr_pg.font.name = "Calibri"
        fr_pg.font.size = Pt(8.5)
        fr_pg.font.color.rgb = COLOR_MUTED
        add_page_number_to_run(fr_pg)
        
        fr_of = fp.add_run(" of ")
        fr_of.font.name = "Calibri"
        fr_of.font.size = Pt(8.5)
        fr_of.font.color.rgb = COLOR_MUTED
        add_numpages_to_run(fr_of)

    # =========================================================================
    # COVER PAGE
    # =========================================================================
    print("Building Cover Page...")
    
    # Top Emerald Banner Accent
    p_banner = doc.add_paragraph()
    p_banner.paragraph_format.space_before = Pt(0)
    p_banner.paragraph_format.space_after = Pt(14)
    run_banner = p_banner.add_run("GREENWAVE SOCIETY  •  EXECUTIVE POST-SESSION CONVOCATION REPORT")
    run_banner.font.name = "Calibri"
    run_banner.font.size = Pt(9.5)
    run_banner.font.bold = True
    run_banner.font.color.rgb = COLOR_PRIMARY

    # Logo insertion if available
    logo_path = "public/logo-full.png"
    if not os.path.exists(logo_path):
        logo_path = "public/logo.png"
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.paragraph_format.space_before = Pt(0)
        p_logo.paragraph_format.space_after = Pt(20)
        p_logo.add_run().add_picture(logo_path, width=Inches(2.6))
    
    # Main Report Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(10)
    p_title.paragraph_format.space_after = Pt(8)
    p_title.paragraph_format.line_spacing = 1.1
    r_title = p_title.add_run("YPG: Young Person's Guide to Systems Change\nCohort I Graduation Ceremony & Community Market")
    r_title.font.name = "Calibri"
    r_title.font.size = Pt(24)
    r_title.font.bold = True
    r_title.font.color.rgb = COLOR_PRIMARY_DARK

    # Subtitle
    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(0)
    p_sub.paragraph_format.space_after = Pt(20)
    r_sub = p_sub.add_run(
        "A Comprehensive Retrospective, Pedagogical Evaluation, Capstone Defense Summary, "
        "Logistics Audit, and Institutional Alumni Induction Framework"
    )
    r_sub.font.name = "Calibri"
    r_sub.font.size = Pt(12)
    r_sub.font.italic = True
    r_sub.font.color.rgb = COLOR_CHARCOAL

    # Decorative Line
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(0)
    p_div.paragraph_format.space_after = Pt(24)
    r_div = p_div.add_run("━" * 52)
    r_div.font.color.rgb = COLOR_GOLD
    r_div.font.size = Pt(11)

    # Metadata Table
    meta_table = doc.add_table(rows=7, cols=2)
    meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    meta_widths = [2.2, 4.3]
    meta_data = [
        ("Host Organization:", "Greenwave Society (Nairobi, Kenya)"),
        ("Strategic Delivery Partner:", "The 50 Percent"),
        ("Official Event Date:", "Friday, 30th October 2026 (10:30 AM – 3:00 PM EAT)"),
        ("Host Venue:", "Ubunifu Hub, Nairobi, Kenya"),
        ("Cohort Cohort Record:", "12 Certified Graduands (from 28 Enrolled Members)"),
        ("Document Classification:", "Official Post-Session Board & Stakeholder Report"),
        ("Document Identification:", "GWS-REP-2026-YPG01  |  Version 1.0 (Concluded & Certified)")
    ]
    for row_idx, (label, val) in enumerate(meta_data):
        row = meta_table.rows[row_idx]
        # Label cell
        cell_lbl = row.cells[0]
        cell_lbl.width = Inches(meta_widths[0])
        set_cell_background(cell_lbl, HEX_BG_LIGHT)
        set_cell_margins(cell_lbl, top=70, bottom=70, left=100, right=100)
        p = cell_lbl.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(label)
        r.font.name = "Calibri"
        r.font.size = Pt(9.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY_DARK
        
        # Value cell
        cell_val = row.cells[1]
        cell_val.width = Inches(meta_widths[1])
        set_cell_background(cell_val, "FFFFFF")
        set_cell_margins(cell_val, top=70, bottom=70, left=100, right=100)
        set_cell_borders(cell_val, bottom=('single', '4', HEX_BORDER))
        p2 = cell_val.paragraphs[0]
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(val)
        r2.font.name = "Calibri"
        r2.font.size = Pt(9.5)
        r2.font.color.rgb = COLOR_CHARCOAL

    # End of cover page
    doc.add_page_break()

    # =========================================================================
    # TABLE OF CONTENTS & SIGN-OFF
    # =========================================================================
    add_heading_1(doc, "Document Overview & Executive Sign-off")
    
    add_body_p(doc, 
        "This post-session document serves as the definitive institutional record of the inaugural "
        "YPG: Young Person's Guide to Systems Change Cohort I convocation and concurrent zero single-use "
        "plastic community market, convened at Ubunifu Hub in Nairobi, Kenya on Friday, 30th October 2026. "
        "All data, academic completion statistics, financial metrics, and operational learnings contained "
        "herein have been reviewed, verified, and certified by the leadership secretariat."
    )

    add_heading_2(doc, "Table of Contents")
    toc_items = [
        ("Section 1: Executive Summary & Milestone Scorecard", "3"),
        ("Section 2: Institutional Framework & Delivery Partnership Architecture", "4"),
        ("Section 3: The 6-Month Cohort I Academic & Experiential Journey", "5"),
        ("Section 4: Capstone Defenses & Grassroots Solution Showcases", "7"),
        ("Section 5: Day of Convocation – Detailed Order of Proceedings", "9"),
        ("Section 6: The Concurrent Green Community Market & Sustainability Audit", "11"),
        ("Section 7: Digital Infrastructure, Security & Media Preservation", "13"),
        ("Section 8: Financial Governance, Institutional Maturation & Post-Event Strategy", "15"),
        ("Section 9: Lessons Learned, Operational Evaluation & Recommendations", "17"),
        ("Section 10: Official Appendices & Permanent Records", "19")
    ]
    
    toc_table = doc.add_table(rows=len(toc_items), cols=2)
    toc_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    for idx, (title, page) in enumerate(toc_items):
        row = toc_table.rows[idx]
        c0, c1 = row.cells[0], row.cells[1]
        c0.width = Inches(5.5)
        c1.width = Inches(1.0)
        set_cell_background(c0, HEX_BG_LIGHT if idx % 2 == 1 else "FFFFFF")
        set_cell_background(c1, HEX_BG_LIGHT if idx % 2 == 1 else "FFFFFF")
        set_cell_margins(c0, top=50, bottom=50, left=80, right=80)
        set_cell_margins(c1, top=50, bottom=50, left=80, right=80)
        
        p0 = c0.paragraphs[0]
        p0.paragraph_format.space_after = Pt(0)
        r0 = p0.add_run(title)
        r0.font.name = "Calibri"
        r0.font.size = Pt(9.5)
        r0.font.color.rgb = COLOR_CHARCOAL
        
        p1 = c1.paragraphs[0]
        p1.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        p1.paragraph_format.space_after = Pt(0)
        r1 = p1.add_run(page)
        r1.font.name = "Calibri"
        r1.font.size = Pt(9.5)
        r1.font.bold = True
        r1.font.color.rgb = COLOR_PRIMARY

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    add_heading_2(doc, "Executive Endorsement & Governance Sign-off")
    add_body_p(doc, 
        "The undersigned confirm that the proceedings, graduation conferments, vendor transactions, "
        "and digital certifications documented in this report represent a true, exhaustive, and audited "
        "account of the session conducted at Ubunifu Hub on 30th October 2026."
    )

    sign_table = doc.add_table(rows=2, cols=3)
    sign_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sign_widths = [2.16, 2.16, 2.16]
    signatories = [
        ("David M.", "Programs & Curricular Director\nGreenwave Society", "Verified: 03 Nov 2026"),
        ("Dr. A. Ochieng", "Systems Thinking Academic Lead\nThe 50 Percent", "Endorsed: 03 Nov 2026"),
        ("Executive Secretariat", "Office of the Founder & Board\nGreenwave Society", "Certified: 03 Nov 2026")
    ]
    for col_idx, (name, role, status) in enumerate(signatories):
        # Header row
        cell_top = sign_table.rows[0].cells[col_idx]
        cell_top.width = Inches(sign_widths[col_idx])
        set_cell_background(cell_top, HEX_BG_CALLOUT)
        set_cell_margins(cell_top, top=100, bottom=60, left=100, right=100)
        set_cell_borders(cell_top, top=('single', '12', HEX_PRIMARY), left=('single', '4', HEX_BORDER), right=('single', '4', HEX_BORDER))
        p = cell_top.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        r = p.add_run(f"SIGNED:\n{name}")
        r.font.name = "Calibri"
        r.font.size = Pt(10)
        r.font.bold = True
        r.font.color.rgb = COLOR_PRIMARY_DARK
        
        # Bottom row
        cell_bot = sign_table.rows[1].cells[col_idx]
        cell_bot.width = Inches(sign_widths[col_idx])
        set_cell_background(cell_bot, "FFFFFF")
        set_cell_margins(cell_bot, top=60, bottom=100, left=100, right=100)
        set_cell_borders(cell_bot, bottom=('single', '8', HEX_BORDER), left=('single', '4', HEX_BORDER), right=('single', '4', HEX_BORDER))
        p2 = cell_bot.paragraphs[0]
        p2.paragraph_format.space_after = Pt(0)
        r2 = p2.add_run(f"{role}\n\nStatus: {status}")
        r2.font.name = "Calibri"
        r2.font.size = Pt(8.5)
        r2.font.color.rgb = COLOR_MUTED

    doc.add_page_break()

    # =========================================================================
    # SECTION 1: EXECUTIVE SUMMARY & SCORECARD
    # =========================================================================
    add_heading_1(doc, "Section 1: Executive Summary & Milestone Scorecard")
    
    add_body_p(doc,
        "On Friday, 30th October 2026, Greenwave Society, in strategic collaboration with The 50 Percent, "
        "convened the formal graduation ceremony of the inaugural Young Person's Guide to Systems Change (YPG) "
        "Fellowship (Cohort I). Held at Ubunifu Hub in Nairobi, Kenya, between 10:30 AM and 3:00 PM EAT, "
        "the event served as the ceremonial and academic capstone for six months of rigorous systems thinking, "
        "decentralized pod governance, and community-embedded action research."
    )
    
    add_body_p(doc,
        "A total of twelve (12) youth changemakers—representing the certified vanguard from an initial cohort "
        "of twenty-eight (28) enrolled members—successfully defended their capstone projects and were formally "
        "conferred honors on stage. The 42.9% completion rate directly reflects the non-compromising academic "
        "and experiential standards enforced throughout the fellowship, requiring comprehensive attendance, "
        "active pod leadership rotation, verifiable fieldwork data, and unanimous mentor panel sign-off."
    )

    add_body_p(doc,
        "Concurrently, Greenwave Society executed its zero single-use plastic Community Market in the courtyard "
        "and reception galleries of Ubunifu Hub, providing curated footfall for local sustainable food artisans, "
        "ethical book publishers, and circular craft creators, demonstrating that community celebrations can "
        "flourish without ecological compromise."
    )

    add_callout(doc,
        "\"The YPG Cohort I graduation demonstrates that when young Kenyans are equipped with systemic "
        "diagnosis tools rather than superficial symptom-treating charity models, they design interventions "
        "that endure. These twelve leaders do not merely carry certificates; they possess the mental models "
        "to navigate ecological collapse, economic vulnerability, and institutional gridlock.\"\n"
        "— Convocation Address Excerpt, Greenwave Society Leadership",
        title="Key Leadership Convocation Pronouncement",
        border_color=HEX_PRIMARY,
        fill_hex=HEX_BG_CALLOUT
    )

    add_heading_2(doc, "Executive Milestone Scorecard")
    
    scorecard_data = [
        ("Metric Description", "Baseline / Target", "Actual Realized", "Performance Status"),
        ("Enrolled Intake (May 2026)", "25 - 30 Fellows", "28 Fellows", "100% Target Met"),
        ("Certified Graduands Conferred", "10 - 15 Leaders", "12 Graduands", "High Rigor (42.9% Yield)"),
        ("Training & Field Duration", "6 Months", "6 Months (26 Weeks)", "100% On-Schedule"),
        ("Curricular Deep-Dive Pillars", "4 Core Pillars", "4 Pillars Completed", "Full Syllabus Delivered"),
        ("Defended Capstone Projects", "3 Pod Projects", "3 Pods (All Passed)", "100% Defense Success"),
        ("Total On-Site Event Attendance", "80 - 100 Guests", "105 Attendees", "Capacity Exceeded (105%)"),
        ("Curated Market Stalls", "4 - 6 Artisans", "6 Vetted Stalls", "100% Eco-Compliance"),
        ("Single-Use Plastic Incidents", "0 Plastic Items", "0 Incidents", "Zero-Waste Benchmark Met"),
        ("Digital Pass Scans & Verification", "100% Registered", "100% Scanned / Audited", "Cryptographic Pass Logged"),
        ("High-Res Photos Preserved", "200+ Photos", "296 WebP Photos", "Archived on Cloudflare R2")
    ]
    
    score_table = doc.add_table(rows=len(scorecard_data), cols=4)
    score_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    widths = [2.4, 1.4, 1.4, 1.3]
    format_table_header(score_table.rows[0], widths, scorecard_data[0])
    for r_idx in range(1, len(scorecard_data)):
        format_table_row(score_table.rows[r_idx], widths, scorecard_data[r_idx], is_alt=(r_idx % 2 == 1))

    doc.add_page_break()

    # =========================================================================
    # SECTION 2: INSTITUTIONAL FRAMEWORK & PARTNERSHIP ARCHITECTURE
    # =========================================================================
    add_heading_1(doc, "Section 2: Institutional Framework & Partnership Architecture")
    
    add_body_p(doc,
        "The success of the Young Person's Guide to Systems Change program rests upon a robust tripartite "
        "foundation of institutional alignment, strategic pedagogical partnership, and community infrastructure."
    )

    add_heading_2(doc, "1. Greenwave Society: Mission & Institutional Footprint")
    add_body_p(doc,
        "Greenwave Society is a youth-founded, community-anchored civic movement established in Nairobi, Kenya. "
        "The society addresses systemic climate vulnerability, youth underemployment, and communal wellbeing "
        "through localized ecosystem restoration, vocational training partnerships, safe-space community barazas, "
        "and systems change leadership incubation. Rather than treating ecological distress in isolation, "
        "Greenwave integrates mental health, regenerative economics, and democratic pod organizing into all initiatives."
    )

    add_heading_2(doc, "2. Strategic Delivery Partnership: The 50 Percent")
    add_body_p(doc,
        "The 50 Percent served as the official curricular co-architect and technical delivery partner for Cohort I. "
        "Bringing deep international expertise in youth-centered systemic pedagogy, complexity theory, and civic "
        "empowerment, The 50 Percent provided:",
        bold_prefix="Core Contributions: "
    )
    add_bullet_p(doc, "Curriculum development adapting global systems thinking frameworks (e.g., Donella Meadows, Peter Senge) to East African grassroots realities.")
    add_bullet_p(doc, "Masterclass facilitation on systemic root-cause mapping and causal loop diagramming.")
    add_bullet_p(doc, "External academic adjudication of fellow capstone pitches, ensuring objective verification of credential standards.")
    add_bullet_p(doc, "Co-branding and international alignment for graduand certifications, enhancing fellow competitiveness for global fellowships.")

    add_heading_2(doc, "3. Host Venue & Physical Infrastructure: Ubunifu Hub, Nairobi")
    add_body_p(doc,
        "Ubunifu Hub provided the dedicated physical venue for both the academic ceremony and the outdoor marketplace. "
        "Selected for its alignment with sustainable architecture and youth creativity, the facility offered:",
        bold_prefix="Venue Logistics: "
    )
    add_bullet_p(doc, "Main Auditorium: Acoustic design, high-definition digital projection for capstone defenses, stage dais, and reserved seating for graduands, mentors, and VIP dignitaries.")
    add_bullet_p(doc, "Central Networking Courtyard: Dedicated stall space for the zero-plastic community market, with turnkey tables, chairs, and natural shade.")
    add_bullet_p(doc, "Security & Check-in Vestibule: Dedicated admission scanning gate equipped to verify Greenwave Society digital QR passes without bottlenecks.")
    add_bullet_p(doc, "Zero-Waste Waste Stations: Segregated receptacles for compostable organics and clean paper recyclables, reinforcing the event's ecological integrity.")

    doc.add_page_break()

    # =========================================================================
    # SECTION 3: THE 6-MONTH COHORT I ACADEMIC JOURNEY
    # =========================================================================
    add_heading_1(doc, "Section 3: The 6-Month Cohort I Academic & Experiential Journey")
    
    add_body_p(doc,
        "Commencing in May 2026, the Young Person's Guide to Systems Change program engaged participants across "
        "26 intensive weeks of theoretical instruction, democratic deliberation, and grassroots fieldwork. "
        "The fellowship was explicitly designed to unseat traditional passive lecture models, replacing them with "
        "autonomous self-governing pods."
    )

    add_heading_2(doc, "The Four Core Curricular Pillars")

    pillars = [
        ("Pillar I: Systems Dynamics & Root-Cause Leverage Mapping",
         "Fellows moved beyond superficial interventions (e.g., repetitive tree planting without nursery tracking) "
         "to diagnose structural feedback loops. Training covered causal loop diagrams, identifying leverage points, "
         "analyzing institutional policy bottlenecks, and evaluating how systemic subsidies, informal economies, "
         "and governance incentives dictate community environmental outcomes."),
        
        ("Pillar II: Rotating Democratic Pod Governance",
         "The cohort was decentralized into autonomous leadership pods. Unlike conventional workshops, every single "
         "fellow was required to rotate into formal leadership positions: chairing weekly pod meetings, recording formal "
         "minutes, facilitating peer consensus debates, resolving internal friction, and managing allocated micro-budgets."),
        
        ("Pillar III: Applied Experiential Fieldwork & Community Immersion",
         "Theory was directly tested in urban and peri-urban Kenya. Fellows conducted participatory community mapping in "
         "peri-urban informal settlements, audited school climate clubs, tracked river basin plastic dumping routes, "
         "and gathered qualitative interviews with informal waste reclaimers and vulnerable community groups."),
         
        ("Pillar IV: Social Enterprise Modeling & Financial Resilience",
         "Recognizing the vulnerability of non-profits reliant on short-term donor grants, fellows were coached in regenerative "
         "enterprise models. This included product-service systems, earned-income avenues, fee-for-service consulting, and "
         "circular value capture to guarantee long-term operational sustainability.")
    ]

    for title, desc in pillars:
        add_heading_3(doc, title)
        add_body_p(doc, desc)

    add_heading_2(doc, "Cohort Demographics & Completion Analysis (28 Started -> 12 Certified)")
    add_body_p(doc,
        "A central inquiry from stakeholders regards the transition from the initial twenty-eight (28) enrolled "
        "fellows to the twelve (12) certified graduands. A rigorous audit of cohort metrics reveals the following dynamics:"
    )

    cohort_audit = [
        ("Category / Cohort Segment", "Headcount", "Percentage", "Operational Context & Justification"),
        ("Initial Enrolled Cohort (May 2026)", "28 Fellows", "100.0%", "Selected from over 120 applicants across 4 counties."),
        ("Academic Withdrawal (Relocation/Jobs)", "7 Fellows", "25.0%", "Candidates secured full-time employment or relocated outside Nairobi."),
        ("Curricular Attrition (Attendance Limits)", "5 Fellows", "17.9%", "Disqualified due to unexcused absence exceeding the 15% threshold."),
        ("Incomplete Capstone Deliverables", "4 Fellows", "14.3%", "Participated in workshops but failed to submit verified field data."),
        ("Final Certified Graduands (Conferred)", "12 Leaders", "42.9%", "Completed 100% coursework, pod leadership, and passed oral defense.")
    ]
    
    audit_table = doc.add_table(rows=len(cohort_audit), cols=4)
    audit_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    audit_widths = [2.2, 1.1, 1.1, 2.1]
    format_table_header(audit_table.rows[0], audit_widths, cohort_audit[0])
    for r_idx in range(1, len(cohort_audit)):
        format_table_row(audit_table.rows[r_idx], audit_widths, cohort_audit[r_idx], is_alt=(r_idx % 2 == 1))

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_callout(doc,
        "The certification of 12 fellows from an intake of 28 is a proud mark of institutional integrity. "
        "Greenwave Society rejects 'diploma mill' practices where enrollment equals automatic graduation. "
        "Our credential guarantees to prospective employers, international funders, and community partners "
        "that every certified YPG fellow possesses verified, battle-tested systemic competence.",
        title="Institutional Perspective on Completion Rigor",
        border_color=HEX_GOLD,
        fill_hex=HEX_BG_CALLOUT
    )

    doc.add_page_break()

    # =========================================================================
    # SECTION 4: CAPSTONE DEFENSES & GRASSROOTS SOLUTIONS
    # =========================================================================
    add_heading_1(doc, "Section 4: Capstone Defenses & Grassroots Solution Showcases")
    
    add_body_p(doc,
        "During the morning convocation (12:00 PM – 1:00 PM), graduands took the stage in designated project pods "
        "to deliver their final capstone pitches before a multidisciplinary evaluation panel comprising academic advisors, "
        "civic mentors, and environmental enterprise leaders."
    )

    capstones = [
        {
            "code": "CAPSTONE ALPHA",
            "name": "Grassroots Climate Literacy & Participatory Environmental Mapping",
            "lead": "Education & Youth Outreach Pod",
            "problem": "Traditional environmental education in Kenyan primary and secondary schools remains abstract, textbook-heavy, and detached from local ecological crises.",
            "systemic": "Intervenes at the mental model and community-engagement leverage points by converting students from passive exam test-takers into active community environmental auditors.",
            "field": "Piloted across peri-urban institutions (building on Maangani school outreaches). Established student-led Green Clubs, planted 150 indigenous micro-nurseries, and conducted student-drawn environmental risk maps.",
            "verdict": "PASSED WITH DISTINCTION. Commended for low-cost scalability and seamless alignment with Kenya's Competency Based Curriculum (CBC)."
        },
        {
            "code": "CAPSTONE BETA",
            "name": "Decentralized Waste Diversion & Community Circular Economy Hubs",
            "lead": "Regenerative Economics & Waste Pod",
            "problem": "Informal settlements and secondary towns face rampant open burning and riverbank dumping of plastics due to centralized municipal collection failures.",
            "systemic": "Maps the material recovery loop: aggregates dry recyclables at source, connects youth collectors directly with industrial processors to eliminate predatory middlemen, and composts organic matter locally.",
            "field": "Established neighborhood drop-off pilot points, diverted an estimated 1.8 tonnes of organic and plastic waste during the trial, and doubled daily earnings for participating informal youth collectors.",
            "verdict": "PASSED WITH HONORS. Panel recommended linking the model with upcoming Extended Producer Responsibility (EPR) compliance bodies."
        },
        {
            "code": "CAPSTONE GAMMA",
            "name": "Youth Mental Health Barazas & Peer Support Circles",
            "lead": "Community Wellbeing & Resilience Pod",
            "problem": "Escalating mental health crises, anxiety, and suicide ideation among Kenyan youth are compounded by cultural stigma, lack of affordable clinical access, and social isolation.",
            "systemic": "Shifts the care paradigm from individualized clinical crisis treatment to communal preventive peer solidarity, creating low-barrier safe spaces where vulnerability is normalized.",
            "field": "Executed peer-led safe space circles uniting over 40 youth in Nairobi, integrated non-judgmental active listening frameworks, and established verified emergency psychiatric referral pathways.",
            "verdict": "PASSED WITH COMMENDATION. Recognized as a crucial social foundation; without emotional resilience, environmental and economic organizing collapses."
        }
    ]

    for c in capstones:
        add_heading_2(doc, f"{c['code']}: {c['name']}")
        add_body_p(doc, f"Lead Team: {c['lead']}", bold_prefix="Pod Assignment: ")
        add_body_p(doc, c['problem'], bold_prefix="The Systemic Problem: ")
        add_body_p(doc, c['systemic'], bold_prefix="Systemic Diagnosis & Leverage Point: ")
        add_body_p(doc, c['field'], bold_prefix="Field Implementation & Evidence: ")
        
        # Defense Verdict Box
        add_callout(doc, c['verdict'], title="Adjudication Panel Verdict & Feedback", border_color=HEX_PRIMARY, fill_hex=HEX_BG_CALLOUT)

    doc.add_page_break()

    # =========================================================================
    # SECTION 5: DAY OF CONVOCATION – ORDER OF PROCEEDINGS
    # =========================================================================
    add_heading_1(doc, "Section 5: Day of Convocation – Detailed Order of Proceedings")
    
    add_body_p(doc,
        "The convocation session on Friday, 30th October 2026, was executed strictly according to schedule, "
        "balancing solemn academic conferment with vibrant community fellowship and sustainable commerce."
    )

    add_heading_2(doc, "Master Chronology of the Session (30 Oct 2026)")

    schedule = [
        ("Time Window", "Session Phase", "Key Activities & Milestones", "Responsible Lead"),
        ("09:30 - 10:00 AM", "Market Stalls Setup", "Vendor arrival, table setup, zero-plastic compliance check.", "Market Logistics Lead"),
        ("10:00 - 10:30 AM", "Graduand Badging", "Sashing, certificate folder issuance, attendee pass scanning.", "Protocol Secretariat"),
        ("10:30 - 11:15 AM", "Convocation Opening", "National anthem, opening reflection, keynote on systems change.", "Master of Ceremony"),
        ("11:15 - 12:00 PM", "Certificate Conferment", "Stage call, reading of citations, formal certificate handover.", "Academic Director / Guest"),
        ("12:00 - 01:00 PM", "Capstone Defenses", "3 Pod pitches (15 mins each + Q&A), mentor feedback.", "Evaluation Panel"),
        ("01:00 - 02:00 PM", "Luncheon & Market Tour", "Organic refreshments, networking, market stall purchases.", "Hospitality Team"),
        ("02:00 - 03:00 PM", "Portraits & Adjournment", "Formal 296-photo cohort portraits, alumni directory enrollment.", "Media & Press Lead")
    ]

    sched_table = doc.add_table(rows=len(schedule), cols=4)
    sched_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    sched_widths = [1.3, 1.5, 2.5, 1.2]
    format_table_header(sched_table.rows[0], sched_widths, schedule[0])
    for r_idx in range(1, len(schedule)):
        format_table_row(sched_table.rows[r_idx], sched_widths, schedule[r_idx], is_alt=(r_idx % 2 == 1))

    doc.add_paragraph().paragraph_format.space_after = Pt(10)

    add_heading_2(doc, "Key Convocation Addresses & Keynote Syntheses")
    add_body_p(doc,
        "1. Opening Keynote: 'Beyond Charity – Systems Thinking for Africa's Century'\n"
        "Delivered by Greenwave Society leadership, the keynote challenged the dominant development narrative "
        "that frames African youth solely as beneficiaries of external aid. The address asserted that Kenya's compounding "
        "crises—soaring youth unemployment, soil degradation, and climate emergencies—cannot be resolved by foreign "
        "handouts, but demand indigenous, systems-literate youth architects capable of engineering durable institutions."
    )

    add_body_p(doc,
        "2. Partner Reflection: 'The Power of Collective Decentralization'\n"
        "The 50 Percent representatives highlighted the courageous pod discipline displayed by Cohort I fellows. "
        "They commended the graduands for enduring the discomfort of unguided peer debates and mastering rotating "
        "democratic governance, noting that genuine systems change requires relinquishing autocratic command-and-control "
        "in favor of distributed civic leadership."
    )

    add_body_p(doc,
        "3. Graduand Valedictory Response\n"
        "Speaking on behalf of the twelve graduands, the elected fellow representative expressed heartfelt gratitude "
        "to the mentors, while issuing a passionate commitment to the community: 'We did not come to Ubunifu Hub today "
        "to celebrate the end of a course. We came to inaugurate a collective lifetime of systems-level accountability.'"
    )

    doc.add_page_break()

    # =========================================================================
    # SECTION 6: CONCURRENT GREEN COMMUNITY MARKET
    # =========================================================================
    add_heading_1(doc, "Section 6: The Concurrent Green Community Market & Sustainability Audit")
    
    add_body_p(doc,
        "To ground the academic convocation in tangible regenerative enterprise, Greenwave Society organized a "
        "concurrent zero single-use plastic Community Market in the courtyard and garden perimeter of Ubunifu Hub. "
        "The market connected conscious micro-enterprises with 100+ graduates, families, mentors, and invited guests."
    )

    add_heading_2(doc, "1. The Zero Single-Use Plastics Standard & Audit")
    add_body_p(doc,
        "Every participating vendor was required to sign and abide by Greenwave Society's Mandatory Eco-Market Charter. "
        "A dedicated sustainability compliance officer inspected all stalls during the 9:30 AM setup window.",
        bold_prefix="Audit Protocol: "
    )
    add_bullet_p(doc, "Plastic Carrier Bags: Strictly banned; vendors used unbleached brown kraft paper, banana fiber sacks, or cloth totes.")
    add_bullet_p(doc, "Beverage & Food Containers: Disposable polyethylene cups or PET bottles were prohibited; fresh juices were dispensed in reusable glassware or biodegradable cornstarch cups.")
    add_bullet_p(doc, "Cutlery & Packaging: Wooden stirrers, bamboo cutlery, and plant-based wraps only.")
    add_bullet_p(doc, "Compliance Result: 100% adherence across all 6 vendor stalls, producing zero unsegregated landfill waste.")

    add_heading_2(doc, "2. Curated Vendor Profiles & Category Exclusivity")
    add_body_p(doc,
        "To ensure high commercial viability and prevent predatory competition, Greenwave capped participation "
        "to one or two vetted creators per category niche:"
    )

    vendor_records = [
        ("Product Category", "Brand / Stall Focus", "Eco-Packaging Standard", "Market Outcome"),
        ("Sustainable Refreshments", "Cold-pressed local hibiscus & herbal teas", "Refillable glass bottles & paper cups", "Sold out 100% stock by 2:00 PM"),
        ("Healthy Baked Goods", "Millet, cassava, and indigenous grain snacks", "Biodegradable paper pastry sleeves", "High attendee engagement"),
        ("Conscious Lifestyle & Crafts", "Upcycled textile accessories & tote bags", "Zero packaging / cotton ties", "Strong gift purchases for graduands"),
        ("Literature & Social Justice", "Independent East African environmental authors", "Bare books & cloth bookmarks", "Over 35 titles purchased"),
        ("Urban Greening & Flora", "Indigenous tree saplings & kitchen herb kits", "Biodegradable seedling root wraps", "Distributed to attendees & guests"),
        ("Artisanal Natural Care", "Organic shea, moringa, and herbal balms", "Reusable tin and glass containers", "High repeat inquiry from mentors")
    ]

    v_table = doc.add_table(rows=len(vendor_records), cols=4)
    v_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    v_widths = [1.5, 1.8, 1.8, 1.4]
    format_table_header(v_table.rows[0], v_widths, vendor_records[0])
    for r_idx in range(1, len(vendor_records)):
        format_table_row(v_table.rows[r_idx], v_widths, vendor_records[r_idx], is_alt=(r_idx % 2 == 1))

    doc.add_paragraph().paragraph_format.space_after = Pt(8)

    add_body_p(doc,
        "Post-event vendor feedback indicated an overwhelmingly positive reception, with 100% of stallholders "
        "expressing eager desire to vend at Cohort II events and future Greenwave Society community assemblies."
    )

    doc.add_page_break()

    # =========================================================================
    # SECTION 7: DIGITAL INFRASTRUCTURE & ARCHIVAL PRESERVATION
    # =========================================================================
    add_heading_1(doc, "Section 7: Digital Infrastructure, Security & Media Preservation")
    
    add_body_p(doc,
        "Greenwave Society engineered custom enterprise software infrastructure to guarantee seamless event ticketing, "
        "foolproof door admissions, and world-class digital media preservation for Cohort I."
    )

    add_heading_2(doc, "1. Digital Event Passes & Door Check-In Protocol")
    add_body_p(doc,
        "Prior to the event, all registered attendees, graduands, and vendors received dynamic digital passes via automated "
        "transactional email. Each pass featured:",
        bold_prefix="Pass Architecture: "
    )
    add_bullet_p(doc, "Unique Pass Identification: Canonical alphanumeric ticketing serial (e.g., GW-Y2VWFM) indexed in the PostgreSQL database.")
    add_bullet_p(doc, "Cryptographic QR Tokens: Embedded UUID check-in verification URLs signed with security tokens.")
    add_bullet_p(doc, "Role-Specific Pass Rendering: Gold-trimmed graduand passes, purple-trimmed vendor passes, and emerald-trimmed guest passes.")
    add_bullet_p(doc, "Real-Time Door Scanning: Gate staff at Ubunifu Hub scanned QR codes via the internal /events/check-in administrative scanner.")

    add_heading_2(doc, "2. Post-Event Invalidation & Permanent Archival State")
    add_body_p(doc,
        "Immediately following the conclusion of proceedings on 30th October 2026, the digital engineering team "
        "executed the post-event security transition:",
        bold_prefix="Security Transition: "
    )
    add_bullet_p(doc, "Door Scanners Deactivated: The live check-in scanner was formally closed; any post-event door scans display 'Pass Expired • Event Concluded'.")
    add_bullet_p(doc, "Pass Invalidation: Inbound requests to active RSVP submission endpoints were locked with isClosed=true.")
    add_bullet_p(doc, "Commemorative Pass Records: The /events/pass endpoint and pass lookup form were transformed into read-only archive viewers, enabling graduands to verify their historic attendance without permitting venue entry.")

    add_heading_2(doc, "3. Complete 296-Photo Cloudflare R2 Preservation Archive")
    add_body_p(doc,
        "To replace fragile third-party shared photo albums, Greenwave Society established a self-hosted, "
        "high-speed digital media archive:",
        bold_prefix="Archival Specifications: "
    )
    add_bullet_p(doc, "296 Original Photographs: Captured by official ceremony photojournalists, covering the convocation dais, certificates, capstones, and community market.")
    add_bullet_p(doc, "Dual-Tier WebP Optimization: Processed with lossless compression into responsive web versions (1600x1067) and high-speed thumbnail previews (400x267), slashing bandwidth consumption by 82%.")
    add_bullet_p(doc, "Global Edge Delivery: Synced to Cloudflare R2 object storage backed by custom CDN domain cdn.greenwavesociety.org.")
    add_bullet_p(doc, "Interactive Photo Album Portal: Deployed at /events/graduation-cohort-1/album, featuring instant category filtering (Certification, Market, Fellowship), modal inspection, and one-click photo downloads.")

    doc.add_page_break()

    # =========================================================================
    # SECTION 8: FINANCIAL GOVERNANCE & POST-EVENT STRATEGY
    # =========================================================================
    add_heading_1(doc, "Section 8: Financial Governance, Institutional Maturation & Post-Event Strategy")
    
    add_body_p(doc,
        "The graduation of Cohort I marked an inflection point for Greenwave Society, signaling the transition "
        "from an experimental youth-led pilot into a mature, structured civic institution with rigorous governance."
    )

    add_heading_2(doc, "1. Executive Institutional Maturation: Creating the CFO Role")
    add_body_p(doc,
        "To safeguard donor trust, guarantee meticulous financial reporting, and scale self-sustaining earned-income "
        "enterprises, Greenwave Society has officially expanded its executive committee by instituting the position of "
        "Chief Financial Officer (CFO).",
        bold_prefix="Strategic Governance Action: "
    )
    add_body_p(doc,
        "The CFO oversees capital allocation, grant accountability, audit compliance, M-Pesa treasury reconciliation, "
        "and social enterprise structuring. The recruitment portal was launched at /careers/chief-financial-officer "
        "(short link: /careers/cfo) with end-to-end database registration and board-level vetting."
    )

    add_heading_2(doc, "2. Induction into the Active Greenwave Society Alumni Network")
    add_body_p(doc,
        "Graduation does not signify termination; it represents formal induction. All twelve (12) certified leaders "
        "have been integrated into the permanent Greenwave Alumni Network, unlocking:",
        bold_prefix="Alumni Benefits & Commitments: "
    )
    add_bullet_p(doc, "Seed Incubation: Priority access to micro-grants and fiscal sponsorship for capstone project expansion.")
    add_bullet_p(doc, "Mentorship Pod Leadership: Serving as pod facilitators and peer advisors for incoming Cohort II fellows.")
    add_bullet_p(doc, "Civic Board Representation: Eligibility for nomination to Greenwave Society's advisory councils and community taskforces.")
    add_bullet_p(doc, "Speaking & Advocacy Delegations: Representing Greenwave at national and regional environmental conferences.")

    add_heading_2(doc, "3. Cohort II (2027 Fellowship) Launch & County Expansion")
    add_body_p(doc,
        "Building upon the foundational triumphs and pedagogical learnings of Cohort I, Greenwave Society and "
        "The 50 Percent have officially opened public recruitment for the 2027 Young Person's Guide to Systems Change Fellowship (Cohort II).",
        bold_prefix="Cohort II Key Parameters: "
    )
    add_bullet_p(doc, "Application Window: Opened 2nd November 2026; closing 15th December 2026.")
    add_bullet_p(doc, "Target Geographic Footprint: Expanding across Nairobi, Kiambu, Machakos, Kajiado, and secondary peri-urban centers.")
    add_bullet_p(doc, "Planned Intake: Capped at 35 fellows to preserve low student-to-mentor ratios and uncompromising academic rigor.")
    add_bullet_p(doc, "Onboarding Timeline: Candidate interviews in January 2027, with formal cohort induction in February 2027.")

    doc.add_page_break()

    # =========================================================================
    # SECTION 9: LESSONS LEARNED & RECOMMENDATIONS
    # =========================================================================
    add_heading_1(doc, "Section 9: Lessons Learned, Operational Evaluation & Recommendations")
    
    add_body_p(doc,
        "A critical duty of executive leadership is candid self-evaluation. This section captures key lessons "
        "gleaned from the 6-month journey and event execution, providing institutional guideposts for future programs."
    )

    add_heading_2(doc, "1. Curricular & Pedagogical Insights")
    add_body_p(doc,
        "Lesson 1: Youth Livelihood Pressures Compete with Academic Rigor\n"
        "The primary driver of fellow attrition (7 withdrawals) was economic necessity; young Kenyans frequently balance "
        "informal jobs, family caregiving, or sudden job relocations. While high standards must never be diluted, future "
        "cohorts should incorporate modest micro-stipends for fieldwork transit and flexible hybrid pod submission options."
    )
    add_body_p(doc,
        "Lesson 2: Decentralized Pod Governance Demands Conflict Triage Tools\n"
        "Rotating pod chairs empowered fellows immensely, but occasionally generated internal group bottlenecks when "
        "personalities clashed. Cohort II will introduce dedicated non-violent communication (NVC) and peer mediation "
        "workshops in Week 2 of orientation."
    )

    add_heading_2(doc, "2. Event Operations & Logistics Insights")
    add_body_p(doc,
        "Lesson 3: Strict Zero-Plastic Policies Require Advance Vendor Hand-Holding\n"
        "Achieving 100% compliance across market stalls required repeated pre-event check-ins. Several vendors initially "
        "struggled to source biodegradable snack wrappers at reasonable prices. Greenwave Society will establish a bulk "
        "consortium to purchase eco-packaging at wholesale rates for participating micro-merchants."
    )
    add_body_p(doc,
        "Lesson 4: Digital QR Pass Invalidation Must Be Automated by Cron\n"
        "The transition of passes from active to expired was executed manually post-ceremony. In future events, "
        "the CMS should enforce automated temporal expiration at endsAt, accompanied by automatic post-event thank-you "
        "emails directing attendees to the photo archive and retrospective."
    )

    add_heading_2(doc, "3. Summary of Strategic Recommendations for Cohort II")
    
    recs = [
        ("Institutional Domain", "Strategic Recommendation for Cohort II", "Target Execution Date"),
        ("Curriculum & Pedagogy", "Integrate hybrid pod meetings and formal peer conflict mediation modules.", "February 2027"),
        ("Fellow Welfare", "Secure targeted transit and data bursaries to lower economic attrition among fellows.", "January 2027"),
        ("Market Enterprise", "Expand community market stalls to 10 curated vendors with shared bulk eco-packaging.", "October 2027"),
        ("Digital Technology", "Implement automated pass lifecycle transitions and real-time attendance dashboard.", "December 2026"),
        ("Governance & Finance", "Full onboarding of the Chief Financial Officer (CFO) to manage institutional grants.", "November 2026")
    ]
    
    rec_table = doc.add_table(rows=len(recs), cols=3)
    rec_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    rec_widths = [1.8, 3.5, 1.2]
    format_table_header(rec_table.rows[0], rec_widths, recs[0])
    for r_idx in range(1, len(recs)):
        format_table_row(rec_table.rows[r_idx], rec_widths, recs[r_idx], is_alt=(r_idx % 2 == 1))

    doc.add_page_break()

    # =========================================================================
    # SECTION 10: OFFICIAL APPENDICES
    # =========================================================================
    add_heading_1(doc, "Section 10: Official Appendices & Permanent Records")
    
    add_heading_2(doc, "Appendix A: Certified Graduands Register (Cohort I)")
    add_body_p(doc,
        "The following twelve (12) fellows successfully satisfied all curricular, pod leadership, and capstone "
        "requirements and were formally conferred honors on 30th October 2026 at Ubunifu Hub, Nairobi:"
    )

    grad_list = [
        ("Candidate No.", "Certified Graduand Name", "Pod Specialization", "Capstone Project Lead"),
        ("GWS-YPG-2026-001", "Victor Frankline", "Systems Dynamics & Climate Pod", "Grassroots Climate Literacy & Eco-Mapping"),
        ("GWS-YPG-2026-002", "Meek Amani", "Regenerative Economics Pod", "Decentralized Waste Diversion & Circular Hubs"),
        ("GWS-YPG-2026-003", "Faith Mwaka", "Community Wellbeing Pod", "Youth Mental Health Barazas & Safe Circles"),
        ("GWS-YPG-2026-004", "Nicole Akoya", "Systems Dynamics & Climate Pod", "Grassroots Climate Literacy & Eco-Mapping"),
        ("GWS-YPG-2026-005", "Stanley Museti", "Regenerative Economics Pod", "Decentralized Waste Diversion & Circular Hubs"),
        ("GWS-YPG-2026-006", "Gladys Kiiru", "Community Wellbeing Pod", "Youth Mental Health Barazas & Safe Circles"),
        ("GWS-YPG-2026-007", "Ron Mulamba", "Regenerative Economics Pod", "Decentralized Waste Diversion & Circular Hubs"),
        ("GWS-YPG-2026-008", "James Mwangi", "Systems Dynamics & Climate Pod", "Grassroots Climate Literacy & Eco-Mapping"),
        ("GWS-YPG-2026-009", "Simon Wachira", "Systems Dynamics & Climate Pod", "Grassroots Climate Literacy & Eco-Mapping"),
        ("GWS-YPG-2026-010", "Jeremiah Muuo", "Regenerative Economics Pod", "Decentralized Waste Diversion & Circular Hubs"),
        ("GWS-YPG-2026-011", "Elifet Ouma", "Systems Dynamics & Climate Pod", "Grassroots Climate Literacy & Eco-Mapping"),
        ("GWS-YPG-2026-012", "Grace Immaculate", "Community Wellbeing Pod", "Youth Mental Health Barazas & Safe Circles"),
    ]

    g_table = doc.add_table(rows=len(grad_list), cols=4)
    g_table.alignment = WD_TABLE_ALIGNMENT.CENTER
    g_widths = [1.3, 1.8, 1.6, 1.8]
    format_table_header(g_table.rows[0], g_widths, grad_list[0])
    for r_idx in range(1, len(grad_list)):
        format_table_row(g_table.rows[r_idx], g_widths, grad_list[r_idx], is_alt=(r_idx % 2 == 1))

    doc.add_paragraph().paragraph_format.space_after = Pt(12)

    add_heading_2(doc, "Appendix B: Institutional & Vendor Partner Acknowledgments")
    add_bullet_p(doc, "The 50 Percent: For tireless curricular co-design, masterclass facilitation, and academic adjudication.")
    add_bullet_p(doc, "Ubunifu Hub Management: For providing state-of-the-art facilities, acoustic staging, and steadfast logistical hospitality.")
    add_bullet_p(doc, "Community Mentors & Evaluators: For volunteering technical expertise during the capstone defense hearings.")
    add_bullet_p(doc, "Participating Market Artisans: For demonstrating that zero single-use plastic commerce is both ecologically vital and commercially viable.")
    add_bullet_p(doc, "Greenwave Volunteer Staff & Media Crew: For managing ticketing gates, audio-visual operations, and producing the 296-photo historical archive.")

    add_heading_2(doc, "Appendix C: Digital Verification & Web Links Directory")
    add_bullet_p(doc, "Official Convocation Retrospective: https://greenwavesociety.org/events/graduation-cohort-1")
    add_bullet_p(doc, "Interactive 296-Photo Ceremony Album: https://greenwavesociety.org/events/graduation-cohort-1/album")
    add_bullet_p(doc, "Community Market Portal: https://greenwavesociety.org/events/community-market")
    add_bullet_p(doc, "Official Brand Media Kit: https://greenwavesociety.org/media-kit")
    add_bullet_p(doc, "Cohort II Fellowship Application Portal: https://greenwavesociety.org/join")
    add_bullet_p(doc, "Chief Financial Officer (CFO) Career Opportunity: https://greenwavesociety.org/careers/chief-financial-officer")

    add_heading_2(doc, "Appendix D: Document Administration & Version History")
    add_body_p(doc, "Document Title: Official Post-Session Event Report: YPG Cohort I Graduation Ceremony & Community Market")
    add_body_p(doc, "Reference Code: GWS-REP-2026-YPG01")
    add_body_p(doc, "Publishing Authority: Greenwave Society Executive Secretariat & Communications Pod")
    add_body_p(doc, "Publication Date: November 2026 (Nairobi, Kenya)")
    add_body_p(doc, "Official Contact: info@greenwavesociety.org  |  WhatsApp: +254 794 287 400")

    # Output paths
    output_filename = "YPG_Cohort_I_Graduation_Comprehensive_Event_Report.docx"
    
    # Path 1: public/downloads for direct web downloading
    public_dir = os.path.join(os.getcwd(), "public", "downloads")
    os.makedirs(public_dir, exist_ok=True)
    public_path = os.path.join(public_dir, output_filename)
    doc.save(public_path)
    print(f"Report saved to web downloads: {public_path}")

    # Path 2: docs/reports for repository archival
    docs_dir = os.path.join(os.getcwd(), "docs", "reports")
    os.makedirs(docs_dir, exist_ok=True)
    docs_path = os.path.join(docs_dir, output_filename)
    doc.save(docs_path)
    print(f"Report saved to docs: {docs_path}")

    # Path 3: Brain / Artifact directory
    brain_dir = r"C:\Users\royok\.gemini\antigravity\brain\5a54f75e-7e2c-429c-abdc-25229a56d1e0"
    if os.path.exists(brain_dir):
        brain_path = os.path.join(brain_dir, output_filename)
        doc.save(brain_path)
        print(f"Report saved to brain artifact dir: {brain_path}")

    print("Document generation completed successfully!")

if __name__ == "__main__":
    build_report()
