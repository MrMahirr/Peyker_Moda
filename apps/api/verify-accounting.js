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
    console.log('🧪 Starting Accounting Module Verification...\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await request('POST', '/auth/login', { email: CONFIG.email, password: CONFIG.password });
    if (loginRes.status !== 201 && loginRes.status !== 200) {
        console.error('❌ Login Failed:', loginRes.data);
        process.exit(1);
    }
    accessToken = loginRes.data.data.accessToken;
    console.log('✅ Login Successful\n');

    // 2. Create Expense (Rent)
    console.log('2. Creating Expense (Rent)...');
    const expenseData = {
        type: 'EXPENSE',
        amount: 5000,
        category: 'Kira',
        description: 'Subat Kirasi',
        paymentMethod: 'BANK_TRANSFER',
        transactionDate: new Date().toISOString()
    };
    const expenseRes = await request('POST', '/transactions', expenseData, accessToken);
    if (expenseRes.status !== 201) {
        console.error('❌ Create Expense Failed:', expenseRes.data);
    } else {
        console.log('✅ Expense Created:', expenseRes.data.id);
    }

    // 3. Create Income (Freelance)
    console.log('\n3. Creating Income (Freelance)...');
    const incomeData = {
        type: 'INCOME',
        amount: 3000,
        category: 'Freelance',
        description: 'Ek is',
        paymentMethod: 'CASH',
        transactionDate: new Date().toISOString()
    };
    const incomeRes = await request('POST', '/transactions', incomeData, accessToken);
    let incomeId = '';
    if (incomeRes.status !== 201) {
        console.error('❌ Create Income Failed:', incomeRes.data);
    } else {
        console.log('✅ Income Created:', incomeRes.data.id);
        incomeId = incomeRes.data.id;
    }

    // 4. Update Income Amount
    console.log('\n4. Updating Income Amount (3000 -> 3500)...');
    if (incomeId) {
        const updateRes = await request('PATCH', `/transactions/${incomeId}`, { amount: 3500 }, accessToken);
        if (updateRes.status === 200) {
            console.log('✅ Update Successful. New Amount:', updateRes.data.amount);
        } else {
            console.error('❌ Update Failed:', updateRes.data);
        }
    }

    // 5. Delete Expense
    console.log('\n5. Deleting Expense...');
    if (expenseRes.status === 201) {
        const deleteRes = await request('DELETE', `/transactions/${expenseRes.data.id}`, null, accessToken);
        if (deleteRes.status === 200) {
            console.log('✅ Delete Successful');
        } else {
            console.error('❌ Delete Failed:', deleteRes.data);
        }
    }

    // 6. Get Summary Report
    console.log('\n6. Checking Financial Summary...');
    const today = new Date().toISOString().split('T')[0];
    const reportRes = await request('GET', `/reports/summary?startDate=${today}&endDate=${today}`, null, accessToken);
    if (reportRes.status === 200) {
        console.log('✅ Summary Retrieved:', JSON.stringify(reportRes.data, null, 2));
    } else {
        console.error('❌ Report Failed:', reportRes.data);
    }

    console.log('\n🏁 Verification Complete.');
}

runTest().catch(console.error);
