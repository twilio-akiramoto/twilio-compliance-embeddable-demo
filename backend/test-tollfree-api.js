const { client } = require('./config/twilio');

async function testAPI() {
  try {
    console.log('Testing complianceTollfreeInquiries API...');
    
    const response = await client.trusthub.v1.complianceTollfreeInquiries
      .create({
        tollfreePhoneNumber: '+18005551234',
        notificationEmail: 'test@example.com',
        businessName: 'Test Business'
      });
    
    console.log('\n✅ Response received:');
    console.log('Inquiry ID:', response.inquiryId);
    console.log('Inquiry Session Token:', response.inquirySessionToken ? 'Present' : 'MISSING');
    console.log('Registration ID:', response.registrationId);
    console.log('URL:', response.url);
    console.log('\nFull response:', JSON.stringify(response, null, 2));
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('Details:', error);
  }
}

testAPI();
