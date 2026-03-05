/**
 * Email Template Types for Application Approval/Rejection
 *
 * These interfaces define the structure of email templates that the backend
 * will use to send notifications to students when their applications are
 * approved or rejected.
 */

export interface EmailTemplateData {
  studentName: string;
  studentEmail: string;
  internshipTitle: string;
  companyName: string;
  internshipId: string;
  applicationId: string;
}

export interface ApprovalEmailTemplate {
  subject: string;
  body: string;
  data: EmailTemplateData;
}

export interface RejectionEmailTemplate {
  subject: string;
  body: string;
  data: EmailTemplateData;
}

/**
 * Approval Email Template
 *
 * Subject: "Congratulations! Your internship application has been approved"
 *
 * Template Variables:
 * - {{studentName}}: Full name of the student
 * - {{internshipTitle}}: Title of the internship position
 * - {{companyName}}: Name of the company
 * - {{nextSteps}}: Information about what to do next
 * - {{contactEmail}}: Company contact email
 * - {{contactPhone}}: Company contact phone
 *
 * Example Body:
 * ```
 * Poštovani/a {{studentName}},
 *
 * Čestitamo! Vaša prijava za poziciju {{internshipTitle}} u tvrtki {{companyName}}
 * je prihvaćena.
 *
 * Sljedeći koraci:
 * - Kontaktirati ćemo vas u sljedećih nekoliko dana radi dogovora o početku prakse
 * - Molimo pripremite potrebnu dokumentaciju
 * - U međuvremenu, možete nas kontaktirati putem emaila ili telefona
 *
 * Kontakt informacije:
 * Email: {{contactEmail}}
 * Telefon: {{contactPhone}}
 *
 * Vidimo se uskoro!
 *
 * S poštovanjem,
 * {{companyName}}
 * ```
 */
export const APPROVAL_TEMPLATE: Partial<ApprovalEmailTemplate> = {
  subject: 'Čestitamo! Vaša prijava za praksu je prihvaćena',
};

/**
 * Rejection Email Template
 *
 * Subject: "Update on your internship application"
 *
 * Template Variables:
 * - {{studentName}}: Full name of the student
 * - {{internshipTitle}}: Title of the internship position
 * - {{companyName}}: Name of the company
 * - {{encouragement}}: Encouraging message for future applications
 *
 * Example Body:
 * ```
 * Poštovani/a {{studentName}},
 *
 * Hvala vam što ste pokazali interes za poziciju {{internshipTitle}} u
 * tvrtki {{companyName}}.
 *
 * Nakon pažljivog razmatranja svih prijava, odlučili smo nastaviti s drugim
 * kandidatima čiji profil bolje odgovara trenutnim potrebama tvrtke.
 *
 * Cijenimo vaš interes i trud uložen u prijavu. Ohrabrujemo vas da nastavite
 * s prijavljivanjem na druge pozicije koje odgovaraju vašim vještinama i
 * interesima.
 *
 * Želimo vam puno uspjeha u budućem profesionalnom razvoju.
 *
 * S poštovanjem,
 * {{companyName}}
 * ```
 */
export const REJECTION_TEMPLATE: Partial<RejectionEmailTemplate> = {
  subject: 'Ažuriranje statusa vaše prijave za praksu',
};

/**
 * Email Service Interface
 *
 * This interface should be implemented by the backend email service.
 */
export interface EmailService {
  /**
   * Send approval email to student
   */
  sendApprovalEmail(data: EmailTemplateData): Promise<void>;

  /**
   * Send rejection email to student
   */
  sendRejectionEmail(data: EmailTemplateData): Promise<void>;
}
