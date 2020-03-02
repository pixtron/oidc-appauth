import { RequestResponseI } from '../requestor/requestor'

export class AppauthHttpError extends Error {
  constructor(public message: string, public response: RequestResponseI) {
    super(message)
  }
}
