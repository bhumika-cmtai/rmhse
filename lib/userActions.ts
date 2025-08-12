import axios, { AxiosError } from "axios";
import { User } from "./redux/authSlice"; // Make sure the User interface is exported
import Cookies from "js-cookie"; // Import Cookies for authentication

/**
 * Generates a member ID in the format RMHSEddMMyy.
 * @returns {string} The generated member ID.
 */
// export const generateMemberId = (): string => {
//   const today = new Date();
//   const day = String(today.getDate()).padStart(2, '0');
//   const month = String(today.getMonth() + 1).padStart(2, '0');
//   const year = String(today.getFullYear()).slice(-2);
//   return `RMHSE${day}${month}${year}`;
// };

/**
 * Fetches 'DIV' users, checks their current referral count against their limit,
 * and randomly selects one eligible user to be the referrer.
 * @returns {Promise<string>} The latest roleId of a randomly selected, eligible referrer.
 * @throws {Error} If no eligible referrers can be found.
 */
export const assignRefferer = async (role: string): Promise<string> => {
  try {
    // const token = Cookies.get('auth-token');
    // if (!token) {
    //     throw new Error("Authentication session expired. Please log in again.");
    // }

    // 1. Fetch ALL potential 'DIV' users. Use a high limit to avoid pagination issues.
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getAllUsers?role=${role}&limit=1000`);

    if (response.status !== 200 || !response.data.data.users || response.data.data.users.length === 0) {
      throw new Error("Could not find any available DIV referrers at this time.");
    }

    const divUsers: User[] = response.data.data.users;

    // 2. Fetch the current referral count for EACH 'DIV' user in parallel.
    const countPromises = divUsers.map(user => 
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/referral-count/${user._id}`
            // headers: { 'Authorization': `Bearer ${token}` }
        ).then(res => ({
            user, // Keep the original user object
            count: res.data.data.count as number // Get the count from the response
        })).catch(err => {
            console.error(`Failed to get count for user ${user._id}:`, err);
            return { user, count: Infinity }; // Exclude users if their count check fails
        })
    );
    
    const usersWithCounts = await Promise.all(countPromises);

    // 3. Filter this list to find only those who are below their referral limit.
    const eligibleReferrers = usersWithCounts.filter(item => {
      const limit = item.user.limit || 25; // Use 25 as a fallback limit
      return item.count < limit;
    });

    // 4. Check if any eligible referrers remain.
    if (eligibleReferrers.length === 0) {
      throw new Error("All available referrers have reached their capacity. Please contact support.");
    }

    // 5. Randomly select one user from the *eligible* list.
    const randomIndex = Math.floor(Math.random() * eligibleReferrers.length);
    const chosenReferrer = eligibleReferrers[randomIndex].user;

    // 6. Ensure the selected eligible user has a roleId and return the latest one.
    if (!chosenReferrer.roleId || chosenReferrer.roleId.length === 0) {
        console.error("The chosen eligible referrer is missing a roleId:", chosenReferrer);
        throw new Error("A data integrity error occurred while assigning a referrer.");
    }

    const latestRoleId = chosenReferrer.roleId[chosenReferrer.roleId.length - 1];
    return latestRoleId;

  } catch (error) {
    // This will catch errors from any of the steps above.
    const axiosError = error as AxiosError;
    const message = (error as Error).message || axiosError.message || "An unknown error occurred while assigning a referrer.";
    console.error("Error in assignReferrer:", message);
    throw new Error(message);
  }
};

export const generateRoleId = (role: string): string => { 
  const validRoles = ["MEM", "DIV", "DIST", "STAT", "BM"]; 
  if (!validRoles.includes(role)) { 
    throw new Error("Invalid role type for roleId generation"); 
  } 
  const timestamp = Date.now();
  return `${role}${timestamp}`; 
};