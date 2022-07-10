import express from "express"
import cookieParser from "cookie-parser"
import morgan from "morgan"
import https from "https"
import cors from "cors"

import { SessionManager } from './session-manager.js'

const sessionManager = new SessionManager()
const app = express()
app.use(morgan("dev"))
app.use(cookieParser())
app.use(cors())
const port = 3000
const qrCodeBaseUrl="https://api.qrserver.com/v1/create-qr-code/"

app.get("/qr-code", async (_req, res) => {
    const sessionId = await sessionManager.createSession()
    const qrRequestUrl = `${qrCodeBaseUrl}?size=150x150&data=${sessionId}`
    console.debug({qrRequestUrl})
    https.get(qrRequestUrl, (qrRes) => {
        const {statusCode, statusMessage} = qrRes
        if (statusCode !== 200) {
            console.error(statusMessage)
            qrRes.resume()
            return
        }

        res.setHeader("Content-Type", qrRes.headers["content-type"])
        res.setHeader("x-qr-session-id", sessionId)
        res.cookie("qr-session", sessionId, {
                maxAge: 5 * 60 * 1000,
                signed: false
            })

        qrRes.on("data", (chunk) => {
            res.write(chunk)
        })

        qrRes.on("end", () => {
            res.end()
        })
    })    
})

app.post("/login", (req, res) => {
    const sidParam = req.query.sessionId
    const sessionAttrs = sessionManager.getSession(sidParam)
    if (!sessionAttrs) {
        res.sendStatus(404)
        return
    }

    const userName = req.query.userName
    const updatedAttrs = sessionManager.patchSession(sidParam, {userName})
    res.send(updatedAttrs)
})

app.get("/dashboard", (req, res) => {
    const sidCookie = req.cookies["qr-session"]
    const sessionAttrs = sessionManager.getSession(sidCookie)
    if (!sessionAttrs) {
        res.sendStatus(404)
        return
    }

    res.send(sessionAttrs)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})
