# Payment Information - Testing Guidelines

This document contains dummy payment information for testing purposes only. **These are not real payment credentials and should only be used for educational/testing purposes.**

## 🏦 Credit Card Testing Information

### Test Credit Card Numbers
Use these dummy credit card numbers for testing the payment system:

#### Visa Cards
- **Number**: 4111 1111 1111 1111
- **Expiry**: 12/27
- **CVV**: 123
- **Name**: John Doe

#### Mastercard
- **Number**: 5555 5555 5555 4444
- **Expiry**: 08/26
- **CVV**: 456
- **Name**: Jane Smith

#### American Express
- **Number**: 3782 822463 10005
- **Expiry**: 11/25
- **CVV**: 7890
- **Name**: Alex Johnson

### Testing Guidelines
- **Any expiry date in the future** will work for testing
- **Any 3-4 digit CVV** will be accepted
- **Any name** can be used
- The system will simulate successful payment processing

## 💳 PayPal Testing Information

### Test PayPal Account
- **Email**: testuser@example.com
- **Password**: testpass123

### Testing Flow
1. Select PayPal as payment method
2. Click "Pay with PayPal" button
3. System will simulate PayPal login/payment flow
4. Returns successful payment confirmation

## 🏧 Bank Wire Testing Information

### Test Bank Details
- **Bank Name**: Test Bank of Canada
- **Account Number**: 123456789
- **Transit Number**: 12345
- **Institution Number**: 123
- **Account Holder**: Test User

### Testing Flow
1. Select Bank Wire Transfer
2. Fill in bank details (any valid format)
3. System will simulate wire transfer initiation
4. Shows confirmation with reference number

## ⚠️ Important Notes

1. **Educational Purpose**: This application is for educational purposes only
2. **No Real Transactions**: No actual money will be processed
3. **Dummy Data**: All payment information is simulated
4. **Security**: In a real application, never store payment information in plain text
5. **PCI Compliance**: Real applications require proper PCI DSS compliance

## 🧪 Testing Scenarios

### Successful Payment
- Use any of the provided dummy credit card numbers
- Fill in valid expiry date and CVV
- Payment will be "processed" successfully

### Failed Payment Simulation
- Use credit card number: 4000 0000 0000 0002
- This will simulate a declined payment for testing error handling

### Network Error Simulation
- Use credit card number: 4000 0000 0000 0119
- This will simulate a network/processing error

---

**Remember**: This is a demo application for learning purposes. Never use real payment information in test environments! 