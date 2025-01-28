import { DRPNode } from "@ts-drp/node";

import {
	createDRPButton,
	drpIdInput,
	drpObjectElement,
	joinDRPButton,
} from "./elements";
import { ExampleDRPObject } from "./object/object";
import { renderDiscoveryPeers, renderDRP, renderPeers } from "./render";
import { renderDialableMultiaddr } from "./render";
import { renderPeerID } from "./render";
import { drpState, saveSelection } from "./shared";

let isOurInput = false;

async function joinHandler(node: DRPNode) {
	drpState.drpID = drpIdInput.value;
	if (!drpState.drpID) return;

	const drpObject = await node.connectObject({
		drp: new ExampleDRPObject(),
		id: drpState.drpID,
	});

	drpState.drp = drpObject.drp as ExampleDRPObject;
	drpObject.subscribe(() => {
		if (isOurInput) return;

		renderDRP(true);
	});

	renderDRP(true);
}

async function connectHandler(node: DRPNode) {
	drpState.drpID = drpIdInput.value;
	if (!drpState.drpID) return;

	const drpObject = await node.createObject({
		id: drpState.drpID,
		drp: new ExampleDRPObject(),
	});

	drpState.drp = drpObject.drp as ExampleDRPObject;
	drpObject.subscribe(() => {
		if (isOurInput) return;

		renderDRP(true);
	});
}

function insertHandler(peerId: string, index: number, content: string) {
	if (!drpState.drp || drpState.isRendering || content.length === 0) return;
	drpState.drp.insert(peerId, index, content);

	renderDRP();
}

async function main() {
	drpObjectElement.textContent = "";

	const node = new DRPNode({
		network_config: {
			...(import.meta.env.VITE_BOOTSTRAP_PEERS
				? {
						bootstrap_peers: [import.meta.env.VITE_BOOTSTRAP_PEERS],
					}
				: {}),
			browser_metrics: true,
		},
	});

	await node.start();
	await node.networkNode.isDialable();
	renderPeerID(node);
	setInterval(async () => {
		renderDialableMultiaddr(node);
		renderPeers(node);
		renderDiscoveryPeers(node, drpState.drpID);
		if (await node.networkNode.isDialable()) {
			joinDRPButton.disabled = false;
			createDRPButton.disabled = false;
		}
	}, 1000);

	joinDRPButton.onclick = () => joinHandler(node);
	createDRPButton.onclick = () => connectHandler(node);
	drpObjectElement.addEventListener("input", () => {
		const selection = saveSelection(drpObjectElement);
		if (!selection) return;

		isOurInput = true;
		insertHandler(
			node.networkNode.peerId,
			selection.start - 1,
			drpObjectElement.textContent?.slice(
				selection.start - 1,
				selection.start,
			) || "",
		);
		isOurInput = false;
	});

	drpObjectElement.onpaste = (e: ClipboardEvent) => {
		e.preventDefault();
		const pastedText = e.clipboardData?.getData("text/plain") || "";
		if (pastedText.length === 0) return;

		const selection = saveSelection(drpObjectElement);
		if (!selection) return;

		isOurInput = true;
		for (let i = 0; i < pastedText.length; i++) {
			insertHandler(
				node.networkNode.peerId,
				selection.start + i,
				pastedText[i],
			);
		}
		renderDRP(true, {
			start: selection.start + pastedText.length,
			end: selection.start + pastedText.length,
		});
		isOurInput = false;
	};

	drpObjectElement.onkeydown = (e: KeyboardEvent) => {
		if (e.key === "Enter") {
			e.preventDefault();

			const selection = saveSelection(drpObjectElement);
			if (!selection) return;

			isOurInput = true;
			insertHandler(node.networkNode.peerId, selection.start, "\n");
			renderDRP(
				true,
				selection
					? { start: selection.start + 1, end: selection.start + 1 }
					: { start: 1, end: 1 },
			);
			isOurInput = false;
		}
		if (e.key === "Delete") {
			e.preventDefault();

			const selection = saveSelection(drpObjectElement);
			if (!selection) return;

			if (
				selection.start === selection.end &&
				selection.end === drpState.drp?.query_text().length
			)
				return;

			isOurInput = true;
			let length = selection.end - selection.start;
			let deleteIndex = selection.start;
			if (length === 0) {
				deleteIndex = selection.end;
				length = 1;
			}
			drpState.drp?.delete(deleteIndex, length);
			renderDRP(true, {
				start: selection.start,
				end: selection.start,
			});
			isOurInput = false;
		}
		if (e.key === "Backspace") {
			e.preventDefault();

			const selection = saveSelection(drpObjectElement);
			if (!selection) return;
			if (selection.start === 0 && selection.end === 0) return;

			isOurInput = true;
			let length = selection.end - selection.start;
			let deleteIndex = selection.start;
			if (length === 0) {
				length = 1;
				deleteIndex = selection.start - 1;
			}

			drpState.drp?.delete(deleteIndex, length);

			renderDRP(
				true,
				selection
					? { start: selection.start - length, end: selection.end - length }
					: { start: 0, end: 0 },
			);
			isOurInput = false;
		}
	};
}

main().catch((e) => console.error("::main error", e));
