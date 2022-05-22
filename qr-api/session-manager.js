export class SessionManager {
    constructor() {
        this.sessionStore = {}
    }

    createSession() {
        const sessionId = Math.random().toFixed(10).toString()
        return new Promise((resolve, _) => {
            setImmediate(() => {
                this.sessionStore[sessionId] = {
                    sid: sessionId
                }

                resolve(sessionId)
            })
        })
    }

    getSession(sessionId) {
        return this.sessionStore[sessionId]
    }

    patchSession(sessionId, attrs) {
        return Object.assign(this.sessionStore[sessionId], attrs)
    }
}
