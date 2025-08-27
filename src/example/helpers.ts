import { Logical, MouseEventParams, Time } from "lightweight-charts";
import { defaultShapeOptions, Point } from "./classes";
import { chart, fillOpacityElement, lineSeries, seriesPricePrecision, shapeDrawingSelectionElement, state } from "./data";
import { HoveredObject, ShapeDrawing } from "../shape-drawing";

const selectedButtonColor = '#aaa';
const deselectedButtonColor = '#ccc';

export function shapeDrawingSelection(event: MouseEvent) {
	if (!(event.target instanceof HTMLButtonElement)) {
		return;
	}

	if (state.currentlySelectedShape) {
		selectShape(null);
	}

	if (state.shapeToDraw === event.target.textContent) { // Deselect it
		event.target.style.backgroundColor = deselectedButtonColor;
		state.shapeToDraw = '';
		state.edgeCount = 0;
		state.shapeOptions = defaultShapeOptions;
		return;
	}

	if (state.shapeToDraw !== '') {
		// Fetch the shapeToDraw button by iterating through all buttons and finding the one with the same textContent
		const shapeToDrawButton = Array.from(shapeDrawingSelectionElement.children).find(
			button => (button as HTMLButtonElement).textContent === state.shapeToDraw
		);
		if (shapeToDrawButton) {
			(shapeToDrawButton as HTMLButtonElement).style.backgroundColor = deselectedButtonColor;
		}
	}

	event.target.style.backgroundColor = selectedButtonColor;

	state.shapeToDraw = event.target.textContent!;

	switch (event.target.textContent) {
		case '⊿':
			state.edgeCount = 3;
			state.shapeOptions = {
				...defaultShapeOptions,
			};
			break;
		case '□':
			state.edgeCount = 4;
			state.shapeOptions = {
				...defaultShapeOptions,
			};
			break;
		case '↯':
			state.edgeCount = 0; // Special value that allows as many edges as the user wants
			state.shapeOptions = {
				...defaultShapeOptions,
				joinFirstToLastCorner: false,
			};
			break;
		case '⬡':
			state.edgeCount = 0; // Special value that allows as many edges as the user wants
			state.shapeOptions = {
				...defaultShapeOptions,
			};
			break;
	}
}

export function moveShape(shape: ShapeDrawing, pointIndex: number) {
	let timeDelta: Time;

	// Cater for when a shape is being moved from off of the timeseries to onto the timeseries
	if (state.crosshair.time !== 0 && state.lastMouseDownPoint!.time === 0) {
		timeDelta = 0 as Time;
	} else {
		timeDelta = (state.crosshair.time as number) - (state.lastMouseDownPoint!.time as number) as Time;
	}

	shape.moveBy(
		new Point(
			state.crosshair.price - state.lastMouseDownPoint!.price,
			timeDelta,
			(state.crosshair.logical as number) - (state.lastMouseDownPoint!.logical as number) as Logical,
		),
		pointIndex,
	);

	state.lastMouseDownPoint = Object.assign({}, state.crosshair);
}

export function chartMouseDownEvent() {
	state.mouseDown = true;
	state.lastMouseDownPoint = Object.assign({}, state.crosshair);

	if (state.hoveredObject) {
		if (state.hoveredObject.id in state.drawnObjects) {
			selectShape(state.drawnObjects[state.hoveredObject.id]);
		}
	} else {
		if (state.currentlySelectedShape) {
			selectShape(null);
		}
	}
}

function selectShape(shape: ShapeDrawing | null) {
	if (state.currentlySelectedShape === shape) {
		return;
	}

	if (shape) {
		if (state.currentlySelectedShape) {
			state.currentlySelectedShape.setSelected(false);
		}

		shape.setSelected(true);
		state.shapeOptions = { ...shape.options };
	} else {
		if (state.currentlySelectedShape) {
			state.currentlySelectedShape.setSelected(false);
			state.currentlySelectedShape = null;
		}

		state.shapeOptions = defaultShapeOptions;
	}

	state.currentlySelectedShape = shape;

	// Set the options here in the selection form.
	fillOpacityElement.value = state.shapeOptions['fillOpacity']?.toString() || '0.5';
}

export function chartMouseUpEvent() {
	addEdge();

	state.mouseDown = false;
	state.dragging = false;

	chart.applyOptions({
		handleScroll: state.savedHandleScroll,
		handleScale: state.savedHandleScale,
	});
}

export function chartMouseMoveEvent() {
	if (state.mouseDown) {
		if (!state.dragging) {
			state.dragging = true;

			if (state.hoveredObject) {
				state.savedHandleScroll = JSON.parse(JSON.stringify(chart.options().handleScroll));
				state.savedHandleScale = JSON.parse(JSON.stringify(chart.options().handleScale));

				chart.applyOptions({
					handleScroll: false,
					handleScale: false,
				});
			}
		}
	}

	if (state.dragging) {
		if (state.hoveredObject) {
			if (state.hoveredObject.id in state.drawnObjects) {
				const shape = state.drawnObjects[state.hoveredObject.id];

				if (shape) {
					moveShape(shape, state.hoveredObject.pointIndex);

					state.currentlySelectedShape = shape;
				}
			}
		}
	}
}

export function chartCrosshairMoveEvent(event:  MouseEventParams<Time>) {
	if (!event.point) {
		return;
	}

	// Only detect hovering if we are not currently dragging
	if (!state.dragging) {
		state.hoveredObject = HoveredObject.parseHoveredObjectId(event.hoveredObjectId as string || '');

		if (state.hoveredObject) {
			if (state.hoveredObject.id in state.drawnObjects) {
				const shape = state.drawnObjects[state.hoveredObject.id];

				if (shape) {
					if (state.hoveredObject.pointIndex !== -1) {
						state.originalPoints = [JSON.parse(JSON.stringify(shape.points[state.hoveredObject.pointIndex]))];
					} else {
						state.originalPoints = [...JSON.parse(JSON.stringify(shape.points))];
					}
				}
			}
		}
	}

	state.crosshair.price = roundNumber(lineSeries.coordinateToPrice(event.point.y) || 0, seriesPricePrecision);
	// Can also do: crosshair.time = event.seriesData.entries().next().value![1].time;
	// If event.seriesData.size > 0 (0 means hovering off of timeseries)
	state.crosshair.time = chart.timeScale().coordinateToTime(event.point.x) || 0 as Time;
	state.crosshair.logical = event.logical; // This is to cater for hovering off of the timeseries

	if (state.edges.length > 0) {
		moveShape(state.currentlyDrawingShape!, state.edges.length - 1);
	}
}

export function keyUpEvent(event: KeyboardEvent) {
	switch (event.key) {
	case 'Escape':
		if (state.shapeToDraw !== '') {
			// Fetch the shapeToDraw button by iterating through all buttons and finding the one with the same textContent
			const shapeToDrawButton = Array.from(shapeDrawingSelectionElement.children).find(
				button => (button as HTMLButtonElement).textContent === state.shapeToDraw
			);
			if (shapeToDrawButton) {
				(shapeToDrawButton as HTMLButtonElement).style.backgroundColor = deselectedButtonColor;
			}
			state.shapeToDraw = '';
		}

		if (state.currentlySelectedShape) {
			selectShape(null);
		}

		if (state.hoveredObject) {
			if (state.hoveredObject.id in state.drawnObjects) {
				const shape = state.drawnObjects[state.hoveredObject.id];

				if (shape) {
					if (state.hoveredObject.pointIndex !== -1) {
						shape.moveTo(state.originalPoints[0], state.hoveredObject.pointIndex);
					} else {
						for (let i = 0; i < state.originalPoints.length; i++) {
							shape.moveTo(state.originalPoints[i], i);
						}
					}
				}
			}

			state.hoveredObject = null;
		}

		if (state.currentlyDrawingShape) {
			if (state.edgeCount !== 0) {
				lineSeries.detachPrimitive(state.currentlyDrawingShape);
			} else {
				// Only one point was actually drawn
				if (state.edges.length === 2) {
					lineSeries.detachPrimitive(state.currentlyDrawingShape);
				} else {
					state.drawnObjects[state.currentlyDrawingShape.objectId] = state.currentlyDrawingShape;

					state.currentlyDrawingShape.removePoint(state.currentlyDrawingShape.points.length - 1);
				}
			}

			state.edges = [];
			state.currentlyDrawingShape = null;
		}

		state.edgeCount = 0;
		state.shapeOptions = defaultShapeOptions;
		break;
	case 'Delete':
		if (state.hoveredObject) {
			if (state.hoveredObject.id in state.drawnObjects) {
				const shape = state.drawnObjects[state.hoveredObject.id];

				if (shape) {
					delete state.drawnObjects[state.hoveredObject.id];
					lineSeries.detachPrimitive(shape);
				}
			}

			state.hoveredObject = null;
		}
		break;
	}
}

function addEdge() {
	if (state.shapeToDraw === '') {
		return;
	}

	if (!state.currentlyDrawingShape) {
		const newPoint = Object.assign({}, state.crosshair);

		state.edges.push(newPoint);
		state.currentlyDrawingShape = new ShapeDrawing(state.edges, state.shapeOptions);

		lineSeries.attachPrimitive(state.currentlyDrawingShape);
	}

	if (state.edges.length === state.edgeCount) {
		state.drawnObjects[state.currentlyDrawingShape.objectId] = state.currentlyDrawingShape;
		state.edges = [];
		state.currentlyDrawingShape = null;
	} else {
		// Push the next point to the edges array to "show" the shape as it is being drawn
		const nextPoint = Object.assign({}, state.crosshair);

		state.edges.push(nextPoint);
	}

}

function roundNumber(n: number, dp: number) {
	const shiftedNumber = +`${Number(n).toFixed(20)}e+${dp}`;
	const roundedShiftedNumber = Math.round(shiftedNumber);
	const result = +`${roundedShiftedNumber}e-${dp}`;
	return result;
}
