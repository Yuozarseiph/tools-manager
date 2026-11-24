/** Generate a password with unbiased, cryptographically secure randomness. */
export type PasswordSets = {
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
};

const ALPHABETS: Record<keyof PasswordSets, string> = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+~`|}{[]:;?><,./-=",
};

function secureIndex(range: number): number {
  if (!Number.isSafeInteger(range) || range < 1 || range > 0x100000000) {
    throw new Error("Invalid random range");
  }
  if (typeof crypto === "undefined" || typeof crypto.getRandomValues !== "function") {
    throw new Error("Secure randomness is unavailable");
  }
  const limit = Math.floor(0x100000000 / range) * range;
  const buffer = new Uint32Array(1);
  let value: number;
  do {
    crypto.getRandomValues(buffer);
    value = buffer[0];
  } while (value >= limit);
  return value % range;
}

export function generateSecurePassword(length: number, options: PasswordSets): string {
  if (!Number.isInteger(length) || length < 4 || length > 64) {
    throw new Error("Invalid password length");
  }
  const selected = (Object.keys(ALPHABETS) as (keyof PasswordSets)[])
    .filter((key) => options[key])
    .map((key) => ALPHABETS[key]);
  if (selected.length === 0) return "";
  if (selected.length > length) throw new Error("Password shorter than required sets");
  const pool = selected.join("");
  const chars = selected.map((set) => set[secureIndex(set.length)]);
  while (chars.length < length) chars.push(pool[secureIndex(pool.length)]);
  // Fisher–Yates shuffle, also sourced from a CSPRNG.
  for (let i = chars.length - 1; i > 0; i--) {
    const j = secureIndex(i + 1);
    [chars[i], chars[j]] = [chars[j], chars[i]];
  }
  return chars.join("");
}
