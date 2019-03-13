var fs = require("fs")
var express = require("express")
var https = require("https")

const opts = {
    key: fs.readFileSync('server_key.pem'), // Private Key
    cert: fs.readFileSync('server_cert.pem'), // Server Cert (Public key) 
    ca: [fs.readFileSync('server_cert.pem')],   // CA Cert
    requestCert: true,
    rejectUnauthorized: false
};

const app = express()
app.get('/', (req, res) => {
    res.send('<a href="authenticate">Log in using client certificate</a>')
})
app.get('/authenticate', (req, res) => {
    const cert = req.connection.getPeerCertificate()
    console.log(req.client.authorized);
    if (req.client.authorized) {
        res.send(`Hello ${cert.subject.CN}, your certificate was issued by ${cert.issuer.CN}!`)
    } else if (cert.subject) {
        res.status(403)
            .send(`Sorry ${cert.subject.CN}, certificates from ${cert.issuer.CN} are not welcome here.`)
    } else {
        res.status(401)
            .send(`Sorry, but you need to provide a client certificate to continue.`)
    }
})

https.createServer(opts, app).listen(9999)