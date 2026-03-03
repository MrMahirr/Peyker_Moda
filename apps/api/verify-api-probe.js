const http = require('http');

function request(path, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const defaultOptions = {
            hostname: 'localhost',
            port: 3000,
            path: path, // Full path including prefix if any
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            ...options,
        };

        const req = http.request(defaultOptions, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, data }));
        });

        req.on('error', (e) => resolve({ status: 0, error: e.message }));

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('🔍 Probing API Paths...');

    // 1. Check Root
    console.log('Checking GET / ...');
    const root = await request('/');
    console.log(`Status: ${root.status}`);

    // 2. Check /api prefix
    console.log('\nChecking GET /api ...');
    const apiRoot = await request('/api');
    console.log(`Status: ${apiRoot.status}`);

    // 3. Check /api/categories
    console.log('\nChecking GET /api/categories ...');
    const cats = await request('/api/categories');
    console.log(`Status: ${cats.status}`);
    if (cats.status === 200) console.log('Data sample:', cats.data.substring(0, 100));

    // 4. Check Login (/api/auth/login)
    console.log('\nChecking POST /api/auth/login ...');
    const login = await request('/api/auth/login', { method: 'POST' }, {
        email: 'admin@peyker.com',
        password: 'admin123'
    });
    console.log(`Status: ${login.status}`);
    console.log('Response:', login.data.substring(0, 300));

})();
