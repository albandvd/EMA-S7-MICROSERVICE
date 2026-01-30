import { BattleStats } from "./BattleStats";

export interface Monster {
	id: string;
	name: string;
	stats: BattleStats;
}
