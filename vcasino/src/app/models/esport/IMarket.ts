export interface IMarket {
  id: number;
  outcome: number;
  outcomeStr: string;
  oddsStr: string | undefined
  odds: number;
  closed: boolean;
  mapNumber: number | null;
  participant: number | null;
  type: string;
  oddsIncreased: boolean | undefined;
}
