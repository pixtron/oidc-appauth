export class AppauthError extends Error {
  constructor(public message: string, public origError?: Error) {
    super(message)
  }
}
