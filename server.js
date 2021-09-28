const express = require('express')
const { readFileSync, writeFileSync, rmSync, existsSync } = require('fs')
const csv = require('csvtojson')
const sendMailQueue = require('./send')
const { scheduleJob, cancelJob } = require('node-schedule')
const multer = require('multer')
const { emptyDirSync } = require('fs-extra')
const upload = multer({ dest: 'uploads/', limits: { fieldSize: 20971520 } })

const app = express()
const port = 8090

app.post('/send-mail', upload.single('emails'), (req, res) => {

    let mailSender = req.body.mailSender
    let pass = req.body.pass
    let host = req.body.host
    let subject = req.body.subject
    let fromName = req.body.fromName
    let fromAddress = req.body.fromAddress
    let body = req.body.body
    let emails = readFileSync(req.file.path).toString()

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

    scheduleJob('sendMail', '* * * * *', () => {
        sendMailQueue(mailSender, pass, host, subject, fromName, fromAddress).then((res) => {
            if (res == 'emails sent') {
                if (existsSync('./body.html'))
                    rmSync('./body.html')
                if (existsSync('./emails.json'))
                    rmSync('./emails.json')
                if (existsSync('./uploads'))
                    emptyDirSync('./uploads')
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