import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../../config/index.js';
import { logger } from '../../shared/utils/logger.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content?: Buffer | string;
    path?: string;
  }>;
}

let transporter: Transporter | null = null;

const getTransporter = (): Transporter => {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: config.email.host,
      port: config.email.port,
      secure: config.email.port === 465,
      auth: {
        user: config.email.user,
        pass: config.email.pass,
      },
    });
  }
  return transporter;
};

export const sendEmail = async (options: EmailOptions): Promise<boolean> => {
  try {
    const mailTransporter = getTransporter();

    const mailOptions = {
      from: config.email.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text || options.html.replace(/<[^>]*>/g, ''),
      attachments: options.attachments,
    };

    const result = await mailTransporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { 
      to: options.to, 
      subject: options.subject,
      messageId: result.messageId 
    });
    return true;
  } catch (error) {
    logger.error('Failed to send email', { 
      to: options.to, 
      subject: options.subject, 
      error 
    });
    throw error;
  }
};

export const verifyEmailConnection = async (): Promise<boolean> => {
  try {
    const mailTransporter = getTransporter();
    await mailTransporter.verify();
    logger.info('Email transporter verified successfully');
    return true;
  } catch (error) {
    logger.error('Email transporter verification failed', { error });
    return false;
  }
};
