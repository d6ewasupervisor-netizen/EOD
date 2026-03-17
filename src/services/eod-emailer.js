const express = require('express');
const cors = require('cors');
const { Resend } = require('resend');

const app = express();
const PORT = process.env.PORT || 3001;
const resend = new Resend(process.env.RESEND_API_KEY);

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.post('/send-eod', async (req, res) => {
    try {
        const {
            storeNumber,
            subject,
            body,
            recipients,
            pdfBase64,
            pdfFilename,
            userName,
            userEmail,
            signoffPhotos
        } = req.body;

        if (!recipients || recipients.length === 0) {
            return res.json({ success: false, error: 'No recipients specified' });
        }

        const paddedStore = String(storeNumber || '').padStart(3, '0');
        const fromAddress = `EOD_FM${paddedStore}_@kompass.retailodyssey.com`;

        // Build HTML email body
        let html = '';

        // 1. Sign-off photos at the top (inline via CID)
        if (signoffPhotos && signoffPhotos.length > 0) {
            html += '<h3>Sign-Off Sheets</h3>\n';
            for (let i = 0; i < signoffPhotos.length; i++) {
                html += `<img src="cid:signoff_${i}" style="max-width:100%; margin-bottom:12px; display:block;">\n`;
            }
        }

        // 2. EOD body text in <pre> tags
        html += `<pre style="white-space:pre-wrap; font-family:monospace; font-size:14px;">${escapeHtml(body)}</pre>\n`;

        // 3. Email signature block
        html += '<hr>\n';
        html += '<p style="font-size:13px; color:#555;">\n';
        html += `  ${escapeHtml(userName || '')}<br>\n`;
        html += '  Retail Odyssey<br>\n';
        html += `  ${escapeHtml(userEmail || '')}\n`;
        html += '</p>\n';

        // Build attachments array
        const attachments = [];

        // PDF attachment
        if (pdfBase64) {
            attachments.push({
                filename: pdfFilename || 'EOD_Report.pdf',
                content: pdfBase64,
                content_type: 'application/pdf'
            });
        }

        // Sign-off photos as inline CID attachments
        if (signoffPhotos && signoffPhotos.length > 0) {
            for (let i = 0; i < signoffPhotos.length; i++) {
                // Strip data URI prefix if present
                let photoBase64 = signoffPhotos[i];
                if (photoBase64.startsWith('data:')) {
                    photoBase64 = photoBase64.split(',')[1];
                }
                attachments.push({
                    filename: `signoff_${i}.jpg`,
                    content: photoBase64,
                    content_id: `signoff_${i}`,
                    content_type: 'image/jpeg'
                });
            }
        }

        const emailPayload = {
            from: fromAddress,
            to: recipients,
            subject: subject || 'KOMPASS EOD Report',
            html,
            attachments
        };

        const result = await resend.emails.send(emailPayload);

        if (result.error) {
            console.error('Resend error:', result.error);
            return res.json({ success: false, error: result.error.message || 'Failed to send email' });
        }

        console.log('Email sent successfully:', result.data?.id);
        res.json({ success: true, id: result.data?.id });
    } catch (error) {
        console.error('Server error:', error);
        res.json({ success: false, error: error.message });
    }
});

function escapeHtml(text) {
    return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}

app.listen(PORT, () => {
    console.log(`EOD Emailer running on port ${PORT}`);
});
