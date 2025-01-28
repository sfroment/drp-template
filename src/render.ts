import type { DRPNode } from "@ts-drp/node";

import {
	dialableMultiaddrElement,
	discoveryPeersElement,
	discoveryPeersList,
	drpObjectElement,
	multiAddrList,
	peerIdElement,
	peersElement,
	peersList,
} from "./elements";
import {
	drpState,
	restoreSelection,
	SavedSelection,
	saveSelection,
} from "./shared";

export function renderPeerID(node: DRPNode) {
	peerIdElement.innerText = node.networkNode.peerId;
}

export function renderDialableMultiaddr(node: DRPNode) {
	const multiaddr = node.networkNode.getMultiaddrs() || [];

	// Set up the count display and click handler
	dialableMultiaddrElement.innerText = `${multiaddr.length} addresses`;
	dialableMultiaddrElement.onclick = () => {
		multiAddrList.style.display =
			multiAddrList.style.display === "none" ? "block" : "none";
	};

	// Populate the list
	multiAddrList.innerHTML = "";
	for (const addr of multiaddr) {
		const li = document.createElement("li");
		li.innerText = addr;
		multiAddrList.appendChild(li);
	}
}

export function renderPeers(node: DRPNode) {
	const peers = node.networkNode.getAllPeers();

	// Set up the count display and click handler
	peersElement.innerText = `${peers.length} peers`;
	peersElement.onclick = () => {
		peersList.style.display =
			peersList.style.display === "none" ? "block" : "none";
	};

	// Populate the list
	peersList.innerHTML = "";
	for (const peer of peers) {
		const li = document.createElement("li");
		li.innerText = peer;
		peersList.appendChild(li);
	}
}

export function renderDiscoveryPeers(node: DRPNode, drpID: string) {
	if (!drpID) {
		discoveryPeersElement.innerText = "0 discovery peers";
		discoveryPeersList.innerHTML = "";
		return;
	}

	const discoveryPeers = node.networkNode.getGroupPeers(drpID);

	// Set up the count display and click handler
	discoveryPeersElement.innerText = `${discoveryPeers.length} discovery peers`;
	discoveryPeersElement.onclick = () => {
		discoveryPeersList.style.display =
			discoveryPeersList.style.display === "none" ? "block" : "none";
	};

	// Populate the list
	discoveryPeersList.innerHTML = "";
	for (const peer of discoveryPeers) {
		const li = document.createElement("li");
		li.innerText = peer;
		discoveryPeersList.appendChild(li);
	}
}

function renderDRPContent() {
	const insert = drpState.drp?.query_insert();
	const content = insert
		?.map((i) => `<span style="color: ${i.color}">${i.content}</span>`)
		.join("");
	drpObjectElement.innerHTML = content || "";
}

export function renderDRP(
	restoreSelectionOption: boolean = true,
	selection: SavedSelection | null = null,
) {
	if (drpState.isRendering) return;

	drpState.isRendering = true;
	let currentSelection = selection;
	if (restoreSelectionOption && !selection) {
		currentSelection = saveSelection(drpObjectElement);
	}
	renderDRPContent();
	if (restoreSelectionOption) {
		restoreSelection(drpObjectElement, currentSelection);
	}

	drpState.isRendering = false;
}
