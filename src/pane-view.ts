import { Coordinate, IPrimitivePaneView, Logical, Time } from 'lightweight-charts';
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

			if (x === null) {
				// Can occur if the time is not on the time scale (e.g. timeframe has changed). Logical cannot be relied
				// upon because these indexes are quite possibly invalidated now.
				const seriesData = this._source.series.data();

				if (seriesData.length >= 1) {
					const time0 = seriesData[0].time as number;
					let timeframeInSeconds = this._source.options.timeframeInSeconds;

					if (timeframeInSeconds === 0 && seriesData.length >= 2) {
						const time1 = seriesData[1].time as number;
						timeframeInSeconds = time1 - time0; // Simply the inferred timeframe
					}

					if (timeframeInSeconds > 0) {
						const dataPointTime = this.findDataPointByTimestamp(p.time);

						if (dataPointTime !== null && p.time as number < (dataPointTime as number + timeframeInSeconds)) {
							x = timeScale.timeToCoordinate(dataPointTime);
						} else {
							const timeDiff = p.time as number - time0;
							const logicalOffset = Math.floor(timeDiff / timeframeInSeconds);

							x = timeScale.logicalToCoordinate(logicalOffset as Logical);
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

	findDataPointByTimestamp(timestamp: Time): Time | null {
		const data = this._source.series.data();
		let left = 0;
		let right = data.length - 1;
		let result = null;

		while (left <= right) {
			const mid = Math.floor((left + right) / 2);

			if (data[mid].time === timestamp) {
				return data[mid].time;
			}

			if (data[mid].time < timestamp) {
				result = data[mid];
				left = mid + 1;
			} else {
				right = mid - 1;
			}
		}

		if (result !== null) {
			return result.time;
		}

		return null;
	}
}
