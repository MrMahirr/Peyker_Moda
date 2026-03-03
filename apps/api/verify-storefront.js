const http = require('http');

const CONFIG = { hostname: 'localhost', port: 3001 };

function request(method, path, body = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: CONFIG.hostname,
            port: CONFIG.port,
            path: '/api' + path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

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
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function runTest() {
    console.log('🧪 Starting Storefront Verification...\n');

    // Test public endpoints
    const endpoints = [
        { method: 'GET', path: '/store/categories', name: 'Categories' },
        { method: 'GET', path: '/store/products', name: 'Products' }
    ];

    for (const ep of endpoints) {
        const res = await request(ep.method, ep.path);
        if (res.status === 200) {
            console.log(`✅ ${ep.name}: OK`);
        } else {
            console.log(`❌ ${ep.name}: ${res.status}`);
        }
    }

    // Test cart calculation
    console.log('\nTesting Cart Calculation...');
    const productsRes = await request('GET', '/store/products');
    const productList = productsRes.data.data?.data || productsRes.data.data || [];

    if (productList.length > 0 && productList[0].variants?.length > 0) {
        const variantId = productList[0].variants[0].id;
        const cartRes = await request('POST', '/store/cart/calculate', {
            items: [{ variantId, quantity: 1 }]
        });

        if (cartRes.status === 201 || cartRes.status === 200) {
            console.log('✅ Cart Calculate:', cartRes.data.data?.total || cartRes.data.total || 'OK');
        } else {
            console.log('❌ Cart Calculate:', cartRes.status);
        }
    } else {
        console.log('⚠️ Skipping cart test - no products with variants');
    }

    console.log('\n🏁 Verification Complete.');
}

runTest().catch(console.error);
