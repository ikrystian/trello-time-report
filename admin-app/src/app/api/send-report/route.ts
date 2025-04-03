import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Configure nodemailer for a local development SMTP server (e.g., MailDev)
const transporter = nodemailer.createTransport({
  host: 'localhost', // Or your local SMTP server host
  port: 1025,        // Default MailDev port
  secure: false,     // Typically false for local dev servers
  // No auth needed for most local dev servers
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, subject, htmlContent } = body;

    if (!to || !subject || !htmlContent) {
      return NextResponse.json({ error: 'Missing required fields: to, subject, htmlContent' }, { status: 400 });
    }

    // Use a generic 'from' address for local testing
    const fromEmail = 'test-sender@localhost';

    console.log(`Sending email via local SMTP to ${to} from ${fromEmail} with subject "${subject}"`);

    const mailOptions = {
      from: fromEmail,
      to: to, // Nodemailer accepts a string or array here
      subject: subject,
      html: htmlContent,
    };

    // Send mail with defined transport object
    const info = await transporter.sendMail(mailOptions);

    console.log('Nodemailer Send Success:', info);
    // info.messageId is useful for tracking in MailDev/similar tools
    return NextResponse.json({ message: 'Email sent successfully via local SMTP', messageId: info.messageId });

  } catch (error) {
    console.error('Error processing request or sending email:', error);
    // Check if the error is related to JSON parsing
    if (error instanceof SyntaxError) {
        return NextResponse.json({ error: 'Invalid JSON payload' }, { status: 400 });
    }
    // Check for Nodemailer specific errors (e.g., connection refused)
    if (error instanceof Error && 'code' in error && error.code === 'ECONNREFUSED') {
         return NextResponse.json({ error: 'Failed to connect to local SMTP server. Is it running?' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Internal Server Error', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}
