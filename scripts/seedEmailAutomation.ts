
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding Email Automation data...');

    // --- 1. Welcome Email Template ---
    const welcomeHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); padding: 40px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 700; letter-spacing: -0.5px; }
    .content { padding: 40px 30px; }
    .greeting { font-size: 20px; font-weight: 600; color: #111827; margin-bottom: 20px; }
    .message { color: #4b5563; margin-bottom: 30px; font-size: 16px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%); color: white; padding: 14px 32px; text-decoration: none; border-radius: 50px; font-weight: 600; text-align: center; transition: opacity 0.2s; }
    .btn:hover { opacity: 0.9; }
    .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BashItNow</h1>
    </div>
    <div class="content">
      <div class="greeting">Hi {{user.name}},</div>
      <p class="message">
        Welcome to the family! We're absolutely thrilled to have you here. 
        <br><br>
        At BashItNow, we believe every celebration deserves to be spectacular without the stress. 
        Whether you're planning a birthday bash, a romantic anniversary, or a corporate event, we've got the perfect setup ready for you.
      </p>
      <div style="text-align: center;">
        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/themes" class="btn">Explore Themes</a>
      </div>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} BashItNow. All rights reserved.<br>
      Making events memorable, one bash at a time.
    </div>
  </div>
</body>
</html>
  `;

    let welcomeTemplate = await prisma.emailTemplate.findFirst({
        where: { name: 'Welcome Email' },
    });

    if (welcomeTemplate) {
        welcomeTemplate = await prisma.emailTemplate.update({
            where: { id: welcomeTemplate.id },
            data: {
                body: welcomeHtml,
                subject: 'Welcome to BashItNow, {{user.name}}! 🎉',
            },
        });
        console.log('Updated Welcome Template');
    } else {
        welcomeTemplate = await prisma.emailTemplate.create({
            data: {
                name: 'Welcome Email',
                subject: 'Welcome to BashItNow, {{user.name}}! 🎉',
                body: welcomeHtml,
                type: 'TRANSACTIONAL',
                variables: ['user.name'],
            },
        });
        console.log('Created Welcome Template');
    }

    // --- 2. Booking Confirmation Template ---
    const bookingHtml = `
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f9fafb; }
    .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
    .header { background: #10B981; padding: 30px 20px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 24px; font-weight: 700; }
    .content { padding: 40px 30px; }
    .details { background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 20px; margin: 20px 0; }
    .detail-row { display: flex; justify-content: space-between; margin-bottom: 10px; border-bottom: 1px dashed #bbf7d0; padding-bottom: 10px; }
    .detail-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
    .label { font-weight: 600; color: #166534; }
    .value { color: #15803d; }
    .footer { background-color: #f3f4f6; padding: 20px; text-align: center; font-size: 12px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Booking Confirmed!</h1>
    </div>
    <div class="content">
      <p>Hi {{user.name}},</p>
      <p>Great news! Your booking has been officially confirmed. We are locking in the slot for you.</p>
      
      <div class="details">
        <div class="detail-row">
          <span class="label">Occasion</span>
          <span class="value">{{booking.occasion}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Date</span>
          <span class="value">{{booking.date}}</span>
        </div>
        <div class="detail-row">
          <span class="label">Total Amount</span>
          <span class="value">₹{{booking.totalAmount}}</span>
        </div>
      </div>

      <p>Our team will reach out shortly if any further details are needed. Can't wait!</p>
    </div>
    <div class="footer">
      &copy; ${new Date().getFullYear()} BashItNow.
    </div>
  </div>
</body>
</html>
  `;

    let bookingTemplate = await prisma.emailTemplate.findFirst({
        where: { name: 'Booking Confirmation' },
    });

    if (bookingTemplate) {
        bookingTemplate = await prisma.emailTemplate.update({
            where: { id: bookingTemplate.id },
            data: { body: bookingHtml },
        });
        console.log('Updated Booking Template');
    } else {
        bookingTemplate = await prisma.emailTemplate.create({
            data: {
                name: 'Booking Confirmation',
                subject: 'Booking Confirmed: {{booking.occasion}}',
                body: bookingHtml,
                type: 'TRANSACTIONAL',
                variables: ['user.name', 'booking.occasion', 'booking.date', 'booking.totalAmount'],
            },
        });
        console.log('Created Booking Template');
    }

    // --- 3. Link Events ---
    // Upsert USER_SIGNUP
    await prisma.emailEvent.upsert({
        where: { eventKey: 'USER_SIGNUP' },
        update: { templateId: welcomeTemplate.id },
        create: {
            eventKey: 'USER_SIGNUP',
            description: 'Triggered when a new user registers',
            templateId: welcomeTemplate.id,
            recipientType: 'USER',
        },
    });

    // Upsert BOOKING_CREATED
    await prisma.emailEvent.upsert({
        where: { eventKey: 'BOOKING_CREATED' },
        update: { templateId: bookingTemplate.id },
        create: {
            eventKey: 'BOOKING_CREATED',
            description: 'Triggered when a booking is created',
            templateId: bookingTemplate.id,
            recipientType: 'USER',
        },
    });

    console.log('Email Automation data seeded/updated successfully.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
