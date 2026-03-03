const http = require('http');

const CONFIG = {
    hostname: 'localhost',
    port: 3001,
    email: 'admin@peyker.com',
    password: 'admin123'
};

let accessToken = '';

function request(method, path, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: CONFIG.hostname,
            port: CONFIG.port,
            path: '/api' + path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };
        if (token) options.headers['Authorization'] = `Bearer ${token}`;

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
                }
            });
        });
        req.on('error', (e) => reject(e));
        req.end();
    });
}

async function runTest() {
    console.log('🧪 Starting Dashboard Verification...\n');

    // Login
    console.log('1. Logging in...');
    const loginRes = await request('POST', '/auth/login');
    const body = JSON.stringify({ email: CONFIG.email, password: CONFIG.password });
    const loginReq = http.request({
        hostname: CONFIG.hostname, port: CONFIG.port, path: '/api/auth/login', method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    }, (res) => {
        let data = '';
        res.on('data', (chunk) => data += chunk);
        res.on('end', async () => {
            accessToken = JSON.parse(data).data.accessToken;
            console.log('✅ Login Successful\n');

            // Test endpoints
            const endpoints = [
                '/dashboard/summary',
                '/dashboard/sales-chart',
                '/dashboard/top-products',
                '/dashboard/low-stock',
                '/dashboard/recent-orders',
                '/dashboard/order-status',
                '/dashboard/payment-methods',
                '/dashboard/top-customers'
            ];

            for (const ep of endpoints) {
                const res = await request('GET', ep, accessToken);
                if (res.status === 200) {
                    console.log(`✅ ${ep}`);
                } else {
                    console.log(`❌ ${ep}: ${res.status}`);
                }
            }

            console.log('\n🏁 Verification Complete.');
        });
    });
    loginReq.write(body);
    loginReq.end();
}

runTest().catch(console.error);
