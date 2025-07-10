import challenges from '@/assets/data/challenges.json';

export function getRandomChallenges(n: number) {
  const filtered = challenges.filter(c => c.title && c.description);

  // Shuffle med Fisher–Yates
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, n);
}
