const nodemailer = require("nodemailer");

exports.sendAccountVerificationEmail = async (token, email, name) => {
  try {
    let info = await transporter().sendMail({
      from: '"Dipankar Maikap 👻" <mail@motewebservices.com>', // sender address
      to: email, // list of receivers
      subject: "Verify your account ✔", // Subject line
      html: `<b>Hello ${name}</b>
        <p>In order to activate your account click on the link below.</p>
        <a href=${`${process.env.FRONTEND_SITE_URL}/app/account-verify/${token}`}>Click Me</a>
        `, // html body
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
};
exports.sendResetPassswordEmail = async (token, email, name) => {
  try {
    let info = await transporter().sendMail({
      from: '"Dipankar Maikap 👻" <mail@motewebservices.com>', // sender address
      to: email, // list of receivers
      subject: "Reset Password ✔", // Subject line
      html: `<b>Hello ${name}</b>
        <p>In order to resete your password click on the link below.</p>
        <a href=${`${process.env.FRONTEND_SITE_URL}/app/reset-password/${token}`}>Click Me</a>
        `, // html body
    });
    console.log("Message sent: %s", info.messageId);
  } catch (error) {
    console.log(error);
  }
};
exports.transporter = () => {
  let transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_HOST_PORT),
    secure: process.env.EMAIL_HOST_PORT === "465" ? true : false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_ADDRESS, // generated ethereal user
      pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
  });
  return transporter;
};
