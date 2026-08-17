import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;

  constructor(private configService: ConfigService) {
    this.initializeTransporter();
  }

  private initializeTransporter() {
    const host = this.configService.get<string>('SMTP_HOST');
    const port = this.configService.get<number>('SMTP_PORT');
    const user = this.configService.get<string>('SMTP_USER');
    const pass = this.configService.get<string>('SMTP_PASS');

    if (host && user && pass) {
      this.transporter = nodemailer.createTransport({
        host,
        port: port || 587,
        secure: port === 465,
        auth: { user, pass },
      });
      this.logger.log('Email transporter initialized');
    } else {
      this.logger.warn(
        'SMTP config not found. Email service running in mock mode.',
      );
    }
  }

  async sendEmail(options: EmailOptions): Promise<boolean> {
    const fromEmail =
      this.configService.get<string>('SMTP_FROM') || 'noreply@peykermoda.com';
    const emailJsServiceId =
      this.configService.get<string>('EMAILJS_SERVICE_ID');
    const emailJsTemplateId = this.configService.get<string>(
      'EMAILJS_TEMPLATE_ID',
    );
    const emailJsPublicKey =
      this.configService.get<string>('EMAILJS_PUBLIC_KEY');

    // 1. Eğer EmailJS tanımlıysa onu kullan
    if (emailJsServiceId && emailJsTemplateId && emailJsPublicKey) {
      try {
        const response = await fetch(
          'https://api.emailjs.com/api/v1.0/email/send',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              service_id: emailJsServiceId,
              template_id: emailJsTemplateId,
              user_id: emailJsPublicKey,
              template_params: {
                to_email: options.to,
                subject: options.subject,
                message: options.html, // EmailJS panelinde {{{message}}} kullanılması gerekir
              },
            }),
          },
        );

        if (response.ok) {
          this.logger.log(`EmailJS ile gönderildi: ${options.to}`);
          return true;
        } else {
          const errText = await response.text();
          this.logger.error(`EmailJS Hatası: ${errText}`);
        }
      } catch (error) {
        this.logger.error(`EmailJS Fetch Hatası: ${error.message}`);
      }
      // Hata olursa (fallback) SMTP denemesi yapması için aşağıya devam eder.
    }

    // 2. SMTP Transporter varsa onu kullan
    if (this.transporter) {
      try {
        await this.transporter.sendMail({
          from: `"Peyker Moda" <${fromEmail}>`,
          to: options.to,
          subject: options.subject,
          html: options.html,
          text: options.text,
        });
        this.logger.log(`SMTP ile gönderildi: ${options.to}`);
        return true;
      } catch (error) {
        this.logger.error(`SMTP Hatası: ${error.message}`);
        return false;
      }
    }

    // 3. İkisi de yoksa Mock (Fake) gönderim yap
    this.logger.log(
      `[MOCK EMAIL] To: ${options.to}, Subject: ${options.subject}`,
    );
    this.logger.debug(
      `[MOCK EMAIL] Body: ${options.html.substring(0, 200)}...`,
    );
    return true;
  }

  // ========== EMAIL TEMPLATES ==========

  async sendWelcomeEmail(to: string, firstName: string): Promise<boolean> {
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">Peyker Moda</h1>
                </div>
                <div style="padding: 32px; background: #fafaf9;">
                    <h2 style="color: #1c1917; margin-top: 0;">Hoş Geldiniz, ${firstName}! 🎉</h2>
                    <p style="color: #57534e; line-height: 1.6;">
                        Peyker Moda ailesine katıldığınız için teşekkür ederiz! 
                        Artık en yeni koleksiyonlarımızdan haberdar olabilir, 
                        özel indirimlerden yararlanabilir ve siparişlerinizi kolayca takip edebilirsiniz.
                    </p>
                    <a href="https://peykermoda.com" style="display: inline-block; background: #1c1917; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; margin-top: 16px;">
                        Alışverişe Başla
                    </a>
                </div>
                <div style="padding: 16px; text-align: center; color: #a8a29e; font-size: 12px;">
                    © 2024 Peyker Moda. Tüm hakları saklıdır.
                </div>
            </div>
        `;
    return this.sendEmail({
      to,
      subject: "Peyker Moda'ya Hoş Geldiniz! 🛍️",
      html,
    });
  }

  async sendOrderConfirmation(
    to: string,
    orderData: {
      orderNumber: string;
      customerName: string;
      items: { name: string; quantity: number; price: number }[];
      totalAmount: number;
      shippingAddress: string;
    },
  ): Promise<boolean> {
    const itemsHtml = orderData.items
      .map(
        (item) => `
            <tr>
                <td style="padding: 12px; border-bottom: 1px solid #e7e5e4;">${item.name}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e7e5e4; text-align: center;">${item.quantity}</td>
                <td style="padding: 12px; border-bottom: 1px solid #e7e5e4; text-align: right;">₺${item.price.toFixed(2)}</td>
            </tr>
        `,
      )
      .join('');

    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">Peyker Moda</h1>
                </div>
                <div style="padding: 32px; background: #fafaf9;">
                    <h2 style="color: #1c1917; margin-top: 0;">Siparişiniz Alındı! ✅</h2>
                    <p style="color: #57534e;">Merhaba ${orderData.customerName},</p>
                    <p style="color: #57534e; line-height: 1.6;">
                        Siparişiniz başarıyla oluşturuldu. Aşağıda sipariş detaylarınızı bulabilirsiniz.
                    </p>
                    
                    <div style="background: white; border: 1px solid #e7e5e4; border-radius: 8px; padding: 16px; margin: 24px 0;">
                        <p style="margin: 0; color: #78716c; font-size: 14px;">Sipariş Numarası</p>
                        <p style="margin: 4px 0 0; font-size: 24px; font-weight: bold; color: #1c1917; font-family: monospace;">#${orderData.orderNumber}</p>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                        <thead>
                            <tr style="background: #1c1917; color: white;">
                                <th style="padding: 12px; text-align: left;">Ürün</th>
                                <th style="padding: 12px; text-align: center;">Adet</th>
                                <th style="padding: 12px; text-align: right;">Fiyat</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                        <tfoot>
                            <tr style="background: #fef3c7;">
                                <td colspan="2" style="padding: 12px; font-weight: bold;">Toplam</td>
                                <td style="padding: 12px; text-align: right; font-weight: bold; font-size: 18px;">₺${orderData.totalAmount.toFixed(2)}</td>
                            </tr>
                        </tfoot>
                    </table>

                    <div style="background: #f5f5f4; padding: 16px; border-radius: 8px; margin-top: 24px;">
                        <p style="margin: 0 0 8px; color: #78716c; font-size: 14px;">Teslimat Adresi</p>
                        <p style="margin: 0; color: #1c1917;">${orderData.shippingAddress}</p>
                    </div>
                </div>
                <div style="padding: 16px; text-align: center; color: #a8a29e; font-size: 12px;">
                    © 2024 Peyker Moda. Tüm hakları saklıdır.
                </div>
            </div>
        `;
    return this.sendEmail({
      to,
      subject: `Siparişiniz Alındı - #${orderData.orderNumber} 📦`,
      html,
    });
  }

  async sendShippingNotification(
    to: string,
    data: {
      customerName: string;
      orderNumber: string;
      trackingNumber: string;
      carrier: string;
      trackingUrl?: string;
    },
  ): Promise<boolean> {
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">Peyker Moda</h1>
                </div>
                <div style="padding: 32px; background: #fafaf9;">
                    <h2 style="color: #1c1917; margin-top: 0;">Siparişiniz Yola Çıktı! 🚚</h2>
                    <p style="color: #57534e;">Merhaba ${data.customerName},</p>
                    <p style="color: #57534e; line-height: 1.6;">
                        <strong>#${data.orderNumber}</strong> numaralı siparişiniz kargoya verildi!
                    </p>
                    
                    <div style="background: white; border: 1px solid #e7e5e4; border-radius: 8px; padding: 24px; margin: 24px 0; text-align: center;">
                        <p style="margin: 0; color: #78716c; font-size: 14px;">Kargo Takip Numarası</p>
                        <p style="margin: 8px 0; font-size: 28px; font-weight: bold; color: #1c1917; font-family: monospace; letter-spacing: 2px;">${data.trackingNumber}</p>
                        <p style="margin: 0; color: #78716c; font-size: 14px;">Kargo Firması: <strong>${data.carrier}</strong></p>
                    </div>

                    ${
                      data.trackingUrl
                        ? `
                    <div style="text-align: center; margin-bottom: 24px;">
                        <a href="${data.trackingUrl}" style="display: inline-block; background: #1c1917; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                            Kargom Nerede?
                        </a>
                    </div>
                    `
                        : ''
                    }

                    <p style="color: #57534e; text-align: center;">
                        Kargonuzu takip etmek için yukarıdaki numarayı kargo firmasının web sitesinde kullanabilirsiniz.
                    </p>
                </div>
                <div style="padding: 16px; text-align: center; color: #a8a29e; font-size: 12px;">
                    © 2024 Peyker Moda. Tüm hakları saklıdır.
                </div>
            </div>
        `;
    return this.sendEmail({
      to,
      subject: `Siparişiniz Kargoda! 🚚 #${data.orderNumber}`,
      html,
    });
  }

  async sendPasswordReset(to: string, resetLink: string): Promise<boolean> {
    const html = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background: linear-gradient(135deg, #1c1917 0%, #44403c 100%); padding: 32px; text-align: center;">
                    <h1 style="color: #fbbf24; margin: 0; font-size: 28px;">Peyker Moda</h1>
                </div>
                <div style="padding: 32px; background: #fafaf9;">
                    <h2 style="color: #1c1917; margin-top: 0;">Şifre Sıfırlama 🔐</h2>
                    <p style="color: #57534e; line-height: 1.6;">
                        Şifrenizi sıfırlamak için aşağıdaki butona tıklayın. 
                        Bu bağlantı 1 saat geçerlidir.
                    </p>
                    <a href="${resetLink}" style="display: inline-block; background: #1c1917; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; margin: 24px 0; font-weight: bold;">
                        Şifremi Sıfırla
                    </a>
                    <p style="color: #a8a29e; font-size: 12px;">
                        Bu isteği siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
                    </p>
                </div>
                <div style="padding: 16px; text-align: center; color: #a8a29e; font-size: 12px;">
                    © 2024 Peyker Moda. Tüm hakları saklıdır.
                </div>
            </div>
        `;
    return this.sendEmail({
      to,
      subject: 'Şifre Sıfırlama Talebi - Peyker Moda',
      html,
    });
  }
}
