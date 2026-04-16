import { client } from '../../lib/sanity';

export async function POST(req) {
  const { query, params } = await req.json();
  const result = await client.fetch(query, params || {});
  return Response.json({ result });
}