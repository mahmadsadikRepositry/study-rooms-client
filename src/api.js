// Small helper used by every component.
// It turns any server answer into { ok, status, data, problem } so the UI can explain
// what happened even while the backend is still being built.
export async function callApi(method, url, options = {}) {
  let res;
  try {
    res = await fetch(url, { method, ...options });
  } catch {
    return {
      ok: false,
      status: 0,
      problem: 'Cannot reach the server. Is `npm start` running in the server folder?'
    };
  }

  const type = res.headers.get('content-type') || '';
  const data = type.includes('application/json') ? await res.json().catch(() => null) : null;

  let problem = '';
  if (res.status === 404 && (!data || data.error === 'Not found')) {
    problem = `${method} ${url.split('?')[0]} returned 404: this route is not built yet.`;
  } else if (res.status === 501) {
    problem = `${method} ${url.split('?')[0]} returned 501: ${data?.error || 'not implemented yet'}.`;
  } else if (!data) {
    problem = `${method} ${url.split('?')[0]} returned ${res.status} but the response was not JSON. Use res.json(...).`;
  } else if (!res.ok && res.status !== 400) {
    problem = `${method} ${url.split('?')[0]} returned ${res.status}: ${data.error || 'server error'}`;
  }

  return { ok: res.ok && !problem, status: res.status, data, problem };
}
