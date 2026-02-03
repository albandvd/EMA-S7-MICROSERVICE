export class CreateSaveDto {
    userId: string;
    hero: {"id": string, "name": string, "class": string, "hp": number, "atk": number, "res": number, "speed": number, "gold": number, "inventory": string[]};
    dungeonId: string;
    currentRoomIndex: number;
    status: string;
}
