import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const API_BASE = __ENV.API_URL || 'http://localhost:8001/api';

const errors = new Rate('errors');

export const options = {
  stages: [
    { duration: '5s', target: 1 },
    { duration: '10s', target: 2 },
    { duration: '5s', target: 0 },
  ],
  thresholds: {
    errors: ['rate<0.10'],
    http_req_duration: ['avg<1000', 'p(95)<2000'],
  },
};

const ADMIN = { email: 'admin@ugclab.com', password: 'password' };

const TEST_USERS = [
  { email: 'ahmed.ali@ugclab.com', password: 'password', role: 'creator' },
  { email: 'sara.mohamed@ugclab.com', password: 'password', role: 'creator' },
  { email: 'techco_iq@ugclab.com', password: 'password', role: 'advertiser' },
  { email: 'fashionhub@ugclab.com', password: 'password', role: 'advertiser' },
];

function login(email, password) {
  const res = http.post(`${API_BASE}/auth/login`, JSON.stringify({ email, password }), {
    headers: { 'Content-Type': 'application/json' },
  });
  if (res.status === 200) {
    try { return JSON.parse(res.body).token; } catch (e) { return null; }
  }
  return null;
}

export function setup() {
  const tokens = {
    admin: login(ADMIN.email, ADMIN.password),
    creators: [],
    advertisers: [],
  };

  for (const u of TEST_USERS) {
    const token = login(u.email, u.password);
    if (token) {
      if (u.role === 'creator') tokens.creators.push(token);
      else tokens.advertisers.push(token);
    }
  }

  return tokens;
}

export default function (data) {
  const tokens = data;

  group('Public', () => {
    const endpoints = ['/health', '/campaigns/explore'];
    for (const ep of endpoints) {
      const res = http.get(`${API_BASE}${ep}`);
      if (res.status !== 200) {
        errors.add(1);
        continue;
      }
      try { JSON.parse(res.body); } catch (e) { errors.add(1); continue; }
      check(res, { [`GET ${ep}`]: (r) => r.status === 200 });
    }
  });

  group('Auth', () => {
    for (const u of TEST_USERS) {
      const start = Date.now();
      const res = http.post(`${API_BASE}/auth/login`, JSON.stringify(u), {
        headers: { 'Content-Type': 'application/json' },
      });
      errors.add(res.status !== 200);
      if (res.status === 200) {
        try {
          const token = JSON.parse(res.body).token;
          check(res, { [`login ${u.email}`]: (r) => token !== undefined });

          const me = http.get(`${API_BASE}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          errors.add(me.status !== 200);
          check(me, { [`me ${u.email}`]: (r) => r.status === 200 });
        } catch (e) { errors.add(1); }
      }
    }
  });

  if (tokens.admin) {
    group('Admin', () => {
      const h = { Authorization: `Bearer ${tokens.admin}` };
      const eps = [
        '/admin/dashboard', '/admin/analytics', '/admin/users',
        '/admin/campaigns', '/admin/payments', '/admin/logs',
        '/admin/settlement-requests', '/admin/kyc/pending',
      ];
      for (const ep of eps) {
        const res = http.get(`${API_BASE}${ep}`, { headers: h });
        errors.add(res.status !== 200);
        if (res.status === 200) check(res, { [`admin ${ep}`]: (r) => r.status === 200 });
      }
    });
  }

  if (tokens.advertisers.length > 0) {
    group('Advertiser', () => {
      const h = {
        Authorization: `Bearer ${tokens.advertisers[0]}`,
        'Content-Type': 'application/json',
      };

      const dash = http.get(`${API_BASE}/advertiser/dashboard`, { headers: h });
      errors.add(dash.status !== 200);
      if (dash.status === 200) check(dash, { 'adv dashboard': (r) => r.status === 200 });

      const list = http.get(`${API_BASE}/advertiser/campaigns`, { headers: h });
      errors.add(list.status !== 200);
      if (list.status === 200) check(list, { 'adv campaigns': (r) => r.status === 200 });

      const cr = http.get(`${API_BASE}/advertiser/creators`, { headers: h });
      errors.add(cr.status !== 200);
      if (cr.status === 200) check(cr, { 'adv creators': (r) => r.status === 200 });

      const wallet = http.get(`${API_BASE}/wallet`, { headers: h });
      errors.add(wallet.status !== 200);
      if (wallet.status === 200) check(wallet, { 'wallet': (r) => r.status === 200 });

      if (tokens.creators.length > 0) {
        const msg = http.get(`${API_BASE}/messages`, { headers: h });
        if (msg.status === 200) check(msg, { 'messages': (r) => r.status === 200 });
      }
    });
  }

  if (tokens.creators.length > 0) {
    group('Creator', () => {
      const h = { Authorization: `Bearer ${tokens.creators[0]}` };

      const dash = http.get(`${API_BASE}/creator/dashboard`, { headers: h });
      errors.add(dash.status !== 200);
      if (dash.status === 200) check(dash, { 'cr dashboard': (r) => r.status === 200 });

      const camps = http.get(`${API_BASE}/creator/campaigns`, { headers: h });
      errors.add(camps.status !== 200);

      const apps = http.get(`${API_BASE}/creator/applications`, { headers: h });
      if (apps.status === 200) check(apps, { 'applications': (r) => r.status === 200 });

      const port = http.get(`${API_BASE}/portfolio`, { headers: h });
      if (port.status === 200) check(port, { 'portfolio': (r) => r.status === 200 });

      const earn = http.get(`${API_BASE}/creator/earnings`, { headers: h });
      if (earn.status === 200) check(earn, { 'earnings': (r) => r.status === 200 });

      const loyalty = http.get(`${API_BASE}/loyalty/me`, { headers: h });
      if (loyalty.status === 200) check(loyalty, { 'loyalty': (r) => r.status === 200 });

      const crs = http.get(`${API_BASE}/creators`, { headers: h });
      if (crs.status === 200) check(crs, { 'creators list': (r) => r.status === 200 });
    });
  }

  sleep(0.5);
}
