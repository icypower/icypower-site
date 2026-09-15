// Tranzila API client — all server-to-server Tranzila calls live here so the
// auth signing is written once and testable in isolation.
//
// AUTH (from docs/authentication, copied exactly — do NOT improvise the signing):
//   headers:
//     X-tranzila-api-app-key       = public application key
//     X-tranzila-api-request-time  = unix seconds
//     X-tranzila-api-nonce         = 40 random bytes as hex (80 chars)
//     X-tranzila-api-access-token  = HMAC_SHA256(message = appKey,
//                                                 key     = secret + requestTime + nonce)
//   PHP reference: hash_hmac('sha256', $appKey, $secret . $time . $nonce)  (hex output)
//
// ENDPOINTS (note the MIXED versions — verified against the docs):
//   Handshake (create thtk):  POST https://api.tranzila.com/v2/handshake/create
//   Transactions (force/reversal/credit): POST https://api.tranzila.com/v1/transaction/credit_card/create
//   Reports (query txns):     POST https://api.tranzila.com/v1/transactions
//
// Secrets/vars read from env:
//   TRANZILA_API_APP_KEY (public), TRANZILA_API_SECRET (secret), TRANZILA_TERMINAL

const HANDSHAKE_URL = 'https://api.tranzila.com/v2/handshake/create';
const TXN_URL = 'https://api.tranzila.com/v1/transaction/credit_card/create';
const REPORTS_URL = 'https://api.tranzila.com/v1/transactions';

function toHex(buf) {
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// 40 random bytes -> 80 hex chars, per the docs.
function makeNonce() {
  return toHex(crypto.getRandomValues(new Uint8Array(40)));
}

// HMAC-SHA256(message=appKey, key=secret+time+nonce) -> hex.
async function accessToken(appKey, secret, time, nonce) {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw', enc.encode(secret + time + nonce),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(appKey));
  return toHex(sig);
}

async function authHeaders(env) {
  const appKey = env.TRANZILA_API_APP_KEY;
  const secret = env.TRANZILA_API_SECRET;
  if (!appKey || !secret) throw new Error('tranzila_api_credentials_missing');
  const time = String(Math.floor(Date.now() / 1000));
  const nonce = makeNonce();
  const token = await accessToken(appKey, secret, time, nonce);
  return {
    'Content-Type': 'application/json',
    'X-tranzila-api-app-key': appKey,
    'X-tranzila-api-request-time': time,
    'X-tranzila-api-nonce': nonce,
    'X-tranzila-api-access-token': token,
  };
}

async function postJson(url, headers, body) {
  const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch { data = { _raw: text }; }
  return { httpStatus: res.status, data };
}

// --- Handshake: lock the amount on Tranzila's servers, get a thtk. ----------
// request_params values are stored and returned with the transaction, so we
// pass booking_id here as a reliable round-trip carrier.
export async function createHandshake(env, { sum, requestParams }) {
  const headers = await authHeaders(env);
  const body = { terminal_name: env.TRANZILA_TERMINAL, sum };
  if (requestParams) body.request_params = requestParams;
  const { httpStatus, data } = await postJson(HANDSHAKE_URL, headers, body);
  // Success is error_code:0 with a thtk. Parse defensively for the token's location.
  const thtk = data && (data.thtk
    || (data.transaction_result && data.transaction_result.thtk)
    || (data.data && data.data.thtk));
  if (httpStatus !== 200 || (data && data.error_code != null && Number(data.error_code) !== 0) || !thtk) {
    const msg = (data && (data.message || data.error)) || `handshake_failed_${httpStatus}`;
    const err = new Error('handshake_failed');
    // Diagnostic snippet (no secrets in a handshake response) to surface the
    // real Tranzila error while we validate the integration.
    err.detail = { httpStatus, msg, error_code: data && data.error_code, raw: JSON.stringify(data).slice(0, 400) };
    throw err;
  }
  return thtk;
}

// --- FORCE (capture a J5) / REVERSAL (release a J5). ------------------------
// Per Tranzila support: no PAN/CVV — pass reference_txn_id + authorization_number
// + the card TOKEN + expiry. UNRESOLVED (verify in first live test): the docs
// examples put the card value in `card_number`; the Apple-Pay flow documents
// `card_number` = token-from-verification, so we send the token there. If the
// first live test shows a dedicated token field is required instead, change
// only this mapping.
function txnBody(env, txnType, { referenceTxnId, authorizationNumber, token, expMonth, expYear, amount, itemName }) {
  // The v1 transaction API validates types strictly: expiry must be INTEGERS
  // (6, 2032), not strings; reference_txn_id must be an integer|null. The
  // authorization_number stays a STRING (it can carry a leading zero).
  const mm = parseInt(String(expMonth), 10);
  let yy = parseInt(String(expYear), 10);
  if (Number.isFinite(yy) && yy < 100) yy += 2000;
  const refInt = parseInt(String(referenceTxnId), 10);
  const body = {
    terminal_name: env.TRANZILA_TERMINAL,
    txn_type: txnType,
    reference_txn_id: Number.isFinite(refInt) ? refInt : null,
    authorization_number: String(authorizationNumber),
    card_number: token,           // token, NOT a PAN (accepted by Tranzila for force/reversal)
    expire_month: mm,
    expire_year: yy,
  };
  // The AMOUNT is carried by `items` (unit_price × units_number) in this API.
  // Omitting it makes Tranzila force 0.00 with status 418 — so always send it
  // for force/reversal/credit.
  if (amount != null) {
    body.items = [{ name: itemName || 'IcyPower booking', type: 'I', unit_price: Number(amount), units_number: 1 }];
  }
  return body;
}

// A transaction only really succeeded if the processor approved it (000).
function procApproved(data) {
  return !!(data && data.transaction_result
    && String(data.transaction_result.processor_response_code) === '000');
}
function capturedAmount(data) {
  const a = data && data.transaction_result && data.transaction_result.amount;
  const n = Number(a);
  return Number.isFinite(n) ? n : null;
}

// verifyAmount (when given): the call is only ok if the processor-reported
// amount matches — so a 0.00 force (the status-418 bug) can never pass as success.
async function txnCall(env, txnType, args, verifyAmount) {
  const headers = await authHeaders(env);
  const { httpStatus, data } = await postJson(TXN_URL, headers, txnBody(env, txnType, args));
  let ok = httpStatus === 200 && data && Number(data.error_code) === 0 && procApproved(data);
  const captured = capturedAmount(data);
  if (ok && verifyAmount != null) {
    ok = captured != null && Math.round(captured) === Math.round(Number(verifyAmount));
  }
  return { ok, httpStatus, data, captured };
}

export function forceCapture(env, args) { return txnCall(env, 'force', args, args.amount); }
export function reversal(env, args) { return txnCall(env, 'reversal', args); } // releases the hold; amount not asserted
export function credit(env, args) { return txnCall(env, 'credit', args, args.amount); } // refund

// --- Reports: fetch a transaction we identified by booking_id. --------------
// Used to (a) recover authorization_number / token / expiry if the Notify
// omits them, and (b) reconcile a lost Notify. `booking_id` must be defined as
// a user-defined ("additional") field on the terminal for the ufields filter.
export async function getTransactionByBookingId(env, bookingId) {
  const headers = await authHeaders(env);
  const body = {
    terminal_name: env.TRANZILA_TERMINAL,
    detailed: 'Y',
    ufields: [{ name: 'booking_id', operator: 'equals', value: String(bookingId) }],
  };
  const { httpStatus, data } = await postJson(REPORTS_URL, headers, body);
  if (httpStatus !== 200) return null;
  // Response shape carries a list of transactions; return the newest match.
  const list = (data && (data.transactions || data.results || data.data)) || [];
  if (!Array.isArray(list) || list.length === 0) return null;
  return list[list.length - 1];
}
