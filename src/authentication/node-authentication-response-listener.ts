
import * as http from 'http'
import { AuthenticationResponseListener } from './authentication-response-listener'
import { AppauthError } from '../errors/appauth-error'

export class NodeAuthenticationResponseListener extends AuthenticationResponseListener {
  static READY_STATE_STOPED: number = 0
  static READY_STATE_STARTING: number = 1
  static READY_STATE_STARTED: number = 2
  static READY_STATE_STOPING: number = 3

  protected readyState: number = NodeAuthenticationResponseListener.READY_STATE_STOPED
  protected startingPromise: Promise<void> | null = null
  protected stopingPromise: Promise<void> | null = null
  protected server: http.Server | null = null

  public async start(): Promise<void> {
    switch (this.readyState) {
      case NodeAuthenticationResponseListener.READY_STATE_STARTED:
        return Promise.resolve()
      case NodeAuthenticationResponseListener.READY_STATE_STARTING:
        return this.startingPromise!
      case NodeAuthenticationResponseListener.READY_STATE_STOPING:
        return this.startServerAfterStoped()
      case NodeAuthenticationResponseListener.READY_STATE_STOPED:
      default:
        return this.startServer()
    }
  }

  public async stop(): Promise<void> {
    switch (this.readyState) {
      case NodeAuthenticationResponseListener.READY_STATE_STOPED:
        return Promise.resolve()
      case NodeAuthenticationResponseListener.READY_STATE_STARTED:
        return this.stopServer()
      case NodeAuthenticationResponseListener.READY_STATE_STOPING:
        return this.stopingPromise!
      case NodeAuthenticationResponseListener.READY_STATE_STARTING:
        return this.stopServerAfterStarted()
    }
  }

  protected async startServer(): Promise<void> {
    if (this.startingPromise) return this.startingPromise

    this.readyState = NodeAuthenticationResponseListener.READY_STATE_STARTING

    this.startingPromise = new Promise(async (resolve, reject) => {
      try {
        const { pathname: path, port: portS, hostname } = this.urlUtility.parseUrl(this.redirectUri)

        if (hostname !== '127.0.0.1' && hostname !== '[::1]') {
          const error = new AppauthError('Hostname of redirect uri should either be "127.0.0.1" or "[::1]"')
          this.handleStartServerError()

          return reject(error)
        }

        const host = (hostname === '[::1]') ? '::1' : '127.0.0.1'

        const port = portS === '' ? 80 : Number(portS)

        this.server = http.createServer(this.requestListenerFactory(path))
        this.server.listen(port, host, () => {
          resolve()
          this.readyState = NodeAuthenticationResponseListener.READY_STATE_STARTED
          this.startingPromise = null
        })

        this.server.on('error', async error => {
          if (this.readyState === NodeAuthenticationResponseListener.READY_STATE_STARTING) {
            reject(error)
            this.startingPromise = null
          }

          this.emit('error', error)
          await this.stopServer()
        })
      } catch (error) {
        this.handleStartServerError()
        reject(error)
      }
    })

    this.startingPromise.catch(() => {
      return this.stop()
    })

    return this.startingPromise
  }

  protected handleStartServerError(): void {
    this.startingPromise = null
    this.readyState = NodeAuthenticationResponseListener.READY_STATE_STOPED
  }

  protected requestListenerFactory(path: string): http.RequestListener {
    return (request: http.IncomingMessage, response: http.ServerResponse): void => {
      const url = this.urlUtility.parseUrl(`http://${request.headers.host}${request.url}`)

      switch (url.pathname) {
        case path:
          response.statusCode = 200
          response.end('Please close your browser to continue')
          this.emit('response', url.href)
          break
        default:
          response.statusCode = 404
          response.end()
          break
      }
    }
  }

  protected async startServerAfterStoped(): Promise<void> {
    if (this.startingPromise) return this.startingPromise

    this.startingPromise = new Promise(async (resolve, reject) => {
      try {
        await this.stopingPromise

        await this.startServer()
        resolve()
      } catch (error) {
        reject(error)
      }
    })

    return this.startingPromise
  }

  protected async stopServer(): Promise<void> {
    if (this.stopingPromise) return this.stopingPromise

    this.readyState = NodeAuthenticationResponseListener.READY_STATE_STOPING

    this.stopingPromise = new Promise(async (resolve, reject) => {
      try {
        this.server!.close(() => {
          this.readyState = NodeAuthenticationResponseListener.READY_STATE_STOPED
          this.stopingPromise = null
          resolve()
          this.emit('stoped')
        })
      } catch (error) {
        this.readyState = NodeAuthenticationResponseListener.READY_STATE_STOPED
        this.stopingPromise = null
        reject(error)
        this.emit('stoped')
      }
    })

    return this.stopingPromise
  }

  protected async stopServerAfterStarted(): Promise<void> {
    if (this.stopingPromise) return this.stopingPromise

    this.stopingPromise = new Promise(async (resolve, reject) => {
      try {
        await this.startingPromise

        await this.stopServer()
        resolve()
      } catch (error) {
        reject(error)
      }
    })
  }
}
