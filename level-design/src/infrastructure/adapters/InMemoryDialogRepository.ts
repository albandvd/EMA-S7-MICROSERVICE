import { DialogRepositoryPort } from "../../application/ports/outbound/DialogRepositoryPort";

const DIALOGS = [
	"Une odeur de souffre flotte dans l'air.",
	"Vous entendez des bruits de pas au loin.",
	"Il fait sombre et humide ici.",
	"Des toiles d'araignées recouvrent les murs.",
	"Le silence est pesant.",
	"Une torche vacille sur le mur.",
];

export class InMemoryDialogRepository implements DialogRepositoryPort {
	getRandomDialogue(): string {
		const randomIndex = Math.floor(Math.random() * DIALOGS.length);
		return DIALOGS[randomIndex];
	}
}
