import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import ZAI from 'z-ai-web-dev-sdk';

interface EmailData {
  to: string;
  subject: string;
  html: string;
  serviceId?: string;
}

// Email sending function using z-ai-web-dev-sdk
async function sendEmail(data: EmailData): Promise<boolean> {
  try {
    const zai = await ZAI.create();
    
    // For now, we'll simulate email sending since z-ai-web-dev-sdk doesn't have email functionality
    // In a real implementation, you would use a dedicated email service
    console.log('Email sent:', {
      to: data.to,
      subject: data.subject,
      html: data.html,
      serviceId: data.serviceId,
    });

    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, serviceId, customerEmail, serviceName, serviceNumber, estimatedFee } = await request.json();

    if (!type || !serviceId || !customerEmail) {
      return NextResponse.json(
        { error: 'Eksik parametreler' },
        { status: 400 }
      );
    }

    // Get service details
    const service = await db.service.findUnique({
      where: { id: serviceId },
      include: {
        customer: true,
      },
    });

    if (!service) {
      return NextResponse.json(
        { error: 'Servis bulunamadı' },
        { status: 404 }
      );
    }

    let subject = '';
    let html = '';

    switch (type) {
      case 'SERVICE_RECEIVED':
        subject = 'Cihazınız Servisimize Alındı';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">PAŞA İLETİŞİM VE BİLGİSAYAR</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Teknik Servis Hizmetleri</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Cihazınız Servisimize Alındı</h2>
              <p style="color: #666; line-height: 1.6;">Sayın <strong>${service.customer.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6;">Cihazınız servisimize başarıyla alınmıştır. İşte detaylı bilgiler:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Servis Takip No:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">${service.serviceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Cihaz:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">${service.brand} ${service.model}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Teslim Tarihi:</strong></td>
                    <td style="padding: 8px 0; text-align: right;">${new Date(service.createdAt).toLocaleDateString('tr-TR')}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; line-height: 1.6;">Servis süreci hakkında bilgilendirme e-postaları alacaksınız.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  Servis Takibi
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>&copy; 2024 PAŞA İLETİŞİM VE BİLGİSAYAR. Tüm hakları saklıdır.</p>
            </div>
          </div>
        `;
        break;

      case 'CUSTOMER_APPROVAL_PENDING':
        if (!estimatedFee) {
          return NextResponse.json(
            { error: 'Onay için ücret bilgisi gereklidir' },
            { status: 400 }
          );
        }
        subject = 'Servis Onayı Bekleniyor';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">PAŞA İLETİŞİM VE BİLGİSAYAR</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Teknik Servis Hizmetleri</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Servis Onayı Bekleniyor</h2>
              <p style="color: #666; line-height: 1.6;">Sayın <strong>${service.customer.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6;">Cihazınızın arıza tespiti yapılmış olup, tamir ücreti belirlenmiştir:</p>
              
              <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Servis Takip No:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">${service.serviceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6;"><strong>Cihaz:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #dee2e6; text-align: right;">${service.brand} ${service.model}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; background: #fff3cd; color: #856404;"><strong>Tahmini Tamir Ücreti:</strong></td>
                    <td style="padding: 8px 0; background: #fff3cd; color: #856404; text-align: right; font-weight: bold;">${estimatedFee} TL</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; line-height: 1.6;">Lütfen onayınızı beklemekteyiz. Onay verdiğiniz takdirde tamir sürecine başlayacağız.</p>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block; margin-right: 10px;">
                  Onay Ver
                </a>
                <a href="#" style="background: #dc3545; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  İptal Et
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>&copy; 2024 PAŞA İLETİŞİM VE BİLGİSAYAR. Tüm hakları saklıdır.</p>
            </div>
          </div>
        `;
        break;

      case 'SERVICE_COMPLETED':
        subject = 'Cihazınızın Tamiri Tamamlandı';
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 10px; text-align: center;">
              <h1 style="margin: 0; font-size: 24px;">PAŞA İLETİŞİM VE BİLGİSAYAR</h1>
              <p style="margin: 10px 0 0 0; opacity: 0.9;">Teknik Servis Hizmetleri</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; margin-top: 20px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0;">Cihazınızın Tamiri Tamamlandı 🎉</h2>
              <p style="color: #666; line-height: 1.6;">Sayın <strong>${service.customer.name}</strong>,</p>
              <p style="color: #666; line-height: 1.6;">Cihazınızın tamiri başarıyla tamamlanmıştır. Artık servisimizden teslim alabilirsiniz:</p>
              
              <div style="background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745;">
                <table style="width: 100%; border-collapse: collapse;">
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb;"><strong>Servis Takip No:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb; text-align: right;">${service.serviceNumber}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb;"><strong>Cihaz:</strong></td>
                    <td style="padding: 8px 0; border-bottom: 1px solid #c3e6cb; text-align: right;">${service.brand} ${service.model}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0;"><strong>Tamamlanma Tarihi:</strong></td>
                    <td style="padding: 8px 0; text-align: right;">${new Date().toLocaleDateString('tr-TR')}</td>
                  </tr>
                </table>
              </div>
              
              <p style="color: #666; line-height: 1.6;">Çalışma saatlerimiz içinde gelerek cihazınızı teslim alabilirsiniz.</p>
              
              <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h4 style="margin: 0 0 10px 0; color: #495057;">İletişim Bilgileri:</h4>
                <p style="margin: 5px 0; color: #6c757d;"><strong>Adres:</strong> Servis Adresiniz</p>
                <p style="margin: 5px 0; color: #6c757d;"><strong>Telefon:</strong> +90 555 123 4567</p>
                <p style="margin: 5px 0; color: #6c757d;"><strong>Çalışma Saatleri:</strong> Hafta içi 09:00 - 18:00</p>
              </div>
              
              <div style="text-align: center; margin-top: 30px;">
                <a href="#" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                  Teslimat Bilgisi
                </a>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
              <p>&copy; 2024 PAŞA İLETİŞİM VE BİLGİSAYAR. Tüm hakları saklıdır.</p>
            </div>
          </div>
        `;
        break;

      default:
        return NextResponse.json(
          { error: 'Geçersiz bildirim türü' },
          { status: 400 }
        );
    }

    // Send email
    const emailSent = await sendEmail({
      to: customerEmail,
      subject,
      html,
      serviceId,
    });

    if (!emailSent) {
      throw new Error('E-posta gönderilemedi');
    }

    // Log the notification
    await db.notificationLog.create({
      data: {
        type,
        serviceId,
        customerEmail,
        status: 'SENT',
        subject,
        sentAt: new Date(),
      },
    });

    return NextResponse.json({ 
      message: 'E-posta başarıyla gönderildi',
      type,
      serviceId,
    });
  } catch (error) {
    console.error('Email notification error:', error);
    
    // Log failed notification
    if (serviceId && customerEmail) {
      try {
        await db.notificationLog.create({
          data: {
            type,
            serviceId,
            customerEmail,
            status: 'FAILED',
            subject,
            sentAt: new Date(),
          },
        });
      } catch (logError) {
        console.error('Failed to log notification:', logError);
      }
    }

    return NextResponse.json(
      { error: 'E-posta gönderilirken bir hata oluştu' },
      { status: 500 }
    );
  }
}