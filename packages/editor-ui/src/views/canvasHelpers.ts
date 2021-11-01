import { INodeUi, IZoomConfig, XYPosition } from "@/Interface";
import { Connection } from "jsplumb";

export const OVERLAY_DROP_NODE_ID = 'drop-add-node';
export const OVERLAY_MIDPOINT_ARROW_ID = 'midpoint-arrow';
export const OVERLAY_ENDPOINT_ARROW_ID = 'endpoint-arrow';
export const OVERLAY_RUN_ITEMS_ID = 'output-items-label';
export const OVERLAY_CONNECTION_ACTIONS_ID = 'connection-actions';
export const JSPLUMB_FLOWCHART_STUB = 26;

const _MIN_X_TO_SHOW_OUTPUT_LABEL = 90;
const _MIN_Y_TO_SHOW_OUTPUT_LABEL = 100;

interface ICorners {
	minX: number;
	minY: number;
	maxX: number;
	maxY: number;
}

export const getLeftmostTopNode = (nodes: INodeUi[]): INodeUi => {
	return nodes.reduce((leftmostTop, node) => {
		if (node.position[0] > leftmostTop.position[0] || node.position[1] > leftmostTop.position[1]) {
			return leftmostTop;
		}

		return node;
	});
};

export const getWorkflowCorners = (nodes: INodeUi[]): ICorners => {
	return nodes.reduce((accu: ICorners, node: INodeUi) => {
		if (node.position[0] < accu.minX) {
			accu.minX = node.position[0];
		}
		if (node.position[1] < accu.minY) {
			accu.minY = node.position[1];
		}
		if (node.position[0] > accu.maxX) {
			accu.maxX = node.position[0];
		}
		if (node.position[1] > accu.maxY) {
			accu.maxY = node.position[1];
		}

		return accu;
	}, {
		minX: nodes[0].position[0],
		minY: nodes[0].position[1],
		maxX: nodes[0].position[0],
		maxY: nodes[0].position[1],
	});
};

export const scaleSmaller = ({scale, offset: [xOffset, yOffset]}: IZoomConfig): IZoomConfig => {
	scale /= 1.25;
	xOffset /= 1.25;
	yOffset /= 1.25;
	xOffset += window.innerWidth / 10;
	yOffset += window.innerHeight / 10;

	return {
		scale,
		offset: [xOffset, yOffset],
	};
};

export const scaleBigger = ({scale, offset: [xOffset, yOffset]}: IZoomConfig): IZoomConfig => {
	scale *= 1.25;
	xOffset -= window.innerWidth / 10;
	yOffset -= window.innerHeight / 10;
	xOffset *= 1.25;
	yOffset *= 1.25;

	return {
		scale,
		offset: [xOffset, yOffset],
	};
};

export const scaleReset = (config: IZoomConfig): IZoomConfig => {
	if (config.scale > 1) { // zoomed in
		while (config.scale > 1) {
			config = scaleSmaller(config);
		}
	}
	else {
		while (config.scale < 1) {
			config = scaleBigger(config);
		}
	}

	config.scale = 1;

	return config;
};

export const showOverlay = (connection: Connection, overlayId: string) => {
	const arrow = connection.getOverlay(overlayId);
	if (arrow) {
		arrow.setVisible(true);
	}
};

export const hideOverlay = (connection: Connection, overlayId: string) => {
	const arrow = connection.getOverlay(overlayId);
	if (arrow) {
		arrow.setVisible(false);
	}
};

export const showOrHideMidpointArrow = (connection: Connection) => {
	const hasItemsLabel = !!connection.getOverlay(OVERLAY_RUN_ITEMS_ID);

	const sourceEndpoint = connection.endpoints[0];
	const targetEndpoint = connection.endpoints[1];

	const sourcePosition = sourceEndpoint.anchor.lastReturnValue[0];
	const targetPosition = targetEndpoint.anchor.lastReturnValue[0];

	const minimum = hasItemsLabel ? 150 : 0;
	const isBackwards = sourcePosition >= targetPosition;
	const isTooLong = Math.abs(sourcePosition - targetPosition) >= minimum;

	const arrow = connection.getOverlay(OVERLAY_MIDPOINT_ARROW_ID);
	if (arrow) {
		arrow.setVisible(isBackwards && isTooLong);
		arrow.setLocation(hasItemsLabel ? .6: .5);
	}
};

export const getConnectorLengths = (connection: Connection): [number, number] => {
	// @ts-ignore
	const bounds = connection.connector.bounds;
	const diffX = Math.abs(bounds.maxX - bounds.minX);
	const diffY = Math.abs(bounds.maxY - bounds.minY);

	return [diffX, diffY];
};

export const showOrHideItemsLabel = (connection: Connection) => {
	const overlay = connection.getOverlay(OVERLAY_RUN_ITEMS_ID);
	if (!overlay) {
		return;
	}

	const [diffX, diffY] = getConnectorLengths(connection);

	if (diffX < _MIN_X_TO_SHOW_OUTPUT_LABEL && diffY < _MIN_Y_TO_SHOW_OUTPUT_LABEL) {
		overlay.setVisible(false);
	}
	else {
		overlay.setVisible(true);
	}
};

export const getIcon = (name: string): string => {
	if (name === 'trash') {
		return `<svg data-v-66d5c7e2="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="trash" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-trash fa-w-14 Icon__medium_ctPPJ"><path data-v-66d5c7e2="" fill="currentColor" d="M432 32H312l-9.4-18.7A24 24 0 0 0 281.1 0H166.8a23.72 23.72 0 0 0-21.4 13.3L136 32H16A16 16 0 0 0 0 48v32a16 16 0 0 0 16 16h416a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16zM53.2 467a48 48 0 0 0 47.9 45h245.8a48 48 0 0 0 47.9-45L416 128H32z" class=""></path></svg>`;
	}

	if (name === 'plus') {
		return `<svg data-v-301ed208="" aria-hidden="true" focusable="false" data-prefix="fas" data-icon="plus" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" class="svg-inline--fa fa-plus fa-w-14 Icon__medium_ctPPJ"><path data-v-301ed208="" fill="currentColor" d="M416 208H272V64c0-17.67-14.33-32-32-32h-32c-17.67 0-32 14.33-32 32v144H32c-17.67 0-32 14.33-32 32v32c0 17.67 14.33 32 32 32h144v144c0 17.67 14.33 32 32 32h32c17.67 0 32-14.33 32-32V304h144c17.67 0 32-14.33 32-32v-32c0-17.67-14.33-32-32-32z" class=""></path></svg>`;
	}

	return '';
};


const canUsePosition = (position1: XYPosition, position2: XYPosition) => {
	if (Math.abs(position1[0] - position2[0]) <= 100) {
		if (Math.abs(position1[1] - position2[1]) <= 50) {
			return false;
		}
	}

	return true;
};

export const getNewNodePosition = (nodes: INodeUi[], newPosition: XYPosition, movePosition?: XYPosition): XYPosition => {
	const targetPosition: XYPosition = [...newPosition];

	targetPosition[0] = targetPosition[0] - (targetPosition[0] % 20);
	targetPosition[1] = targetPosition[1] - (targetPosition[1] % 20);

	if (!movePosition) {
		movePosition = [40, 40];
	}

	let conflictFound = false;
	let i, node;
	do {
		conflictFound = false;
		for (i = 0; i < nodes.length; i++) {
			node = nodes[i];
			if (!canUsePosition(node.position, targetPosition)) {
				conflictFound = true;
				break;
			}
		}

		if (conflictFound === true) {
			targetPosition[0] += movePosition[0];
			targetPosition[1] += movePosition[1];
		}
	} while (conflictFound === true);

	return targetPosition;
};

export const getMousePosition = (e: MouseEvent | TouchEvent): XYPosition => {
	// @ts-ignore
	const x = e.pageX !== undefined ? e.pageX : (e.touches && e.touches[0] && e.touches[0].pageX ? e.touches[0].pageX : 0);
	// @ts-ignore
	const y = e.pageY !== undefined ? e.pageY : (e.touches && e.touches[0] && e.touches[0].pageY ? e.touches[0].pageY : 0);

	return [x, y];
};

export const getRelativePosition = (x: number, y: number, scale: number, offset: XYPosition): XYPosition => {
	return [
		(x - offset[0]) / scale,
		(y - offset[1]) / scale,
	];
};