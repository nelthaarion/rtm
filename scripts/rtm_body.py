"""
RTM Knowledge Base - Body PDF generator (ReportLab).

Generates the body of the RTM Knowledge Base PDF (chapters 1-18).
Cover is rendered separately via html2poster.js and merged via pypdf.
"""

import os
import sys
import hashlib
import platform
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import inch, mm
from reportlab.lib import colors
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    Image, KeepTogether, CondPageBreak, HRFlowable, Flowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# ──────────────────────────────────────────────────────────────────────────
# FONT REGISTRATION
# ──────────────────────────────────────────────────────────────────────────
_IS_MAC = platform.system() == 'Darwin'
if _IS_MAC:
    FONT_DIR = os.path.expanduser('~/.openclaw/workspace/fonts')
else:
    FONT_DIR = '/usr/share/fonts'

pdfmetrics.registerFont(TTFont('NotoSerifSC', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Regular.ttf'))
pdfmetrics.registerFont(TTFont('NotoSerifSC-Bold', f'{FONT_DIR}/truetype/noto-serif-sc/NotoSerifSC-Bold.ttf'))
pdfmetrics.registerFont(TTFont('SarasaMonoSC', f'{FONT_DIR}/truetype/chinese/SarasaMonoSC-Regular.ttf'))

pdfmetrics.registerFont(TTFont('FreeSerif', f'{FONT_DIR}/truetype/freefont/FreeSerif.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Bold', f'{FONT_DIR}/truetype/freefont/FreeSerifBold.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-Italic', f'{FONT_DIR}/truetype/freefont/FreeSerifItalic.ttf'))
pdfmetrics.registerFont(TTFont('FreeSerif-BoldItalic', f'{FONT_DIR}/truetype/freefont/FreeSerifBoldItalic.ttf'))
pdfmetrics.registerFont(TTFont('DejaVuSans', f'{FONT_DIR}/truetype/dejavu/DejaVuSansMono.ttf'))

registerFontFamily('NotoSerifSC', normal='NotoSerifSC', bold='NotoSerifSC-Bold')
registerFontFamily('FreeSerif', normal='FreeSerif', bold='FreeSerif-Bold',
                   italic='FreeSerif-Italic', boldItalic='FreeSerif-BoldItalic')
registerFontFamily('DejaVuSans', normal='DejaVuSans', bold='DejaVuSans')
registerFontFamily('SarasaMonoSC', normal='SarasaMonoSC', bold='SarasaMonoSC')

# Install font fallback for mixed CJK/Latin (safe no-op for pure English)
PDF_SKILL_DIR = '/home/z/my-project/skills/pdf'
sys.path.insert(0, os.path.join(PDF_SKILL_DIR, 'scripts'))
try:
    from pdf import install_font_fallback
    install_font_fallback()
except Exception:
    pass

# ──────────────────────────────────────────────────────────────────────────
# CASCADE PALETTE (auto-generated)
# ──────────────────────────────────────────────────────────────────────────
PAGE_BG       = colors.HexColor('#f0f0ef')
SECTION_BG    = colors.HexColor('#f1f1ef')
CARD_BG       = colors.HexColor('#edece9')
TABLE_STRIPE  = colors.HexColor('#f4f4f3')
HEADER_FILL   = colors.HexColor('#534c34')
COVER_BLOCK   = colors.HexColor('#7b7460')
BORDER        = colors.HexColor('#c1bba7')
ICON          = colors.HexColor('#a08943')
ACCENT        = colors.HexColor('#8b7226')
ACCENT_2      = colors.HexColor('#4eadcd')
TEXT_PRIMARY  = colors.HexColor('#1d1c1a')
TEXT_MUTED    = colors.HexColor('#85827b')
SEM_SUCCESS   = colors.HexColor('#3d8154')
SEM_WARNING   = colors.HexColor('#887246')
SEM_ERROR     = colors.HexColor('#aa4b42')
SEM_INFO      = colors.HexColor('#5d7d9d')

TABLE_HEADER_COLOR = HEADER_FILL
TABLE_HEADER_TEXT  = colors.white
TABLE_ROW_EVEN     = colors.white
TABLE_ROW_ODD      = TABLE_STRIPE

# ──────────────────────────────────────────────────────────────────────────
# PAGE GEOMETRY
# ──────────────────────────────────────────────────────────────────────────
PAGE_W, PAGE_H = A4
LEFT_MARGIN   = 0.85 * inch
RIGHT_MARGIN  = 0.85 * inch
TOP_MARGIN    = 0.85 * inch
BOTTOM_MARGIN = 0.85 * inch
CONTENT_W = PAGE_W - LEFT_MARGIN - RIGHT_MARGIN

# ──────────────────────────────────────────────────────────────────────────
# STYLES
# ──────────────────────────────────────────────────────────────────────────
H1 = ParagraphStyle(
    name='H1', fontName='FreeSerif-Bold', fontSize=22, leading=28,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    spaceBefore=18, spaceAfter=12,
)
H1_ACCENT = ParagraphStyle(
    name='H1Accent', fontName='FreeSerif-Bold', fontSize=10, leading=14,
    textColor=ACCENT, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=2,
)
H2 = ParagraphStyle(
    name='H2', fontName='FreeSerif-Bold', fontSize=15, leading=21,
    textColor=HEADER_FILL, alignment=TA_LEFT,
    spaceBefore=16, spaceAfter=8,
)
H3 = ParagraphStyle(
    name='H3', fontName='FreeSerif-Bold', fontSize=12, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    spaceBefore=12, spaceAfter=6,
)
H4 = ParagraphStyle(
    name='H4', fontName='FreeSerif-BoldItalic', fontSize=11, leading=15,
    textColor=ACCENT, alignment=TA_LEFT,
    spaceBefore=10, spaceAfter=4,
)
BODY = ParagraphStyle(
    name='Body', fontName='FreeSerif', fontSize=10.5, leading=17,
    textColor=TEXT_PRIMARY, alignment=TA_JUSTIFY,
    spaceBefore=0, spaceAfter=8,
    firstLineIndent=0,
)
BODY_LEAD = ParagraphStyle(
    name='BodyLead', fontName='FreeSerif-Italic', fontSize=11.5, leading=18,
    textColor=HEADER_FILL, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=10,
)
BULLET = ParagraphStyle(
    name='Bullet', fontName='FreeSerif', fontSize=10.5, leading=16,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    leftIndent=18, bulletIndent=4,
    spaceBefore=2, spaceAfter=2,
)
NUMBERED = ParagraphStyle(
    name='Numbered', fontName='FreeSerif', fontSize=10.5, leading=16,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    leftIndent=22, bulletIndent=4,
    spaceBefore=2, spaceAfter=2,
)
CAPTION = ParagraphStyle(
    name='Caption', fontName='FreeSerif-Italic', fontSize=9, leading=12,
    textColor=TEXT_MUTED, alignment=TA_CENTER,
    spaceBefore=4, spaceAfter=12,
)
MONO = ParagraphStyle(
    name='Mono', fontName='SarasaMonoSC', fontSize=8.5, leading=12,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    leftIndent=8, rightIndent=8,
    spaceBefore=4, spaceAfter=8,
)
CALLOUT_TITLE = ParagraphStyle(
    name='CalloutTitle', fontName='FreeSerif-Bold', fontSize=10.5, leading=14,
    textColor=ACCENT, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=4,
)
CALLOUT_BODY = ParagraphStyle(
    name='CalloutBody', fontName='FreeSerif', fontSize=10, leading=15,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
    spaceBefore=0, spaceAfter=0,
)
TBL_HEADER = ParagraphStyle(
    name='TblHeader', fontName='FreeSerif-Bold', fontSize=10, leading=13,
    textColor=colors.white, alignment=TA_LEFT,
)
TBL_HEADER_C = ParagraphStyle(
    name='TblHeaderC', fontName='FreeSerif-Bold', fontSize=10, leading=13,
    textColor=colors.white, alignment=TA_CENTER,
)
TBL_CELL = ParagraphStyle(
    name='TblCell', fontName='FreeSerif', fontSize=9.5, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
)
TBL_CELL_C = ParagraphStyle(
    name='TblCellC', fontName='FreeSerif', fontSize=9.5, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_CENTER,
)
TBL_CELL_BOLD = ParagraphStyle(
    name='TblCellBold', fontName='FreeSerif-Bold', fontSize=9.5, leading=13,
    textColor=TEXT_PRIMARY, alignment=TA_LEFT,
)
TOC_L0 = ParagraphStyle(
    name='TOC0', fontName='FreeSerif-Bold', fontSize=11, leading=20,
    textColor=TEXT_PRIMARY, leftIndent=0, alignment=TA_LEFT,
)
TOC_L1 = ParagraphStyle(
    name='TOC1', fontName='FreeSerif', fontSize=10, leading=16,
    textColor=TEXT_MUTED, leftIndent=20, alignment=TA_LEFT,
)

# ──────────────────────────────────────────────────────────────────────────
# TOC DOCUMENT TEMPLATE
# ──────────────────────────────────────────────────────────────────────────
class TocDocTemplate(SimpleDocTemplate):
    def afterFlowable(self, flowable):
        if hasattr(flowable, 'bookmark_name'):
            level = getattr(flowable, 'bookmark_level', 0)
            text = getattr(flowable, 'bookmark_text', '')
            key = getattr(flowable, 'bookmark_key', '')
            self.notify('TOCEntry', (level, text, self.page, key))


def add_heading(text, style, level=0):
    key = 'h_%s' % hashlib.md5(text.encode()).hexdigest()[:8]
    p = Paragraph('<a name="%s"/>%s' % (key, text), style)
    p.bookmark_name = key
    p.bookmark_level = level
    p.bookmark_text = text
    p.bookmark_key = key
    return p


# Orphan prevention
AVAILABLE_H = PAGE_H - TOP_MARGIN - BOTTOM_MARGIN
H1_ORPHAN_THRESHOLD = AVAILABLE_H * 0.18


def add_major_section(text, style=H1, level=0):
    return [
        CondPageBreak(H1_ORPHAN_THRESHOLD),
        add_heading(text, style, level=level),
    ]


# ──────────────────────────────────────────────────────────────────────────
# COMPONENT HELPERS
# ──────────────────────────────────────────────────────────────────────────
def callout(title, body_lines, accent_color=ACCENT, bg_color=CARD_BG):
    """A callout box with a colored left border."""
    inner = [Paragraph(title, CALLOUT_TITLE)]
    if isinstance(body_lines, str):
        body_lines = [body_lines]
    for line in body_lines:
        inner.append(Paragraph(line, CALLOUT_BODY))
        inner.append(Spacer(1, 3))
    if inner and isinstance(inner[-1], Spacer):
        inner.pop()
    t = Table([[inner]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), bg_color),
        ('LINEBEFORE', (0, 0), (0, -1), 3, accent_color),
        ('LEFTPADDING', (0, 0), (-1, -1), 14),
        ('RIGHTPADDING', (0, 0), (-1, -1), 14),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
    ]))
    return t


def bullet_list(items, style=BULLET):
    """Render a list of bullet items."""
    out = []
    for it in items:
        out.append(Paragraph('• ' + it, style))
    return out


def numbered_list(items, style=NUMBERED):
    out = []
    for i, it in enumerate(items, 1):
        out.append(Paragraph(f'<b>{i}.</b>  {it}', style))
    return out


def mono_block(lines):
    """Render a monospace ASCII schematic block as a splittable paragraph
    with a subtle background.

    A single-row Table cannot split across pages and will raise LayoutError
    if the content exceeds the frame height. We therefore render the block
    as a styled Paragraph with monospace font and a left accent border via
    a thin Table ONLY when content is short; otherwise return the Paragraph
    alone so it can paginate naturally.
    """
    text = '<br/>'.join(lines)
    p = Paragraph(text, MONO)
    # Estimate height: ~12pt per line. If short, wrap in a styled table.
    est_h = len(lines) * 12 + 20
    if est_h > 600:
        # Too tall for a single Table cell - return the Paragraph alone.
        return p
    t = Table([[p]], colWidths=[CONTENT_W])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), SECTION_BG),
        ('BOX', (0, 0), (-1, -1), 0.5, BORDER),
        ('LEFTPADDING', (0, 0), (-1, -1), 12),
        ('RIGHTPADDING', (0, 0), (-1, -1), 12),
        ('TOPPADDING', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 10),
    ]))
    return t


def std_table(data, col_ratios, caption_text=None, header_centered=True):
    """Build a standard styled table with header row."""
    col_widths = [r * CONTENT_W for r in col_ratios]
    t = Table(data, colWidths=col_widths, hAlign='CENTER', repeatRows=1)
    style = [
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), TABLE_HEADER_TEXT),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('LEFTPADDING', (0, 0), (-1, -1), 7),
        ('RIGHTPADDING', (0, 0), (-1, -1), 7),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('GRID', (0, 0), (-1, -1), 0.3, BORDER),
    ]
    for i in range(1, len(data)):
        if i % 2 == 1:
            style.append(('BACKGROUND', (0, i), (-1, i), TABLE_ROW_EVEN))
        else:
            style.append(('BACKGROUND', (0, i), (-1, i), TABLE_ROW_ODD))
    t.setStyle(TableStyle(style))
    out = [Spacer(1, 8), t]
    if caption_text:
        out.append(Spacer(1, 4))
        out.append(Paragraph(caption_text, CAPTION))
    else:
        out.append(Spacer(1, 14))
    return out


def hr(thickness=0.6, color=BORDER, before=4, after=8):
    return HRFlowable(width="100%", thickness=thickness, color=color,
                      spaceBefore=before, spaceAfter=after)


def _make_concept_entry_helper(h):
    """Create a closure that renders a 10-field concept entry block."""
    def _ce(name, fields):
        P, S, B = h['Paragraph'], h['Spacer'], h['BODY']
        H3 = h['H3']
        out = [P(name, H3)]
        for fname, fbody in fields:
            out.append(P(f'<b>{fname}.</b>  {fbody}', B))
        out.append(S(1, 6))
        return out
    return _ce


# ──────────────────────────────────────────────────────────────────────────
# HEADER / FOOTER
# ──────────────────────────────────────────────────────────────────────────
def on_page(canvas, doc):
    canvas.saveState()
    # Header: title left, accent rule, page number right
    canvas.setFont('FreeSerif-Italic', 8.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(LEFT_MARGIN, PAGE_H - 0.55 * inch,
                      'Read The Market  ·  Practitioner Knowledge Base')
    canvas.drawRightString(PAGE_W - RIGHT_MARGIN, PAGE_H - 0.55 * inch,
                           'Phase Zero / RTM KB')
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(LEFT_MARGIN, PAGE_H - 0.62 * inch,
                PAGE_W - RIGHT_MARGIN, PAGE_H - 0.62 * inch)
    # Accent dot on header rule
    canvas.setFillColor(ACCENT)
    canvas.circle(LEFT_MARGIN, PAGE_H - 0.62 * inch, 1.4, fill=1, stroke=0)

    # Footer: author left, page number right
    canvas.setStrokeColor(BORDER)
    canvas.setLineWidth(0.4)
    canvas.line(LEFT_MARGIN, 0.55 * inch,
                PAGE_W - RIGHT_MARGIN, 0.55 * inch)
    canvas.setFont('FreeSerif-Italic', 8.5)
    canvas.setFillColor(TEXT_MUTED)
    canvas.drawString(LEFT_MARGIN, 0.4 * inch, 'Z.ai  ·  RTM Research Series')
    canvas.setFont('FreeSerif', 8.5)
    canvas.drawRightString(PAGE_W - RIGHT_MARGIN, 0.4 * inch,
                           f'— {doc.page} —')
    canvas.restoreState()


# ──────────────────────────────────────────────────────────────────────────
# BUILD STORY
# ──────────────────────────────────────────────────────────────────────────
def build_story():
    story = []

    # ── TABLE OF CONTENTS ────────────────────────────────────────────────
    toc = TableOfContents()
    toc.levelStyles = [TOC_L0, TOC_L1]
    story.append(Paragraph('<b>Table of Contents</b>', H1))
    story.append(hr(thickness=1.2, color=ACCENT, before=2, after=14))
    story.append(toc)
    story.append(PageBreak())

    # Import chapter builders
    from rtm_chapters import (
        ch1_foreword, ch2_first_principles, ch3_schema, ch4_glossary,
        ch5_structure,
    )
    from rtm_chapters2 import (
        ch6_zones, ch7_patterns, ch8_advanced_patterns,
        ch9_liquidity, ch10_mtf, ch11_knowledge_graph, ch12_failures,
        ch13_chart_study, ch14_reasoning_templates, ch15_reasoning_cases,
        ch16_probability_matrix, ch17_mistakes, ch18_bridge,
    )

    chapter_builders = [
        ('Chapter 1 — Foreword and How To Read This Document', ch1_foreword),
        ('Chapter 2 — The First Principles of RTM', ch2_first_principles),
        ('Chapter 3 — The Concept Entry Schema', ch3_schema),
        ('Chapter 4 — RTM Glossary', ch4_glossary),
        ('Chapter 5 — Market Structure Concepts', ch5_structure),
        ('Chapter 6 — Zone Concepts', ch6_zones),
        ('Chapter 7 — Pattern Concepts', ch7_patterns),
        ('Chapter 8 — Advanced Pattern Concepts', ch8_advanced_patterns),
        ('Chapter 9 — Liquidity Concepts', ch9_liquidity),
        ('Chapter 10 — Multi-Timeframe Context and Curve', ch10_mtf),
        ('Chapter 11 — The RTM Knowledge Graph', ch11_knowledge_graph),
        ('Chapter 12 — Failure Catalog', ch12_failures),
        ('Chapter 13 — Chart Study Framework', ch13_chart_study),
        ('Chapter 14 — Reasoning Dataset Templates', ch14_reasoning_templates),
        ('Chapter 15 — Reasoning Dataset: Worked Examples', ch15_reasoning_cases),
        ('Chapter 16 — Probability Contribution Matrix', ch16_probability_matrix),
        ('Chapter 17 — Common Mistakes and Anti-Patterns', ch17_mistakes),
        ('Chapter 18 — Bridge to the Trading Engine', ch18_bridge),
    ]

    helpers = {
        'add_heading': add_heading, 'add_major_section': add_major_section,
        'Paragraph': Paragraph, 'Spacer': Spacer, 'PageBreak': PageBreak,
        'CondPageBreak': CondPageBreak, 'KeepTogether': KeepTogether,
        'callout': callout, 'bullet_list': bullet_list,
        'numbered_list': numbered_list, 'mono_block': mono_block,
        'std_table': std_table, 'hr': hr,
        'H1': H1, 'H1_ACCENT': H1_ACCENT, 'H2': H2, 'H3': H3, 'H4': H4,
        'BODY': BODY, 'BODY_LEAD': BODY_LEAD, 'BULLET': BULLET,
        'NUMBERED': NUMBERED, 'CAPTION': CAPTION, 'MONO': MONO,
        'TBL_HEADER': TBL_HEADER, 'TBL_HEADER_C': TBL_HEADER_C,
        'TBL_CELL': TBL_CELL, 'TBL_CELL_C': TBL_CELL_C, 'TBL_CELL_BOLD': TBL_CELL_BOLD,
        'CONTENT_W': CONTENT_W,
        'ACCENT': ACCENT, 'HEADER_FILL': HEADER_FILL, 'CARD_BG': CARD_BG,
        'BORDER': BORDER, 'TEXT_PRIMARY': TEXT_PRIMARY, 'TEXT_MUTED': TEXT_MUTED,
        'SEM_SUCCESS': SEM_SUCCESS, 'SEM_WARNING': SEM_WARNING,
        'SEM_ERROR': SEM_ERROR, 'SEM_INFO': SEM_INFO,
        'Image': Image,
    }
    helpers['_concept_entry'] = _make_concept_entry_helper(helpers)

    for title, builder in chapter_builders:
        story.extend(add_major_section(title, H1, level=0))
        story.extend(builder(helpers))

    return story


def main():
    out_path = '/home/z/my-project/scripts/rtm_body.pdf'
    doc = TocDocTemplate(
        out_path,
        pagesize=A4,
        leftMargin=LEFT_MARGIN, rightMargin=RIGHT_MARGIN,
        topMargin=TOP_MARGIN, bottomMargin=BOTTOM_MARGIN,
        title='Read The Market - Practitioner Knowledge Base',
        author='Z.ai',
        creator='Z.ai',
        subject='RTM (Read The Market) Phase Zero Research Deliverable',
    )
    story = build_story()
    doc.multiBuild(story, onFirstPage=on_page, onLaterPages=on_page)
    print(f'Body PDF written: {out_path}')


if __name__ == '__main__':
    main()
