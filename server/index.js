const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

app.post('/api/upload', async (req, res) => {
  try {
    const { image } = req.body;

    if (!image) {
      return res.status(400).json({ error: 'No image provided' });
    }

    // Convert base64 to buffer
    const imageBuffer = Buffer.from(image, 'base64');

    // Send email with attachment
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'my8bird@gmail.com',
      subject: 'Photo Booth Composite',
      html: `
        <h2>Photo Booth Composite</h2>
        <p>A new photo booth composite has been created!</p>
        <p>Check the attachment below.</p>
      `,
      attachments: [
        {
          filename: 'photo-booth.jpg',
          content: imageBuffer,
          contentType: 'image/jpeg',
        },
      ],
    });

    res.json({
      success: true,
      message: 'Email sent successfully!',
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      error: 'Failed to send email',
      message: error.message,
    });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Local: http://localhost:${PORT}`);
  console.log(`Expose with ngrok: ngrok http ${PORT}`);
});
