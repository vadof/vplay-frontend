import {ILevel} from "../models/clicker/ILevel";

export const numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 2,
});

export function calculateLevelProgress(currentLevel: number, userNetWorth: number, levels: ILevel[]): number {
  let percent: number = 100;
  if (currentLevel < 10 && levels.length > 0) {
    const currentLevelNetWorth: number = levels[currentLevel - 1].netWorth;
    const nextLevelNetWorth: number = levels[currentLevel].netWorth;
    percent = (userNetWorth - currentLevelNetWorth) / (nextLevelNetWorth - currentLevelNetWorth) * 100;
  }
  return percent;
}

export function getLevelColor(level: number): string {
  switch (level) {
    case 1: return 'linear-gradient(133deg,#ffae50 5.47%,#994330 97.66%)'
    case 2: return 'linear-gradient(133deg,#7995be 5.47%,#8c96a6 97.66%)'
    case 3: return 'linear-gradient(133deg,#ffac2f 5.47%,#ffc34f 97.66%)'
    case 4: return 'linear-gradient(133deg,#79aabe 5.47%,#8f8ca6 97.66%)'
    case 5: return 'linear-gradient(126deg,#2ef2ff 30.31%,#0d16ff 92.09%)'
    case 6: return 'linear-gradient(133deg,#5768ff 18.37%,#ff67f9 88.58%)'
    case 7: return 'linear-gradient(133deg,#73eeff 18.37%,#00c092 88.58%)'
    case 8: return 'linear-gradient(139deg,#0f44ff 26.58%,#29ffd9 75.09%)'
    case 9: return 'linear-gradient(131deg,#6889ff 12.82%,#0c15ff 95.77%)'
    case 10: return 'linear-gradient(135deg, rgba(31,26,26,1) 0%, rgba(228,7,7,1) 50%, rgba(31,26,26,1) 100%)'
  }
  return '';
}

export function getLevelColorByName(name: string): string {
  switch (name) {
    case 'Bronze': return 'linear-gradient(133deg,#ffae50 5.47%,#994330 97.66%)'
    case 'Silver': return 'linear-gradient(133deg,#7995be 5.47%,#8c96a6 97.66%)'
    case 'Gold': return 'linear-gradient(133deg,#ffac2f 5.47%,#ffc34f 97.66%)'
    case 'Platinum': return 'linear-gradient(133deg,#79aabe 5.47%,#8f8ca6 97.66%)'
    case 'Diamond': return 'linear-gradient(126deg,#2ef2ff 30.31%,#0d16ff 92.09%)'
    case 'Epic': return 'linear-gradient(133deg,#5768ff 18.37%,#ff67f9 88.58%)'
    case 'Legendary': return 'linear-gradient(133deg,#73eeff 18.37%,#00c092 88.58%)'
    case 'Master': return 'linear-gradient(139deg,#0f44ff 26.58%,#29ffd9 75.09%)'
    case 'Grandmaster': return 'linear-gradient(131deg,#6889ff 12.82%,#0c15ff 95.77%)'
    case 'Immortal': return 'linear-gradient(135deg, rgba(31,26,26,1) 0%, rgba(228,7,7,1) 50%, rgba(31,26,26,1) 100%)'
  }
  return '';
}
