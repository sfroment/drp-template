import {
	ActionType,
	DRP,
	type ResolveConflictsType,
	SemanticsType,
	type Vertex,
} from "@ts-drp/object";

import { getColorForPeerId } from "../utils/colors";

type Insert = {
	peerId: string;
	content: string;
	color: string;
};

export class ExampleDRPObject implements DRP {
	semanticsType = SemanticsType.pair;

	private _inserts: Insert[] = [];

	constructor() {
		this._inserts = [];
	}

	insert(peerId: string, index: number, content: string) {
		if (content.length === 0) return;

		this._inserts.splice(index, 0, {
			peerId,
			content,
			color: getColorForPeerId(peerId),
		});
	}

	delete(index: number, length: number) {
		this._inserts.splice(index, length);
	}

	// insert -> first
	// insert -> delete
	// insert -> insert
	// insert the insert hisght peerID 1st
	// delete the delete highest peerID 1st
	resolveConflicts(vertices: Vertex[]): ResolveConflictsType {
		if (vertices.length <= 1 || vertices[0].hash === vertices[1].hash) {
			return { action: ActionType.Nop };
		}

		const opInsert = "insert";
		const opDelete = "delete";

		const left = vertices[0];
		const right = vertices[1];
		const leftOp = left.operation?.opType;
		const rightOp = right.operation?.opType;

		if (leftOp === rightOp) {
			const leftPeerId = left.peerId;
			const rightPeerId = right.peerId;
			if (leftPeerId > rightPeerId) {
				return { action: ActionType.Swap };
			}
			return { action: ActionType.Nop };
		}

		if (leftOp === opDelete && rightOp === opInsert) {
			return { action: ActionType.Swap };
		}

		console.log("resolveConflicts5\n");
		return { action: ActionType.Nop };
	}

	query_insert(): Insert[] {
		return this._inserts;
	}

	query_text(): string {
		return this._inserts.map((insert) => insert.content).join("");
	}
}
