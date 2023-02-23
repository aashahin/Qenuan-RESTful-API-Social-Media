const nodemailer = require("nodemailer");

exports.templateMail = (name, code) => {
  return `Hi ${name}\nThis is the activation code\n${code}\nThis Code valid for 15 min.\nIf you didn't request a password reset you can delete this email.`;
};
exports.sendMail = async(options)=>{
    // Email Config
    const transport = nodemailer.createTransport({
        host: process.env.host,
        port: process.env.port,
        secure: process.env.secure,
        auth: {
            user: process.env.user,
            pass: process.env.pass
        }
    })
    // Email Options
    const message = {
        from: process.env.from,
        to: options.email,
        subject: options.subject,
        text: options.message
    }
    await transport.sendMail(message)
}