// Spoiler-free result text: word lengths as blocks, never the letters.

export function shareText({ name, number, lengths, left, par, url }) {
  const blocks = lengths.map((n) => "▮".repeat(n)).join(" ");
  return [`${name} #${number}`, blocks, `${left} left (par ${par})`, url].join("\n");
}

const WORDS = ["none", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve", "thirteen", "fourteen", "fifteen"];

export function numberWord(n, capital = false) {
  const w = WORDS[n] ?? String(n);
  return capital ? w[0].toUpperCase() + w.slice(1) : w;
}

// "Two left. Par was one." / "One left. That's par."
export function resultLine(left, par) {
  if (left === par) return `${numberWord(left, true)} left. That's par.`;
  return `${numberWord(left, true)} left. Par was ${numberWord(par)}.`;
}
