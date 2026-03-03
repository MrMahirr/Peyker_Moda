const http = require('http');
const fs = require('fs');

// Configuration
const CONFIG = {
    hostname: 'localhost',
    port: 3001,
    email: 'admin@peyker.com',
    password: 'admin123'
};

let accessToken = '';

function request(method, path, body = null, token = null, isBinary = false) {
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
            if (isBinary) {
                const chunks = [];
                res.on('data', chunk => chunks.push(chunk));
                res.on('end', () => {
                    const buffer = Buffer.concat(chunks);
                    resolve({ status: res.statusCode, headers: res.headers, data: buffer });
                });
            } else {
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
            }
        });

        req.on('error', (e) => reject(e));

        if (body) {
            req.write(JSON.stringify(body));
        }
        req.end();
    });
}

async function runTest() {
    console.log('🧪 Starting Invoices Module Verification...\n');

    // 1. Login
    console.log('1. Logging in...');
    const loginRes = await request('POST', '/auth/login', { email: CONFIG.email, password: CONFIG.password });
    if (loginRes.status !== 201 && loginRes.status !== 200) {
        console.error('❌ Login Failed:', loginRes.data);
        process.exit(1);
    }
    accessToken = loginRes.data.data.accessToken;
    console.log('✅ Login Successful\n');

    // 2. Fetch/Create Order
    console.log('2. Preparing Order...');
    let orderId = '';

    // First, get a product variant to order
    console.log('   Fetching products to find a variant...');
    const productsRes = await request('GET', '/products', null, accessToken);
    let variantId = '';

    // Handle nested data structure from pagination
    const productList = productsRes.data.data?.data || productsRes.data.data || [];

    if (productList.length > 0) {
        // Find a product with variants
        for (const product of productList) {
            if (product.variants && product.variants.length > 0) {
                variantId = product.variants[0].id;
                console.log(`   ✅ Found Variant: ${variantId} (Product: ${product.name})`);
                break;
            }
        }
    }

    if (!variantId) {
        console.log('⚠️ No variants found via products list. Trying direct variant list...');
        console.log('DEBUG: Products Response:', JSON.stringify(productsRes.data, null, 2));
        // Fallback: try to guess or use a known seed variant if failed
        // For now, fail if no variant
        console.error('❌ No variants found. Cannot create order.');
        process.exit(1);
    }

    // Create Order
    console.log('   Creating Dummy Order...');
    const orderData = {
        items: [
            {
                variantId: variantId,
                quantity: 1,
                unitPrice: 100 // Dummy price
            }
        ]
        // customerId optional
    };

    const createOrderRes = await request('POST', '/orders', orderData, accessToken);
    if (createOrderRes.status === 201) {
        orderId = createOrderRes.data.id; // API returns the order object
        if (!orderId && createOrderRes.data.data) orderId = createOrderRes.data.data.id; // Handling wrapper if any

        console.log(`✅ Order Created: ${createOrderRes.data.orderNumber} (ID: ${orderId})`);
    } else {
        console.error('❌ Order Creation Failed:', createOrderRes.data);
        process.exit(1);
    }

    if (!orderId) {
        console.error('❌ Order ID is missing in response');
        process.exit(1);
    }


    // 3. Create Invoice
    console.log(`\n3. Creating Invoice for Order ${orderId}...`);
    const invoiceRes = await request('POST', '/invoices', {
        orderId: orderId,
        taxId: '1234567890',
        taxOffice: 'Maslak VD'
    }, accessToken);

    let invoiceId = '';
    if (invoiceRes.status === 201) {
        const invoiceData = invoiceRes.data.data || invoiceRes.data;
        console.log('✅ Invoice Created:', invoiceData.invoiceNo);
        invoiceId = invoiceData.id;
    } else if (invoiceRes.status === 400 && invoiceRes.data.message && invoiceRes.data.message.includes('zaten fatura oluşturulmuş')) {
        console.log('⚠️ Invoice already exists for this order.');
        process.exit(1); // Should not happen with new order
    } else {
        console.error('❌ Invoice Creation Failed:', invoiceRes.data);
    }

    // 4. Download PDF
    if (invoiceId) {
        console.log(`\n4. Downloading PDF for Invoice ${invoiceId}...`);
        const pdfRes = await request('GET', `/invoices/${invoiceId}/pdf`, null, accessToken, true);

        if (pdfRes.status === 200 && pdfRes.headers['content-type'] === 'application/pdf') {
            console.log(`✅ PDF Downloaded. Size: ${pdfRes.data.length} bytes`);
        } else {
            console.error('❌ PDF Download Failed:', pdfRes.status);
        }
    } else {
        console.log('⏭️ Skipping PDF test due to missing invoice ID.');
    }

    console.log('\n🏁 Verification Complete.');
}

runTest().catch(console.error);
