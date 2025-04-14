import nodemailer from "nodemailer";

const sendEmail = async (to, subject, message) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // Your Gmail email
        pass: process.env.EMAIL_PASS, // Use the "App Password"
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject,
      text: message,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(" Email sent: ", info.response);
    return info;
  } catch (error) {
    console.error(" Email sending error:", error);
    throw error; // Throw error to be handled by caller
  }
};

export default sendEmail;

