const { ClientBuilder, EmailMessageBuilder } = require('ews-simple')
const { readFileSync, writeFileSync } = require('fs')

async function generateHtmlBody() {
  let template = readFileSync(`body.html`).toString()
  return template
}

async function sendMail(mailSender, pass, host, email, body, subject, fromName, fromAddress) {
  const service = new ClientBuilder()
    .withUser(mailSender)
    .withPwd(pass)
    .withUri(host)
    .build()

  return new EmailMessageBuilder()
    .withService(service)
    .withSubject(subject)
    .withBodyType('html')
    .withBody(body)
    .withFrom({ name: fromName, address: fromAddress })
    .withTo([email])
    .execute().then(() => {
      console.log(`Email enviado: ${email}`)
    }).catch(err => { console.log(err) });
}


async function sendMailQueue(mailSender, pass, host, subject, fromName, fromAddress) {
  let count = 0
  let envios = []
  let emails = JSON.parse(readFileSync('emails.json').toString())

  emails.forEach((recipient, index) => {
    if (!recipient.sent && count < 10) { //10 envios por vez
      count++
      envios.push(
        generateHtmlBody(recipient.email).then(body => {
          body = body.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
            return '&#' + i.charCodeAt(0) + ';';
          })

          return sendMail(mailSender, pass, host, recipient.email, body, subject, fromName, fromAddress).then(() => {
            emails[index].sent = true
          })
        })
      )
    }
    return true
  })

  return Promise.all(envios).then(() => {
    if (envios.length == 0) {
      return 'emails sent'
    } else {
      writeFileSync('./emails.json', JSON.stringify(emails))
    }
  })
}

module.exports = sendMailQueue