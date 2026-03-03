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
    console.log('🧪 Starting API Verification...\n');

    try {
        // 1. Health Check (Swagger Docs existing is basically API up) -> Lets try just root or a known get
        // We'll try listing categories first as public/auth check
        // Actually, lets try login first to get token
        console.log('1️⃣  Testing Login (Admin)...');
        const loginRes = await request('/auth/login', { method: 'POST' }, {
            email: 'admin@peyker.com',
            password: 'admin123'
        });

        if (loginRes.status === 201 || loginRes.status === 200) {
            console.log('✅ Login Successful');
            const token = loginRes.data.accessToken;

            // 2. Get Profile
            console.log('\n2️⃣  Testing Get Profile...');
            const profileRes = await request('/auth/profile', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (profileRes.status === 200) {
                console.log(`✅ Profile: ${profileRes.data.firstName} ${profileRes.data.lastName} (${profileRes.data.role})`);
            } else {
                console.error('❌ Profile Failed:', profileRes.status, profileRes.data);
            }

            // 3. Get Categories
            console.log('\n3️⃣  Testing Categories...');
            const catRes = await request('/categories');
            if (catRes.status === 200 && Array.isArray(catRes.data)) {
                console.log(`✅ Categories Found: ${catRes.data.length}`);
                catRes.data.forEach(c => console.log(`   - ${c.name} (${c.slug})`));
            } else {
                console.error('❌ Categories Failed:', catRes.status);
            }

            // 4. Get Products
            console.log('\n4️⃣  Testing Products...');
            const prodRes = await request('/products');
            if (prodRes.status === 200 && Array.isArray(prodRes.data.data)) { // Pagination usually returns { data: [], meta: ... }
                console.log(`✅ Products Found: ${prodRes.data.data.length}`);
                prodRes.data.data.forEach(p => console.log(`   - ${p.name} (${p.price} TL)`));
            } else if (Array.isArray(prodRes.data)) {
                console.log(`✅ Products Found: ${prodRes.data.length}`);
                prodRes.data.forEach(p => console.log(`   - ${p.name} (${p.price} TL)`));
            } else {
                console.error('❌ Products Failed:', prodRes.status);
            }

            // 5. Dashboard Summary
            console.log('\n5️⃣  Testing Dashboard Summary...');
            const dashRes = await request('/dashboard/summary', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (dashRes.status === 200) {
                console.log('✅ Dashboard Data:', dashRes.data);
            } else {
                console.error('❌ Dashboard Failed:', dashRes.status, dashRes.data);
            }

        } else {
            console.error('❌ Login Failed:', loginRes.status, loginRes.data);
        }

    } catch (error) {
        console.error('⚠️  API Request Error:', error.message);
        console.log('Make sure the API server is running on localhost:3000');
    }
}

testEndpoints();
