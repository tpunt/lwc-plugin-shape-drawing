import { AutoscaleInfo, Logical, Time } from 'lightweight-charts';
import { ShapeDrawingPriceAxisView, ShapeDrawingTimeAxisView } from './axis-view';
import { Point, ShapeDrawingDataSource } from './data-source';
import { ShapeDrawingOptions, defaultOptions } from './options';
import { ShapeDrawingPaneView } from './pane-view';
import { PluginBase } from './plugin-base';

export class ShapeDrawing
	extends PluginBase
	implements ShapeDrawingDataSource
{
	_options: ShapeDrawingOptions;
	_points: Point[];
	_paneViews: ShapeDrawingPaneView[];
	_timeAxisViews: Map<Time, ShapeDrawingTimeAxisView> = new Map();
	_priceAxisViews: Map<number, ShapeDrawingPriceAxisView> = new Map();

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

	public get options(): ShapeDrawingOptions {
		return this._options;
	}

	applyOptions(options: Partial<ShapeDrawingOptions>) {
		this._options = { ...this._options, ...options };
		this.requestUpdate();
	}

	public get points(): Point[] {
		return this._points;
	}
}
