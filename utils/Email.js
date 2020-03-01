const nodemailer = require('nodemailer');
const pug = require('pug');
const htmlToText = require('html-to-text');

class Email {
  constructor(user, url) {
    this.name = user.fname + ' ' + user.lname;
    this.url = url;
    this.to = user.email;
    this.from = `QuotesApp Admin <no-reply@apps.damirpristav.com>`;
  }

  getTransport() {
    return nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASS
      }
    });
  }

  async send(template, subject) {
    let markup;
    markup = pug.renderFile(`${__dirname}/../views/emails/${template}.pug`, {
      name: this.name,
      url: this.url,
      subject
    });

    const options = {
      from: this.from,
      to: this.to,
      subject: subject,
      text: htmlToText.fromString(markup),
      html: markup
    }

    const transporter = this.getTransport();
    transporter.sendMail(options, (err) => {
      if(err){
        return false;
      }else {
        return true;
      }
    });
  }
}

module.exports = Email;