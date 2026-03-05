/**
 * Email Template Components
 *
 * These templates are used as reference for backend email sending.
 * They use inline styles for email client compatibility.
 */

// ===== INTERFACES =====

export interface ApplicationApprovedEmailProps {
  studentName: string;
  internshipTitle: string;
  companyName: string;
  startDate: string;
  nextSteps: string;
}

export interface ApplicationRejectedEmailProps {
  studentName: string;
  internshipTitle: string;
  companyName: string;
  message: string;
}

export interface FinalReportSubmittedEmailProps {
  mentorName: string;
  studentName: string;
  internshipTitle: string;
  companyName: string;
  reportUrl: string;
}

export interface DiaryEntryCommentedEmailProps {
  studentName: string;
  mentorName: string;
  entryDate: string;
  commentPreview: string;
  diaryUrl: string;
}

// ===== EMAIL TEMPLATES =====

/**
 * Application Approved Email Template
 */
export const ApplicationApprovedEmail = (props: ApplicationApprovedEmailProps) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <title>Prijava prihvaćena</title>
    </head>
    <body style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f8f9fa', padding: '20px' }}>
        <tr>
          <td>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px' }}>
              <tr>
                <td>
                  <div style={{
                    backgroundColor: '#10b981',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <h1 style={{ margin: '0', fontSize: '24px' }}>Čestitamo!</h1>
                  </div>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Poštovani/a {props.studentName},
                  </p>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Obavještavamo Vas da je Vaša prijava za praksu <strong>{props.internshipTitle}</strong> kod poduzeća <strong>{props.companyName}</strong> prihvaćena!
                  </p>

                  <div style={{
                    backgroundColor: '#f0fdf4',
                    padding: '15px',
                    borderLeft: '4px solid #10b981',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: '0', fontSize: '14px' }}>
                      <strong>Datum početka:</strong> {props.startDate}
                    </p>
                  </div>

                  <h2 style={{ fontSize: '18px', color: '#10b981', marginTop: '20px' }}>
                    Sljedeći koraci:
                  </h2>

                  <p style={{ fontSize: '16px', whiteSpace: 'pre-line' }}>
                    {props.nextSteps}
                  </p>

                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />

                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Srdačan pozdrav,<br />
                    Tim Agile Mijau
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
);

/**
 * Application Rejected Email Template
 */
export const ApplicationRejectedEmail = (props: ApplicationRejectedEmailProps) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <title>Obavijest o prijavi</title>
    </head>
    <body style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f8f9fa', padding: '20px' }}>
        <tr>
          <td>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px' }}>
              <tr>
                <td>
                  <div style={{
                    backgroundColor: '#ef4444',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <h1 style={{ margin: '0', fontSize: '24px' }}>Obavijest o prijavi</h1>
                  </div>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Poštovani/a {props.studentName},
                  </p>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Zahvaljujemo Vam na interesu za praksu <strong>{props.internshipTitle}</strong> kod poduzeća <strong>{props.companyName}</strong>.
                  </p>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Nažalost, obavještavamo Vas da Vaša prijava nije prihvaćena u ovom trenutku.
                  </p>

                  {props.message && (
                    <div style={{
                      backgroundColor: '#fef2f2',
                      padding: '15px',
                      borderLeft: '4px solid #ef4444',
                      marginBottom: '20px'
                    }}>
                      <p style={{ margin: '0', fontSize: '14px' }}>
                        {props.message}
                      </p>
                    </div>
                  )}

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Ne obeshrabrujte se! Potaknite se prijaviti na druge prakse koje odgovaraju Vašim interesima i vještinama.
                  </p>

                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />

                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Srdačan pozdrav,<br />
                    Tim Agile Mijau
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
);

/**
 * Final Report Submitted Email Template
 */
export const FinalReportSubmittedEmail = (props: FinalReportSubmittedEmailProps) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <title>Završno izvješće predano</title>
    </head>
    <body style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f8f9fa', padding: '20px' }}>
        <tr>
          <td>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px' }}>
              <tr>
                <td>
                  <div style={{
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <h1 style={{ margin: '0', fontSize: '24px' }}>Završno izvješće predano</h1>
                  </div>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Poštovani/a {props.mentorName},
                  </p>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Obavještavamo Vas da je student <strong>{props.studentName}</strong> predao/la završno izvješće za praksu <strong>{props.internshipTitle}</strong> kod poduzeća <strong>{props.companyName}</strong>.
                  </p>

                  <div style={{
                    backgroundColor: '#eff6ff',
                    padding: '15px',
                    borderLeft: '4px solid #3b82f6',
                    marginBottom: '20px',
                    textAlign: 'center'
                  }}>
                    <a
                      href={props.reportUrl}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#3b82f6',
                        color: '#ffffff',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      Pregledaj izvješće
                    </a>
                  </div>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Molimo Vas da pregledate izvješće i pružite povratne informacije ili ocjenu.
                  </p>

                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />

                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Srdačan pozdrav,<br />
                    Tim Agile Mijau
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
);

/**
 * Diary Entry Commented Email Template
 */
export const DiaryEntryCommentedEmail = (props: DiaryEntryCommentedEmailProps) => (
  <html>
    <head>
      <meta charSet="utf-8" />
      <title>Novi komentar na dnevnik</title>
    </head>
    <body style={{
      fontFamily: 'Arial, sans-serif',
      lineHeight: '1.6',
      color: '#333',
      maxWidth: '600px',
      margin: '0 auto',
      padding: '20px'
    }}>
      <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f8f9fa', padding: '20px' }}>
        <tr>
          <td>
            <table width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '8px' }}>
              <tr>
                <td>
                  <div style={{
                    backgroundColor: '#8b5cf6',
                    color: '#ffffff',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <h1 style={{ margin: '0', fontSize: '24px' }}>Novi komentar</h1>
                  </div>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Poštovani/a {props.studentName},
                  </p>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Vaš mentor <strong>{props.mentorName}</strong> je ostavio/la komentar na Vaš unos u dnevnik od <strong>{props.entryDate}</strong>.
                  </p>

                  <div style={{
                    backgroundColor: '#f5f3ff',
                    padding: '15px',
                    borderLeft: '4px solid #8b5cf6',
                    marginBottom: '20px'
                  }}>
                    <p style={{ margin: '0', fontSize: '14px', fontStyle: 'italic' }}>
                      "{props.commentPreview}"
                    </p>
                  </div>

                  <div style={{
                    textAlign: 'center',
                    marginBottom: '20px'
                  }}>
                    <a
                      href={props.diaryUrl}
                      style={{
                        display: 'inline-block',
                        backgroundColor: '#8b5cf6',
                        color: '#ffffff',
                        padding: '12px 24px',
                        textDecoration: 'none',
                        borderRadius: '4px',
                        fontWeight: 'bold'
                      }}
                    >
                      Pogledaj cijeli komentar
                    </a>
                  </div>

                  <p style={{ fontSize: '16px', marginBottom: '20px' }}>
                    Prijavite se na platformu kako biste pročitali kompletan komentar i odgovorili na povratne informacije svog mentora.
                  </p>

                  <hr style={{ border: 'none', borderTop: '1px solid #e5e7eb', margin: '30px 0' }} />

                  <p style={{ fontSize: '14px', color: '#6b7280' }}>
                    Srdačan pozdrav,<br />
                    Tim Agile Mijau
                  </p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
  </html>
);

/**
 * Export all templates
 */
export const EmailTemplates = {
  ApplicationApproved: ApplicationApprovedEmail,
  ApplicationRejected: ApplicationRejectedEmail,
  FinalReportSubmitted: FinalReportSubmittedEmail,
  DiaryEntryCommented: DiaryEntryCommentedEmail,
};
