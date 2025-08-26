import { HandleScaleOptions, HandleScrollOptions, LineStyle, Logical, Time } from "lightweight-charts";
import { HoveredObject, ShapeDrawing } from "../shape-drawing";
import { ShapeDrawingOptions } from "../options";

export const defaultShapeOptions: Partial<ShapeDrawingOptions> = {
	fillColor: '#0f0',
	fillOpacity: 0.5,
	borderColor: '#f0f',
	borderWidth: 2,
	borderStyle: LineStyle.Dashed,
	hoveredEdgeWidth: 4,
	hoveredFillOpacity: 0.6,
};

export class State {
	shapeToDraw: string = ''; // Click a shape to draw

	currentlySelectedShape: ShapeDrawing | null = null; // If escape is pressed, then this will be deselected
	currentlyDrawingShape: ShapeDrawing | null = null; // If escape is pressed, then this will be deleted

	// Interactive drawing
	mouseDown: boolean = false;
	lastMouseDownPoint: Point | null = null;
	dragging: boolean = false;
	hoveredObject: HoveredObject | null = null;
	originalPoints: Point[] = [];
	crosshair: Point = new Point(0, 0 as Time);
	drawnObjects: Record<string, ShapeDrawing> = {};
	savedHandleScroll: HandleScrollOptions | boolean = true;
	savedHandleScale: HandleScaleOptions | boolean = true;
	edgeCount: number = 2;
	edges: Point[] = [];

	// Used for both static and interactive drawing
	shapeOptions: Partial<ShapeDrawingOptions> = defaultShapeOptions;
}

export class Point {
	price: number;
	time: Time;
	logical?: Logical;

	constructor(price: number, time: Time, logical?: Logical) {
		this.price = price;
		this.time = time;
		this.logical = logical;
	}
}