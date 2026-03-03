const http = require('http');

function request(path, options = {}, body = null) {
    return new Promise((resolve, reject) => {
        const defaultOptions = {
            hostname: 'localhost',
            port: 3001,
            path: '/api' + path,
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        };

        const req = http.request(defaultOptions, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data });
                }
            });
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function testEndpoints() {
    console.log('🧪 Starting API Verification (Port 3001)...\n');

    try {
        // 1. Health Check
        console.log('1️⃣  Health Check (GET /api)...');
        const health = await new Promise((resolve) => {
            http.get('http://localhost:3001/api', (res) => resolve(res.statusCode)).on('error', () => resolve(0));
        });
        console.log(`   Status: ${health}`);

        // 2. Login
        console.log('\n2️⃣  Testing Login (Admin)...');
        const loginRes = await request('/auth/login', { method: 'POST' }, {
            email: 'admin@peyker.com',
            password: 'admin123'
        });

        if (loginRes.status === 201 || loginRes.status === 200) {
            console.log('✅ Login Successful');
            const token = loginRes.data.accessToken;

            // 3. Get Categories
            console.log('\n3️⃣  Testing Categories...');
            const catRes = await request('/categories');
            console.log(`   Status: ${catRes.status}`);
            if (catRes.status === 200) {
                if (Array.isArray(catRes.data)) {
                    console.log(`✅ Categories Found: ${catRes.data.length}`);
                    catRes.data.slice(0, 3).forEach(c => console.log(`   - ${c.name}`));
                } else if (catRes.data && Array.isArray(catRes.data.data)) {
                    console.log(`✅ Categories Found (Paginated): ${catRes.data.data.length}`);
                    catRes.data.data.slice(0, 3).forEach(c => console.log(`   - ${c.name}`));
                } else {
                    console.log('⚠️ Categories format unexpected:', typeof catRes.data);
                    console.log(JSON.stringify(catRes.data).substring(0, 200));
                }
            } else {
                console.error('❌ Categories Failed:', catRes.status);
            }

            // 4. Get Products
            console.log('\n4️⃣  Testing Products...');
            const prodRes = await request('/products');
            console.log(`   Status: ${prodRes.status}`);
            if (prodRes.status === 200) {
                let products = [];
                if (Array.isArray(prodRes.data)) products = prodRes.data;
                else if (prodRes.data && Array.isArray(prodRes.data.data)) products = prodRes.data.data;
                else if (prodRes.data && Array.isArray(prodRes.data.results)) products = prodRes.data.results;

                if (products.length > 0) {
                    console.log(`✅ Products Found: ${products.length}`);
                    products.slice(0, 3).forEach(p => console.log(`   - ${p.name} (${p.basePrice || p.price} TL)`));
                } else {
                    console.log('⚠️ Products format unexpected or empty:', typeof prodRes.data);
                    console.log(JSON.stringify(prodRes.data).substring(0, 200));
                }
            } else {
                console.error('❌ Products Failed:', prodRes.status);
            }

            // 5. Dashboard Summary
            console.log('\n5️⃣  Testing Dashboard Summary...');
            const dashRes = await request('/dashboard/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`   Status: ${dashRes.status}`);
            if (dashRes.status === 200) {
                if (dashRes.data && typeof dashRes.data === 'object') {
                    console.log('✅ Dashboard Data:');
                    console.log(`   Total Revenue: ${dashRes.data.totalRevenue}`);
                    console.log(`   Total Orders: ${dashRes.data.totalOrders}`);
                } else {
                    console.log('⚠️ Dashboard format unexpected:', typeof dashRes.data);
                }
            } else {
                console.error('❌ Dashboard Failed:', dashRes.status);
                console.log(JSON.stringify(dashRes.data).substring(0, 200));
            }

        } else {
            console.error('❌ Login Failed:', loginRes.status);
            console.log(JSON.stringify(loginRes.data).substring(0, 200));
        }

    } catch (error) {
        console.error('⚠️  API Request Error:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

testEndpoints();
