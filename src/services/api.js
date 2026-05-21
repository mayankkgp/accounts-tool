/**
 * Service API layer entrypoint for Fabrito B2B Operations.
 * Integrates live third-party routing such as PIN Code lookup APIs.
 */

/**
 * Fetches Location metadata (City and State) based on a 6-digit Indian Postal PIN code.
 * @param {string} pin - 6-digit PIN code.
 * @returns {Promise<{ city: string; state: string } | null>}
 */
export async function fetchLocationByPin(pin) {
  if (!pin || pin.trim().length !== 6) return null;
  try {
    const res = await fetch(`https://api.postalpincode.in/pincode/${pin.trim()}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (data && data[0] && data[0].Status === "Success" && data[0].PostOffice && data[0].PostOffice[0]) {
      const po = data[0].PostOffice[0];
      return {
        city: po.District || "",
        state: po.State ? po.State.toUpperCase() : ""
      };
    }
  } catch (err) {
    console.error("Live PIN lookup error:", err);
  }
  return null;
}
