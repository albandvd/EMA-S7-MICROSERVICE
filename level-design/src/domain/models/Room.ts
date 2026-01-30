import { Monster } from "./Monster";

export interface Room {
	id: string;
	index: number;
	dialogue: string;
	monster: Monster | null;
	nextRoomIds: string[];
}
