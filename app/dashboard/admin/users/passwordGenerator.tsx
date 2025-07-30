export function generatePassword(name: string, phoneNumber: string): string {
  // Clean name: remove spaces, special chars, and convert to lowercase
  const cleanName = name.toLowerCase().replace(/[^a-z0-9]/g, '');
  
  // Take only first 5 letters of the name (or all if name is shorter)
  const namePrefix = cleanName.substring(0, 5);
  
  // Get last 5 digits of phone number (or all if less than 5)
  const phoneDigits = phoneNumber.replace(/\D/g, '');
  const lastFiveDigits = phoneDigits.slice(-5);
  
  // Create password in format namePrefix@last5digits
  return `${namePrefix}@${lastFiveDigits}`;
}
