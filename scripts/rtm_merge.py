"""Merge cover PDF + body PDF into final deliverable."""
import os
from pypdf import PdfReader, PdfWriter

A4_W, A4_H = 595.28, 841.89  # A4 in points


def normalize_page_to_a4(page):
    """Scale a page to A4 if its dimensions don't match (tight tolerance)."""
    box = page.mediabox
    w, h = float(box.width), float(box.height)
    if abs(w - A4_W) > 0.5 or abs(h - A4_H) > 0.5:
        page.scale_to(A4_W, A4_H)
    return page


def merge(cover_pdf, body_pdf, output_pdf):
    writer = PdfWriter()
    cover_page = PdfReader(cover_pdf).pages[0]
    writer.add_page(normalize_page_to_a4(cover_page))
    for page in PdfReader(body_pdf).pages:
        writer.add_page(normalize_page_to_a4(page))
    writer.add_metadata({
        '/Title': 'Read The Market - Practitioner Knowledge Base',
        '/Author': 'Z.ai',
        '/Creator': 'Z.ai',
        '/Subject': 'RTM (Read The Market) Phase Zero Research Deliverable',
    })
    os.makedirs(os.path.dirname(output_pdf), exist_ok=True)
    with open(output_pdf, 'wb') as f:
        writer.write(f)
    print(f'Merged: {output_pdf}')


if __name__ == '__main__':
    merge(
        '/home/z/my-project/scripts/rtm_cover.pdf',
        '/home/z/my-project/scripts/rtm_body.pdf',
        '/home/z/my-project/download/RTM_Knowledge_Base.pdf',
    )
