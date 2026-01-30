import { Monster } from "../../../domain/models/Monster";

export interface MonsterRepositoryPort {
	getRandomMonsterTemplate(): Monster;
	getBossTemplate(): Monster;
}
