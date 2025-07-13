
import { funnyTeamNames } from "@/assets/data/teamNames";

export function getRandomTeamName(usedNames: string[] = []): string {
    const available = funnyTeamNames.filter(name => !usedNames.includes(name));

    if (available.length === 0) {
        return 'Lag ${usedNames.length + 1}';
    }

    const randomIndex = Math.floor(Math.random() * available.length);
    return available[randomIndex];
}