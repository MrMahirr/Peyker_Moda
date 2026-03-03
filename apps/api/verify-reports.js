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
    console.log('🧪 Starting Financial Reports Verification...\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await request('POST', '/auth/login', { email: CONFIG.email, password: CONFIG.password });
    if (loginRes.status !== 201 && loginRes.status !== 200) {
        console.error('❌ Login Failed:', loginRes.data);
        process.exit(1);
    }
    accessToken = loginRes.data.data.accessToken;
    console.log('✅ Login Successful\n');

    // 2. Add Dummy Transactions (Income & Expense) to ensure data exists
    console.log('2. Adding Test Transactions...');
    await request('POST', '/transactions', {
        type: 'INCOME',
        amount: 1000,
        description: 'Test Income Report',
        category: 'Sales',
        transactionDate: new Date().toISOString()
    }, accessToken);

    await request('POST', '/transactions', {
        type: 'EXPENSE',
        amount: 300,
        description: 'Test Expense Report',
        category: 'Rent',
        transactionDate: new Date().toISOString()
    }, accessToken);
    console.log('✅ Test Data Added\n');

    // 3. Get Financial Report
    console.log('3. Fetching Financial Report...');
    const today = new Date().toISOString().split('T')[0];
    const reportRes = await request('GET', `/transactions/reports/financial?startDate=${today}&endDate=${today}`, null, accessToken);

    if (reportRes.status === 200) {
        console.log('✅ Report Fetched:', reportRes.data);
        const { totalIncome, totalExpense, netProfit } = reportRes.data;

        if (typeof totalIncome === 'number' && typeof totalExpense === 'number') {
            console.log(`   Income: ${totalIncome}, Expense: ${totalExpense}, Net: ${netProfit}`);
            console.log('✅ Data Structure Valid');
        } else {
            console.error('❌ Invalid Data Structure:', reportRes.data);
        }

    } else {
        console.error('❌ Report Fetch Failed:', reportRes.data);
    }

    console.log('\n🏁 Verification Complete.');
}

runTest().catch(console.error);
