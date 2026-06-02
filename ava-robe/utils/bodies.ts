export type BodyType = {
	id: string;
	name: string;
	model: any;
};

export const bodies: Record<string, BodyType> = {
	default: {
		id: "default",
		name: "Girl",
		model: require("../assets/models/body.glb"),
	},
	// Add "man" entry here once the standard-size man VRM is exported and copied
	// into assets/models/. The man should be the SAME size as the girl so the
	// hair models still sit on top of the head correctly.
};

export function getBody(id: string | null | undefined): BodyType {
	if (!id) return bodies.default;
	return bodies[id] ?? bodies.default;
}

export function getBodyList(): BodyType[] {
	return Object.values(bodies);
}
