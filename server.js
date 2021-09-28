const { cleanup, multipartyExpress } = require('multiparty-express')
const express = require('express')
const { readFileSync, writeFileSync, rmSync, existsSync } = require('fs')
const csv = require('csvtojson')
const sendMailQueue = require('./send')
const { scheduleJob, cancelJob } = require('node-schedule')

const app = express()
const port = 8090

app.post('/send-mail', multipartyExpress(), (req, res, next) => {
    let mailSender = req.fields.mailSender[0]
    let pass = req.fields.pass[0]
    let host = req.fields.host[0]
    let subject = req.fields.subject[0]
    let fromName = req.fields.fromName[0]
    let fromAddress = req.fields.fromAddress[0]
    let body = req.fields.body[0]
    let emails = readFileSync(req.files['emails'][0].path).toString()

    csv().fromString(emails).then(jsonObj => {
        jsonObj.forEach(el => {
            el.sent = false
        })
        writeFileSync('./emails.json', JSON.stringify(jsonObj))
    })
    writeFileSync('./body.html', body)

    res.send({
        message: 'Sua lista de emails será enviada'
    })
    cleanup(req);

    scheduleJob('sendMail', '* * * * *', () => {
        sendMailQueue(mailSender, pass, host, subject, fromName, fromAddress).then((res) => {
            if (res == 'emails sent') {
                if (existsSync('./body.html'))
                    rmSync('./body.html')
                if (existsSync('./emails.json'))
                    rmSync('./emails.json')
                cancelJob('sendMail')
                console.log('finish')
            }
        })
    })


})

app.use('/', express.static('public'))

app.listen(port, () => {
    console.log(`listening at http://localhost:${port}`)
})