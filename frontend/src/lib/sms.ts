// SMS utilities
export const smsUtils = {
  validatePhone: (phone: string) => {
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone);
  },
  
  sendSMS: async (to: string, message: string) => {
    // This would be handled by the backend in production
    console.log(`SMS to: ${to}, Message: ${message}`);
    return { success: true };
  }
};

// Individual exports for API compatibility
export const validatePhoneNumber = (phone: string) => {
  const isValid = smsUtils.validatePhone(phone);
  return {
    valid: isValid,
    message: isValid ? 'Phone number is valid' : 'Invalid phone number format'
  };
};

export const sendVerificationSMS = async (to: string, code: string) => {
  console.log(`Sending verification SMS to: ${to}, Code: ${code}`);
  return { success: true, message: 'Verification SMS sent successfully' };
};

export const sendWelcomeSMS = async (to: string, name: string) => {
  console.log(`Sending welcome SMS to: ${to}, Name: ${name}`);
  return { success: true };
};

export default smsUtils;