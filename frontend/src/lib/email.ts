// Email utilities
export const emailUtils = {
  validateEmail: (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },
  
  sendEmail: async (to: string, subject: string, body: string) => {
    // This would be handled by the backend in production
    console.log(`Email to: ${to}, Subject: ${subject}`);
    return { success: true };
  }
};

// Individual exports for API compatibility
export const sendVerificationEmail = async (to: string, code: string) => {
  console.log(`Sending verification email to: ${to}, Code: ${code}`);
  return { success: true, message: 'Verification email sent successfully' };
};

export const sendWelcomeEmail = async (to: string, name: string) => {
  console.log(`Sending welcome email to: ${to}, Name: ${name}`);
  return { success: true, message: 'Welcome email sent successfully' };
};

export default emailUtils;