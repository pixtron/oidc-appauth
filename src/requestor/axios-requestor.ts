import axios from 'axios'
import { Requestor, RequestSettingsI, RequestResponseI } from './requestor'

axios.interceptors.response.use((response) => {
  return response
}, function (error) {
  return error.response ? error.response : Promise.reject(error)
})

export class AxiosRequestor extends Requestor {

  public async send(settings: RequestSettingsI): Promise<RequestResponseI> {
    const options = {
      method: settings.method || 'GET',
      responseType: settings.responseType || 'json',
      ...settings
    }

    const response = await axios(options)

    return {
      data: response.data,
      status: response.status,
      statusText: response.statusText,
      headers: response.headers
    }
  }
}
