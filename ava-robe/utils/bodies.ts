export type BodyType = {
	id: string;
	name: string;
	model: any;
	scale?: number;
};

export const bodies: Record<string, BodyType> = {
	default: {
		id: "default",
		name: "Girl",
		model: require("../assets/models/body.glb"),
	},
	boy: {
		id: "boy",
		name: "Boy",
		model: require("../assets/models/standard-boy-body.glb"),
		scale: 0.85,
	},
};

export function getBody(id: string | null | undefined): BodyType {
	if (!id) return bodies.default;
	return bodies[id] ?? bodies.default;
}

export function getBodyList(): BodyType[] {
	return Object.values(bodies);
}
