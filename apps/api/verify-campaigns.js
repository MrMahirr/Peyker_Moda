const http = require('http');

// Configuration
const CONFIG = {
    hostname: 'localhost',
    port: 3001,
    email: 'admin@peyker.com',
    password: 'admin123'
};

let accessToken = '';

function request(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: CONFIG.hostname,
            port: CONFIG.port,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    resolve({ status: res.statusCode, data: parsed });
                } catch (e) {
                    resolve({ status: res.statusCode, data: data });
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

async function runTest() {
    console.log('🧪 Starting Campaigns & Coupons Verification...\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await request('POST', '/auth/login', { email: CONFIG.email, password: CONFIG.password });
    if (loginRes.status !== 201 && loginRes.status !== 200) {
        console.error('❌ Login Failed:', loginRes.data);
        process.exit(1);
    }
    accessToken = loginRes.data.data.accessToken;
    console.log('✅ Login Successful\n');

    // 2. Create Campaign
    console.log('2. Creating Campaign...');
    const campaignData = {
        name: 'Test Campaign',
        description: 'Verification Test',
        discountType: 'PERCENTAGE',
        discountValue: 10,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // +7 days
    };
    const campaignRes = await request('POST', '/campaigns', campaignData, accessToken);
    if (campaignRes.status === 201) {
        console.log('✅ Campaign Created:', campaignRes.data.data?.name || campaignRes.data.name);
    } else {
        console.error('❌ Campaign Creation Failed:', campaignRes.data);
    }

    // 3. List Campaigns
    console.log('\n3. Listing Campaigns...');
    const listRes = await request('GET', '/campaigns', null, accessToken);
    if (listRes.status === 200) {
        const campaigns = listRes.data.data || listRes.data;
        console.log(`✅ Found ${campaigns.length || 0} campaigns`);
    } else {
        console.error('❌ List Campaigns Failed');
    }

    // 4. Create Coupon
    console.log('\n4. Creating Coupon...');
    const couponCode = 'TESTVERIFY' + Date.now();
    const couponData = {
        code: couponCode,
        description: 'Verification Test Coupon',
        discountType: 'FIXED_AMOUNT',
        discountValue: 50,
        usageLimit: 100,
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // +30 days
    };
    const couponRes = await request('POST', '/coupons', couponData, accessToken);
    if (couponRes.status === 201) {
        console.log('✅ Coupon Created:', couponCode);
    } else {
        console.error('❌ Coupon Creation Failed:', couponRes.data);
    }

    // 5. Validate Coupon
    console.log('\n5. Validating Coupon...');
    const validateRes = await request('POST', '/coupons/validate', { code: couponCode, cartTotal: 200 }, accessToken);
    if (validateRes.status === 201 || validateRes.status === 200) {
        console.log('✅ Coupon Valid:', validateRes.data.data || validateRes.data);
    } else {
        console.error('❌ Coupon Validation Failed:', validateRes.data);
    }

    console.log('\n🏁 Verification Complete.');
}

runTest().catch(console.error);
