import { Coordinate, IPrimitivePaneView, Logical } from 'lightweight-charts';
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
		const timeScale = this._source.chart.timeScale();

		this._points = [];

		for (const p of this._source.points) {
			const y = this._source.series.priceToCoordinate(p.price);
			let x = timeScale.timeToCoordinate(p.time);

			if (x !== null) {
				p.logical = timeScale.coordinateToLogical(x) ?? undefined;
			} else {
				if (p.logical !== undefined) {
					x = timeScale.logicalToCoordinate(p.logical);
				} else { // Fall back to manual logic: find the timeframe, then calculate the logical index from that
					const seriesData = this._source.series.data();

					if (seriesData.length >= 2) {
						const firstDataPoint = seriesData[0];
						const secondDataPoint = seriesData[1];
						const timeframe = (secondDataPoint.time as number) - (firstDataPoint.time as number);

						if (timeframe > 0) {
							const firstCoordinate = timeScale.timeToCoordinate(firstDataPoint.time);

							if (firstCoordinate !== null) {
								const firstLogical = timeScale.coordinateToLogical(firstCoordinate);

								if (firstLogical !== null) {
									const timeDiff = (p.time as number) - (firstDataPoint.time as number);
									const logicalOffset = timeDiff / timeframe;

									p.logical = (firstLogical + logicalOffset) as Logical;
									x = timeScale.logicalToCoordinate(p.logical);
								}
							}
						}
					}
				}
			}

			this._points.push({ x, y });
		}
	}

	renderer() {
		return new ShapeDrawingPaneRenderer(this._points, this._source.options, this._source.isHovered() || this._source.isSelected());
	}
}
