# Check with Twilio Support

The toll-free embeddable might require special account access or approvals.

## Questions to Ask Twilio Support:

1. **Is my account enabled for the Toll-Free Verification Compliance Embeddable?**
   - Account SID: YOUR_TWILIO_ACCOUNT_SID
   - We're getting Error 400 from the Persona iframe

2. **Does toll-free embeddable require ISV-specific configuration?**
   - We're successfully calling the API: `/ComplianceInquiries/Tollfree/Initialize`
   - Getting valid `inquiry_id` and `inquiry_session_token`
   - But the embed UI shows "Error 400"

3. **Are there any account-level restrictions or approvals needed?**

## What's Working:
- ✅ Backend API call succeeds
- ✅ Returns valid inquiry_id and inquiry_session_token
- ✅ Phone number +18336855187 has no existing verification

## What's Failing:
- ❌ Persona embed iframe shows "Error 400"
- Error happens when TwilioComplianceEmbed component loads

## Contact Twilio:
- Support: https://support.twilio.com
- Or through your account manager if you have one
