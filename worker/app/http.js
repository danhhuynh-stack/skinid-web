export function corsHeaders(request, env) {
  const origin = request.headers.get('origin') || '';
  const configured = String(env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(value => value.trim().replace(/\/$/, ''))
    .filter(Boolean);
  const normalizedOrigin = origin.replace(/\/$/, '');
  const local = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const domainMatch = /^https?:\/\/([a-z0-9-]+\.)*(skinid\.vn|pages\.dev)$/i.test(normalizedOrigin);
  const sameOrigin = !origin || origin === new URL(request.url).origin;
  const allowed = sameOrigin || local || domainMatch || configured.includes('*') || configured.includes(normalizedOrigin);

  return {
    'access-control-allow-origin': allowed && origin ? origin : new URL(request.url).origin,
    'access-control-allow-headers': 'authorization, content-type, idempotency-key',
    'access-control-allow-methods': 'GET, POST, PATCH, DELETE, OPTIONS',
    'access-control-max-age': '86400',
    vary: 'Origin'
  };
}

export function json(request, env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
      ...corsHeaders(request, env)
    }
  });
}
