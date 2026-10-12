import { getS3Config } from '../worker/app/env.js';
import { getOrRefreshToken, mapOrderToS3Payload, syncCustomerToS3 } from '../worker/services/s3Service.js';

async function debug400() {
  const config = getS3Config({});
  const token = await getOrRefreshToken(config);

  const testOrder = {
    orderId: 'TEST_' + Date.now().toString().slice(-8),
    customer: {
      name: 'Nguyễn Thành Danh',
      phone: '0901234567',
      address: '71 Trạng Trình, Đà Lạt'
    },
    items: [
      {
        sku: 'RILASTIL-D-CLAR',
        name: 'Serum Mờ Nám Rilastil D-Clar 30ml',
        quantity: 1,
        price: 1150000
      }
    ],
    subtotal: 1150000,
    discountAmount: 0,
    total: 1150000,
    paymentMethod: 'bank_transfer'
  };

  const customerId = await syncCustomerToS3({
    customer: testOrder.customer,
    token,
    config
  });
  console.log('Customer ID:', customerId);

  const payload = mapOrderToS3Payload(testOrder, config, customerId);
  console.log('Payload being sent:\n', JSON.stringify(payload, null, 2));

  const res = await fetch('https://m.present.es3.vn/Vision/AddNewPreOrder/v2', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(payload)
  });
  console.log('Status:', res.status);
  console.log('Response body:', await res.text());
}

debug400();
