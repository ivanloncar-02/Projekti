# Email Templates Documentation

This document describes the email templates that should be used for application approval and rejection notifications.

## Overview

When an employer approves or rejects a student's internship application, the system should automatically send an email notification to the student using predefined templates.

## Template Types

### 1. Approval Email Template

**Trigger:** When employer clicks "Approve" on an application
**Endpoint:** `POST /api/applications/:id/approve`
**Recipient:** Student who applied

#### Subject Line
```
Čestitamo! Vaša prijava za praksu je prihvaćena
```

#### Email Body (Croatian)
```
Poštovani/a {{studentName}},

Čestitamo! Vaša prijava za poziciju {{internshipTitle}} u tvrtki {{companyName}} je prihvaćena.

Sljedeći koraci:
• Kontaktirati ćemo vas u sljedećih nekoliko dana radi dogovora o početku prakse
• Molimo pripremite potrebnu dokumentaciju (ugovor o praksi, potvrda s fakulteta)
• U međuvremenu, možete nas kontaktirati putem navedenih kontakt podataka

Informacije o praksi:
• Pozicija: {{internshipTitle}}
• Tvrtka: {{companyName}}
• Trajanje: {{duration}} mjeseci
• Početak: {{startDate}}

Kontakt informacije:
• Email: {{contactEmail}}
• Telefon: {{contactPhone}}
• Kontakt osoba: {{contactPerson}}

Vidimo se uskoro!

S poštovanjem,
Tim {{companyName}}
```

#### Template Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `studentName` | string | Full name of the student | "Ana Marić" |
| `internshipTitle` | string | Title of the internship | "Frontend Developer Praksa" |
| `companyName` | string | Name of the company | "Tech Solutions d.o.o." |
| `duration` | number | Duration in months | 3 |
| `startDate` | date | Start date of internship | "01.09.2024" |
| `contactEmail` | string | Company contact email | "hr@techsolutions.hr" |
| `contactPhone` | string | Company contact phone | "+385 1 234 5678" |
| `contactPerson` | string | Name of contact person | "Marko Horvat" |

---

### 2. Rejection Email Template

**Trigger:** When employer clicks "Reject" on an application
**Endpoint:** `POST /api/applications/:id/reject`
**Recipient:** Student who applied

#### Subject Line
```
Ažuriranje statusa vaše prijave za praksu
```

#### Email Body (Croatian)
```
Poštovani/a {{studentName}},

Hvala vam što ste pokazali interes za poziciju {{internshipTitle}} u tvrtki {{companyName}}.

Nakon pažljivog razmatranja svih prijava, odlučili smo nastaviti s drugim kandidatima čiji profil bolje odgovara trenutnim potrebama tvrtke i specifičnim zahtjevima pozicije.

Informacije o praksi:
• Pozicija: {{internshipTitle}}
• Tvrtka: {{companyName}}

Cijenimo vaš interes i trud uložen u prijavu. Vaše vještine i iskustvo su impresivni, i ohrabrujemo vas da nastavite s prijavljivanjem na druge pozicije koje odgovaraju vašim kompetencijama i interesima.

Našu platformu možete koristiti za pretraživanje novih prilika koje možda bolje odgovaraju vašem profilu.

Želimo vam puno uspjeha u budućem profesionalnom razvoju i akademskoj karijeri.

S poštovanjem,
Tim {{companyName}}
```

#### Template Variables

| Variable | Type | Description | Example |
|----------|------|-------------|---------|
| `studentName` | string | Full name of the student | "Ana Marić" |
| `internshipTitle` | string | Title of the internship | "Frontend Developer Praksa" |
| `companyName` | string | Name of the company | "Tech Solutions d.o.o." |

---

## Implementation Guide for Backend

### 1. Email Service Setup

Create an email service that handles template rendering and sending:

```typescript
// backend/src/modules/email/email.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  constructor(private configService: ConfigService) {}

  async sendApprovalEmail(data: EmailTemplateData): Promise<void> {
    const subject = 'Čestitamo! Vaša prijava za praksu je prihvaćena';
    const body = this.renderApprovalTemplate(data);

    await this.sendEmail({
      to: data.studentEmail,
      subject,
      html: body,
    });
  }

  async sendRejectionEmail(data: EmailTemplateData): Promise<void> {
    const subject = 'Ažuriranje statusa vaše prijave za praksu';
    const body = this.renderRejectionTemplate(data);

    await this.sendEmail({
      to: data.studentEmail,
      subject,
      html: body,
    });
  }

  private renderApprovalTemplate(data: EmailTemplateData): string {
    // Implement template rendering logic
    return `
      <h2>Poštovani/a ${data.studentName},</h2>
      <p>Čestitamo! Vaša prijava za poziciju <strong>${data.internshipTitle}</strong>
      u tvrtki <strong>${data.companyName}</strong> je prihvaćena.</p>
      <!-- ... rest of template ... -->
    `;
  }

  private renderRejectionTemplate(data: EmailTemplateData): string {
    // Implement template rendering logic
    return `
      <h2>Poštovani/a ${data.studentName},</h2>
      <p>Hvala vam što ste pokazali interes za poziciju <strong>${data.internshipTitle}</strong>
      u tvrtki <strong>${data.companyName}</strong>.</p>
      <!-- ... rest of template ... -->
    `;
  }

  private async sendEmail(options: EmailOptions): Promise<void> {
    // Use nodemailer, sendgrid, or any email service
    // Implementation depends on your email provider
  }
}
```

### 2. Integration with Application Controller

```typescript
// backend/src/modules/applications/applications.controller.ts
@Post(':id/approve')
async approve(@Param('id') id: string, @CurrentUser() user: User) {
  const application = await this.applicationsService.approve(id, user.id);

  // Send approval email
  await this.emailService.sendApprovalEmail({
    studentName: `${application.student.user.firstName} ${application.student.user.lastName}`,
    studentEmail: application.student.user.email,
    internshipTitle: application.internship.title,
    companyName: application.internship.company.name,
    // ... other data
  });

  return application;
}

@Post(':id/reject')
async reject(@Param('id') id: string, @CurrentUser() user: User) {
  const application = await this.applicationsService.reject(id, user.id);

  // Send rejection email
  await this.emailService.sendRejectionEmail({
    studentName: `${application.student.user.firstName} ${application.student.user.lastName}`,
    studentEmail: application.student.user.email,
    internshipTitle: application.internship.title,
    companyName: application.internship.company.name,
  });

  return application;
}
```

### 3. Environment Variables

Add these to your `.env` file:

```bash
# Email Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=noreply@internship-platform.hr
```

## Testing

### Manual Testing

1. Create a test application
2. Approve it via the employer dashboard
3. Check the student's email inbox
4. Verify the email content matches the template

### Automated Testing

```typescript
describe('EmailService', () => {
  it('should send approval email with correct data', async () => {
    const data = {
      studentName: 'Ana Marić',
      studentEmail: 'ana.maric@example.com',
      internshipTitle: 'Frontend Developer',
      companyName: 'Tech Solutions',
    };

    await emailService.sendApprovalEmail(data);

    // Assert email was sent
    expect(mockEmailProvider.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'ana.maric@example.com',
        subject: expect.stringContaining('prihvaćena'),
      })
    );
  });
});
```

## Best Practices

1. **HTML Templates**: Use proper HTML formatting for better email client compatibility
2. **Plain Text Alternative**: Always provide a plain text version of the email
3. **Responsive Design**: Ensure emails look good on mobile devices
4. **Error Handling**: Log email failures but don't block the approval/rejection process
5. **Rate Limiting**: Implement rate limiting to prevent abuse
6. **Unsubscribe Link**: Consider adding an unsubscribe option for automated emails
7. **Personalization**: Use the student's name and other personal details appropriately

## Future Enhancements

- [ ] Add email preview functionality in admin panel
- [ ] Allow customization of email templates per company
- [ ] Support for multiple languages
- [ ] Email delivery tracking and analytics
- [ ] Scheduled email reminders
- [ ] Email template versioning

---

**Last Updated:** January 2026
**Maintained By:** Development Team
