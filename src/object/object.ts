import {
	ActionType,
	DRP,
	type ResolveConflictsType,
	SemanticsType,
	type Vertex,
} from "@ts-drp/object";

export class ExampleDRPObject implements DRP {
	semanticsType = SemanticsType.pair;

	//constructor() {}

	resolveConflicts(_: Vertex[]): ResolveConflictsType {
		return {
			action: ActionType.Nop,
		};
	}
}
