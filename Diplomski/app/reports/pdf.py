from flask import make_response, request, session
from app.reports import reports_bp
from app.firebase_db import (
    get_audit_logs, get_audit_logs_by_user,
    count_devices_by_status, get_all_devices,
)


def _build_pdf(logs: list, devices: list = None,
               conf_count: int = 0, unconf_count: int = 0,
               title: str = "Izvještaj — Network Automation Manager",
               filename: str = "izvjestaj.pdf"):
    from io import BytesIO
    from reportlab.lib.pagesizes import A4
    from reportlab.lib import colors
    from reportlab.lib.styles import getSampleStyleSheet
    from reportlab.lib.units import cm
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle

    buf    = BytesIO()
    doc    = SimpleDocTemplate(buf, pagesize=A4,
                               leftMargin=2*cm, rightMargin=2*cm,
                               topMargin=2*cm, bottomMargin=2*cm)
    styles = getSampleStyleSheet()
    story  = []

    story.append(Paragraph(title, styles['Title']))
    story.append(Spacer(1, 0.4*cm))

    if devices is not None:
        story.append(Paragraph("Statistike uređaja", styles['Heading2']))
        stats_tbl = Table(
            [['Konfiguriranih', 'Nekonfiguriranih', 'Ukupno'],
             [str(conf_count), str(unconf_count), str(conf_count + unconf_count)]],
            colWidths=[5*cm, 5*cm, 5*cm]
        )
        stats_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1a5cff')),
            ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
            ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
            ('ALIGN',      (0,0), (-1,-1), 'CENTER'),
            ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#dde3ee')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#f0f4ff'), colors.white]),
            ('FONTSIZE',   (0,0), (-1,-1), 10),
            ('PADDING',    (0,0), (-1,-1), 6),
        ]))
        story.append(stats_tbl)
        story.append(Spacer(1, 0.5*cm))

        story.append(Paragraph("Popis uređaja", styles['Heading2']))
        dev_rows = [['IP adresa', 'Hostname', 'Tip', 'Status']]
        for d in devices:
            dev_rows.append([
                d.get('ip_address', '—'), d.get('hostname', '—'),
                d.get('device_type', '—'), d.get('status', '—'),
            ])
        dev_tbl = Table(dev_rows, colWidths=[4*cm, 4.5*cm, 4.5*cm, 3.5*cm])
        dev_tbl.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e2240')),
            ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
            ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
            ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#dde3ee')),
            ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#fafbff'), colors.white]),
            ('FONTSIZE',   (0,0), (-1,-1), 9),
            ('PADDING',    (0,0), (-1,-1), 5),
        ]))
        story.append(dev_tbl)
        story.append(Spacer(1, 0.5*cm))

    story.append(Paragraph(f"Evidencija aktivnosti ({len(logs)} zapisa)", styles['Heading2']))
    log_rows = [['Vrijeme', 'Korisnik', 'Akcija', 'Status']]
    for log in logs:
        log_rows.append([
            log.get('timestamp_str', '—'),
            log.get('user_email', '—'),
            log.get('action', '—')[:60],
            log.get('status', '—'),
        ])
    log_tbl = Table(log_rows, colWidths=[3.5*cm, 4*cm, 7.5*cm, 2.5*cm])
    log_tbl.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor('#1e2240')),
        ('TEXTCOLOR',  (0,0), (-1,0), colors.white),
        ('FONTNAME',   (0,0), (-1,0), 'Helvetica-Bold'),
        ('GRID',       (0,0), (-1,-1), 0.5, colors.HexColor('#dde3ee')),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.HexColor('#fafbff'), colors.white]),
        ('FONTSIZE',   (0,0), (-1,-1), 8),
        ('PADDING',    (0,0), (-1,-1), 4),
    ]))
    story.append(log_tbl)

    doc.build(story)
    buf.seek(0)

    response = make_response(buf.read())
    response.headers['Content-Type']        = 'application/pdf'
    response.headers['Content-Disposition'] = f'attachment; filename={filename}'
    return response


@reports_bp.route('/pdf')
def export_pdf():
    is_admin     = session.get('user_role') == 'admin'
    user_email   = session.get('user_email')
    filter_email = request.args.get('email', '').strip()

    if is_admin:
        if filter_email:
            logs         = get_audit_logs_by_user(filter_email, limit=500)
            devices      = None
            title        = f"Izvještaj aktivnosti — {filter_email}"
            filename     = f"izvjestaj_{filter_email.split('@')[0]}.pdf"
            conf_count   = unconf_count = 0
        else:
            logs         = get_audit_logs(limit=500)
            devices      = get_all_devices()
            conf_count   = count_devices_by_status('konfiguriran')
            unconf_count = count_devices_by_status('nekonfiguriran')
            title        = "Izvještaj — Network Automation Manager"
            filename     = "izvjestaj_svi.pdf"
    else:
        logs         = get_audit_logs_by_user(user_email, limit=500)
        devices      = None
        conf_count   = unconf_count = 0
        title        = f"Moj izvještaj aktivnosti — {user_email}"
        filename     = f"izvjestaj_{user_email.split('@')[0]}.pdf"

    return _build_pdf(logs=logs, devices=devices,
                      conf_count=conf_count, unconf_count=unconf_count,
                      title=title, filename=filename)
