import { NextResponse } from 'next/server'

export async function GET() {
  const redisUrl = process.env["UPSTASH-KV_KV_REST_API_URL"]
  const redisToken = process.env["UPSTASH-KV_KV_REST_API_TOKEN"]
  
  const diagnostics = {
    hasUrl: !!redisUrl,
    hasToken: !!redisToken,
    urlPrefix: redisUrl?.substring(0, 20) || 'missing',
    urlIsHttps: redisUrl?.startsWith('https://') || false,
    tokenLength: redisToken?.length || 0,
    allEnvVars: Object.keys(process.env).filter(key => key.includes('UPSTASH') || key.includes('REDIS') || key.includes('KV')),
    recommendation: ''
  }
  
  if (!diagnostics.hasUrl || !diagnostics.hasToken) {
    diagnostics.recommendation = 'Missing environment variables. Go to v0 sidebar → Connect → Re-add Upstash integration'
  } else if (!diagnostics.urlIsHttps) {
    diagnostics.recommendation = `Invalid URL format. Expected https://..., got ${redisUrl}. Go to v0 sidebar → Vars and update UPSTASH-KV_KV_REST_API_URL`
  } else {
    diagnostics.recommendation = 'Configuration looks good. If still failing, the Upstash database may need to be recreated.'
  }
  
  return NextResponse.json(diagnostics, { status: 200 })
}
