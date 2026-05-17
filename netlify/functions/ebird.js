export async function handler(event) {
    const query = event.queryStringParameters
    const params = new URLSearchParams(query).toString()
  
    const response = await fetch(
      `https://api.ebird.org/v2/data/obs/geo/recent?${params}`,
      { headers: { 'X-eBirdApiToken': process.env.VITE_EBIRD_KEY } }
    )
  
    const data = await response.json()
  
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }
  }