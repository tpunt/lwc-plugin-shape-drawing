import { AutoscaleInfo, Logical, PrimitiveHoveredItem, Time } from 'lightweight-charts';
import { ShapeDrawingPriceAxisView, ShapeDrawingTimeAxisView } from './axis-view';
import { Point, ShapeDrawingDataSource } from './data-source';
import { ShapeDrawingOptions, defaultOptions, HoveredCornerShape } from './options';
import { ShapeDrawingPaneView } from './pane-view';
import { PluginBase } from './plugin-base';

// Re-export types for public API
export type { ShapeDrawingOptions } from './options';
export { HoveredCornerShape } from './options';

export class ShapeDrawing
	extends PluginBase
	implements ShapeDrawingDataSource
{
	_options: ShapeDrawingOptions;
	_points: Point[];
	_highlightCorners: boolean = false;
	_paneViews: ShapeDrawingPaneView[];
	_timeAxisViews: Map<Time, ShapeDrawingTimeAxisView> = new Map();
	_priceAxisViews: Map<number, ShapeDrawingPriceAxisView> = new Map();
	_internalObjectId: string = '';
	_objectId: string = '';
	_originalBorderWidth: number;
	_originalFillOpacity: number;
	_selectedPointIndex: number = -1;
	_isSelected: boolean = false;

	constructor(
		points: Point[],
		options: Partial<ShapeDrawingOptions> = {}
	) {
		super();
		this._points = points;
		this._options = {
			...defaultOptions,
			...options,
		};
		this._paneViews = [new ShapeDrawingPaneView(this)];

		this._originalBorderWidth = this._options.borderWidth;
		this._originalFillOpacity = this._options.fillOpacity;
		this._internalObjectId = `shape-drawing-${Math.random().toString(36).substring(2, 15)}`;

		if (this._options.mutable) {
			this._objectId = this._internalObjectId;
		}

		if (this._options.showTimeAxisLabels) {
			for (const p of this._points) {
				if (this._timeAxisViews.has(p.time)) {
					continue;
				}

				this._timeAxisViews.set(p.time, new ShapeDrawingTimeAxisView(this, p));
			}
		}

		if (this._options.showPriceAxisLabels) {
			for (const p of this._points) {
				if (this._priceAxisViews.has(p.price)) {
					continue;
				}

				this._priceAxisViews.set(p.price, new ShapeDrawingPriceAxisView(this, p));
			}
		}
	}

	updateAllViews() {
		//* Use this method to update any data required by the
		//* views to draw.
		this._paneViews.forEach(pw => pw.update());
		this._timeAxisViews.forEach(pw => pw.update());
		this._priceAxisViews.forEach(pw => pw.update());
	}

	priceAxisViews() {
		//* Labels rendered on the price scale
		return Array.from(this._priceAxisViews.values());
	}

	timeAxisViews() {
		//* labels rendered on the time scale
		return Array.from(this._timeAxisViews.values());
	}

	paneViews() {
		//* rendering on the main chart pane
		return this._paneViews;
	}

	autoscaleInfo(
		startTimePoint: Logical,
		endTimePoint: Logical
	): AutoscaleInfo | null {
		//* Use this method to provide autoscale information if your primitive
		//* should have the ability to remain in view automatically.
		if (
			this._timeCurrentlyVisible(this._points[0].time, startTimePoint, endTimePoint) ||
			this._timeCurrentlyVisible(this._points[this._points.length - 1].time, startTimePoint, endTimePoint)
		) {
			return {
				priceRange: {
					minValue: Math.min(...this._points.map(p => p.price)),
					maxValue: Math.max(...this._points.map(p => p.price)),
				},
			};
		}
		return null;
	}

	public moveTo(point: Point, pointIndex: number) {
		this._points[pointIndex].price = point.price;
		this._points[pointIndex].time = point.time;
		this._points[pointIndex].logical = point.logical;

		this.requestUpdate();
	}

	public moveBy(pointDelta: Point, pointIndex: number = -1) {
		if (pointIndex !== -1) {
			this._points[pointIndex].price += pointDelta.price;
			this._points[pointIndex].time = ((this._points[pointIndex].time as number) + (pointDelta.time as number)) as Time;
			this._points[pointIndex].logical = ((this._points[pointIndex].logical as number) + (pointDelta.logical as number)) as Logical;
		} else {
			this._points.forEach(p => {
				p.price += pointDelta.price;
				p.time = ((p.time as number) + (pointDelta.time as number)) as Time;
				p.logical = ((p.logical as number) + (pointDelta.logical as number)) as Logical;
			});
		}

		this.requestUpdate();
	}

	public removePoint(pointIndex: number) {
		if (pointIndex < 0 || pointIndex >= this._points.length) {
			return;
		}

		this._points.splice(pointIndex, 1);
		this.requestUpdate();
	}

	// For shape selection (via click)
	public setSelected(isSelected: boolean) {
		if (this._isSelected === isSelected) {
			return;
		}

		this._isSelected = isSelected;

		if (isSelected) {
			this._setHovered(true);
		} else {
			this._setHovered(false);
		}
	}

	private _setHovered(yes: boolean) {
		if (yes) {
			if (
				this._options.borderWidth !== this._options.hoveredBorderWidth ||
				this._options.fillOpacity !== this._options.hoveredFillOpacity ||
				this._highlightCorners !== true
			) {
				this._options.borderWidth = this._options.hoveredBorderWidth;
				this._options.fillOpacity = this._options.hoveredFillOpacity;
				this._highlightCorners = true;
				this.requestUpdate();
			}
		} else {
			if (this._isSelected) {
				return;
			}

			if (
				this._options.borderWidth !== this._originalBorderWidth ||
				this._options.fillOpacity !== this._originalFillOpacity ||
				this._highlightCorners !== false
			) {
				this._options.borderWidth = this._originalBorderWidth;
				this._options.fillOpacity = this._originalFillOpacity;
				this._highlightCorners = false;
				this.requestUpdate();
			}
		}
	}

	public hitTest?(x: number, y: number): PrimitiveHoveredItem | null {
		if (!this._options.mutable) {
			return null;
		}

		// Calculate the X/Y coordinates of the shape
		const paneViews = this.paneViews();
		const paneView = paneViews[0];
		const renderer = paneView.renderer();
		const points = renderer._points;

		let hovered = false;

		this._selectedPointIndex = this._getPointIndexIfNearCorner(x, y, points);

		if (this._selectedPointIndex !== -1) {
			hovered = true;
		} else {
			// For lines (2 points), check if cursor is near the line segment
			// For polygons (3+ points), check if cursor is inside the shape
			if (points.length === 2) {
				if (this._options.hoveredBorderDetection && this._isPointNearLine(x, y, points[0], points[1])) {
					hovered = true;
				}
			} else if (points.length >= 3) {
				if (!this._options.hoveredFillDetection || !this._options.joinFirstToLastCorner) { // Border hovering only
					if (this._options.hoveredBorderDetection) {
						for (let i = 1; i < points.length; i++) {
							if (this._isPointNearLine(x, y, points[i - 1], points[i])) {
								hovered = true;
							}
						}

						if (!hovered && this._options.joinFirstToLastCorner) {
							if (this._isPointNearLine(x, y, points[0], points[points.length - 1])) {
								hovered = true;
							}
						}
					}
				} else if (this._options.joinFirstToLastCorner) {
					if (this._isPointInPolygon(x, y, points)) {
						hovered = true;
					}
				}
			}
		}

		if (hovered) {
			this._setHovered(true);

			return {
				externalId: new HoveredObject(this._objectId, this._selectedPointIndex).string(),
				cursorStyle: 'pointer',
				zOrder: 'top',
				isBackground: false,
			};
		}

		this._setHovered(false);

		return null;
	}

	_timeCurrentlyVisible(
		time: Time,
		startTimePoint: Logical,
		endTimePoint: Logical
	): boolean {
		const ts = this.chart.timeScale();
		const coordinate = ts.timeToCoordinate(time);
		if (coordinate === null) return false;
		const logical = ts.coordinateToLogical(coordinate);
		if (logical === null) return false;
		return logical <= endTimePoint && logical >= startTimePoint;
	}

	private _getPointIndexIfNearCorner(x: number, y: number, points: any[]): number {
		// Check if x and y are within the hit area of any point in the shape
		// Mirror the logic in pane-renderer.ts:61-86 for corner hit detection

		if (this._options.hoveredCornerShape === null) {
			return -1;
		}

		for (let i = 0; i < points.length; i++) {
			const p = points[i];

			if (p.x === null || p.y === null) {
				continue;
			}

			let hit = false;

			switch (this._options.hoveredCornerShape) {
			case HoveredCornerShape.Circle: {
				// Mirror pane-renderer.ts:67-70 - circle hit detection
				const cornerRadius = this._options.hoveredCornerSize / devicePixelRatio / 2;
				const distance = Math.sqrt((p.x - x) ** 2 + (p.y - y) ** 2);

				hit = distance <= cornerRadius;
				break;
			}
			case HoveredCornerShape.Square: {
				// Mirror pane-renderer.ts:71-76 - square hit detection
				const cornerSize = this._options.hoveredCornerSize / devicePixelRatio;
				const halfSize = cornerSize / 2;

				hit = x >= p.x - halfSize && x <= p.x + halfSize &&
					  y >= p.y - halfSize && y <= p.y + halfSize;
				break;
			}
			}

			if (hit) {
				return i;
			}
		}

		return -1;
	}

	/**
	 * Check if a point (x, y) is near a line segment defined by two points
	 * Uses distance from point to line segment calculation
	 */
	private _isPointNearLine(x: number, y: number, p1: any, p2: any): boolean {
		if (p1.x === null || p1.y === null || p2.x === null || p2.y === null) {
			return false;
		}

		const hitRadius = this._options.hoveredBorderWidth / devicePixelRatio;

		// Calculate the distance from point (x, y) to line segment (p1, p2)
		const A = x - p1.x;
		const B = y - p1.y;
		const C = p2.x - p1.x;
		const D = p2.y - p1.y;

		const dot = A * C + B * D;
		const lenSq = C * C + D * D;

		// If line segment is actually a point, check distance to that point
		if (lenSq === 0) {
			const distance = Math.sqrt(A * A + B * B);
			return distance <= hitRadius;
		}

		// Calculate the parameter t for the closest point on the line segment
		let t = dot / lenSq;
		t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]

		// Calculate the closest point on the line segment
		const closestX = p1.x + t * C;
		const closestY = p1.y + t * D;

		// Calculate distance from (x, y) to the closest point on the line segment
		const distance = Math.sqrt((x - closestX) ** 2 + (y - closestY) ** 2);

		return distance <= hitRadius;
	}

	/**
	 * Check if a point (x, y) is inside a polygon defined by points
	 * Uses the ray casting algorithm (point-in-polygon test)
	 */
	private _isPointInPolygon(x: number, y: number, points: any[]): boolean {
		let inside = false;

		for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
			const xi = points[i].x;
			const yi = points[i].y;
			const xj = points[j].x;
			const yj = points[j].y;

			// Skip if any point has null coordinates
			if (xi === null || yi === null || xj === null || yj === null) {
				continue;
			}

			// Ray casting algorithm
			if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
				inside = !inside;
			}
		}

		return inside;
	}

	public get options(): ShapeDrawingOptions {
		return this._options;
	}

	public get highlightCorners(): boolean {
		return this._highlightCorners;
	}

	public get objectId(): string {
		return this._objectId;
	}

	applyOptions(options: Partial<ShapeDrawingOptions>) {
		if (this._options.mutable !== options.mutable) {
			if (options.mutable) {
				this._objectId = this._internalObjectId;
			} else {
				this._objectId = '';
			}
		}

		if (options.borderWidth !== undefined && this._options.borderWidth !== options.borderWidth) {
			this._originalBorderWidth = options.borderWidth;
		}

		if (options.fillOpacity !== undefined && this._options.fillOpacity !== options.fillOpacity) {
			this._originalFillOpacity = options.fillOpacity;
		}

		this._options = { ...this._options, ...options };
		this.requestUpdate();
	}

	public get points(): Point[] {
		return this._points;
	}
}

export class HoveredObject {
	id = '';
	pointIndex = -1;
	_stringId = '';
	public static readonly separator = '+++';

	constructor(id: string, pointIndex: number = -1) {
		this.id = id;
		this.pointIndex = pointIndex;

		if (this.pointIndex === -1) {
			this._stringId = this.id;
		} else {
			this._stringId = `${this.id}${HoveredObject.separator}${this.pointIndex}`;
		}
	}

	string(): string {
		return this._stringId;
	}

	static parseHoveredObjectId(hoveredObjectId: string): HoveredObject | null {
		if (hoveredObjectId === '') {
			return null;
		}

		if (!hoveredObjectId.includes(HoveredObject.separator)) {
			return new HoveredObject(hoveredObjectId);
		}

		const parts = hoveredObjectId.split(HoveredObject.separator)

		return new HoveredObject(parts[0], Number(parts[1]));
	}
}
