import {
	ActionType,
	DRP,
	type ResolveConflictsType,
	SemanticsType,
	type Vertex,
} from "@ts-drp/object";
import { getColorForPeerId } from "../utils/colors";

type Insert = {
	content: string;
	color: string;
}

export class ExampleDRPObject implements DRP {
	semanticsType = SemanticsType.pair;

	private _insert: Insert[];

	constructor() {
		this._insert = [];
	}

	insert(peerId: string, index: number, content:string) {
		if (content.length === 0) return;

		this._insert.splice(index, 0, {
			content,
			color: getColorForPeerId(peerId),
		});
	}

	delete(index: number, length: number) {
		this._insert.splice(index, length);
	}

	query_insert(): Insert[] {
		return this._insert;
	}

	query_text(): string {
		return this._insert.map((insert) => insert.content).join("");
	}

	resolveConflicts(vertices: Vertex[]): ResolveConflictsType {
		if (vertices.length <= 1 && vertices[0].hash === vertices[1].hash) {
			return {
				action: ActionType.Nop,
			};
		}

		const left = vertices[0];
		const right = vertices[1];
		const leftOp = left.operation?.opType;
		const rightOp = right.operation?.opType;

		if (leftOp === rightOp) {
			if (left.peerId< right.peerId) {
				return {
					action: ActionType.Swap,
				};
			}

			return {
				action: ActionType.Nop,
			};
		}

		if (leftOp === "delete" && rightOp === "insert") {
			return {
				action: ActionType.Swap,
			};
		}

		return {
			action: ActionType.Nop,
		};
	}
}
