import { Requestor, RequestSettingsI, RequestResponseI } from '../../src/requestor/requestor'

const exampleResponse = {
  data: {},
  status: 200,
  statusText: 'OK',
  headers: {}
}

export class TestRequestor extends Requestor {
  async send(settings: RequestSettingsI): Promise<RequestResponseI> {
    return Promise.resolve(exampleResponse)
  }
}
