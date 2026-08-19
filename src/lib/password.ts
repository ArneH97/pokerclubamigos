import { randomInt } from "node:crypto";

const WOORDEN = [
  "aalst", "poker", "flop", "turn", "river", "fiche", "tafel", "amigo",
  "bluf", "kaart", "schoppen", "harten", "klaver", "ruiten", "dealer",
  "cash", "pot", "boter", "ajuin", "pint",
];

/**
 * Kort, uitspreekbaar wachtwoord dat je gerust via WhatsApp doorstuurt.
 * Bedoeld als startwachtwoord: het lid past het daarna zelf aan.
 */
export function tempPassword() {
  const a = WOORDEN[randomInt(WOORDEN.length)];
  const b = WOORDEN[randomInt(WOORDEN.length)];
  const n = randomInt(100, 1000);
  return `${a}-${b}-${n}`;
}
