export const generateRoleId = (role: string): string => {
    const validRoles = ["DIV", "DIST", "STAT", "BM"];
    if (!validRoles.includes(role)) {
      throw new Error("Invalid role type for roleId generation");
    }
    const randomDigits = Math.floor(100 + Math.random() * 900); // Generates a 3-digit number
    return `${role}${randomDigits}`;
  };