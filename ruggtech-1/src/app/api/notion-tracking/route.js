import { trackSearchQuery, trackProductView, trackAddToCart } from '../../lib/notion'

export async function POST(request) {
  try {
    const data = await request.json()
    const { eventType, ...eventData } = data

    let result

    switch (eventType) {
      case 'search':
        result = await trackSearchQuery(eventData)
        break
      case 'productView':
        result = await trackProductView(eventData)
        break
      case 'addToCart':
        result = await trackAddToCart(eventData)
        break
      default:
        return Response.json({ error: 'Invalid event type' }, { status: 400 })
    }

    return Response.json(result)
  } catch (error) {
    console.error('Notion tracking error:', error)
    return Response.json({ error: 'Failed to track event' }, { status: 500 })
  }
}
