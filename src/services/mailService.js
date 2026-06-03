const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: (parseInt(process.env.SMTP_PORT) || 587) === 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

async function sendRecoveryCode(email, codigo) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('[MailService] SMTP no configurado - código generado:', codigo, 'para:', email);
        return true;
    }
    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM || 'REU System <noreply@reu.edu.ve>',
            to: email,
            subject: 'REU - Código de Recuperación de Contraseña',
            html: `
                <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:20px;border:1px solid #e0e0e0;border-radius:8px;">
                    <h2 style="color:#003DA5;">Red Estudiantil Universitaria</h2>
                    <p>Has solicitado recuperar tu contraseña. Usa el siguiente código:</p>
                    <div style="font-size:28px;font-weight:bold;text-align:center;letter-spacing:6px;padding:16px;background:#f5f7fa;border-radius:6px;margin:16px 0;color:#003DA5;">
                        ${codigo}
                    </div>
                    <p>Este código expira en 15 minutos. Si no solicitaste este cambio, ignora este mensaje.</p>
                    <hr style="border:none;border-top:1px solid #eee;margin:16px 0;">
                    <p style="font-size:12px;color:#888;">REU System - Red Estudiantil Universitaria</p>
                </div>
            `
        });
        return true;
    } catch (error) {
        console.error('[MailService] Error al enviar correo:', error.message);
        return false;
    }
}

module.exports = { sendRecoveryCode };
