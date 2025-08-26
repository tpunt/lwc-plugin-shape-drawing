import { Coordinate, IPrimitivePaneView } from 'lightweight-charts';
import { ShapeDrawingPaneRenderer } from './pane-renderer';
import { ShapeDrawingDataSource } from './data-source';

export interface ViewPoint {
	x: Coordinate | null;
	y: Coordinate | null;
}

export class ShapeDrawingPaneView implements IPrimitivePaneView {
	_source: ShapeDrawingDataSource;
	_points: ViewPoint[] = [];

	constructor(source: ShapeDrawingDataSource) {
		this._source = source;
	}

	update() {
		this._points = [];

		for (const p of this._source.points) {
			const y = this._source.series.priceToCoordinate(p.price);
			let x = this._source.chart.timeScale().timeToCoordinate(p.time);

			if (x !== null) {
				p.logical = this._source.chart.timeScale().coordinateToLogical(x) || undefined;
			} else {
				if (p.logical !== undefined) {
					x = this._source.chart.timeScale().logicalToCoordinate(p.logical);
				}
			}

			this._points.push({ x, y });
		}
	}

	renderer() {
		return new ShapeDrawingPaneRenderer(this._points, this._source.highlightCorners, this._source.options);
	}
}
