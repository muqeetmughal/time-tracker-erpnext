import axios from 'axios'

export async function frappePost(
  method: string,
  payload: any
) {
  const baseURL =
    process.env.ERP_URL

  return axios.post(
    `${baseURL}/api/method/${method}`,
    payload,
    {
      headers: {
        Authorization:
          `token ${API_KEY}:${API_SECRET}`,
      },
    }
  )
}