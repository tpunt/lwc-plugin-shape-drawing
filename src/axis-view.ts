import { Coordinate, ISeriesPrimitiveAxisView } from 'lightweight-charts';
import { Point, ShapeDrawingDataSource } from './data-source';

abstract class ShapeDrawingAxisView implements ISeriesPrimitiveAxisView {
	_source: ShapeDrawingDataSource;
	_p: Point;
	_pos: Coordinate | null = null;
	constructor(source: ShapeDrawingDataSource, p: Point) {
		this._source = source;
		this._p = p;
	}
	abstract update(): void;
	abstract text(): string;
	abstract visible(): boolean;
	abstract tickVisible(): boolean;

	coordinate() {
		return this._pos ?? -1;
	}

	textColor() {
		return this._source.options.labelTextColor;
	}
	backColor() {
		return this._source.options.labelColor;
	}
	movePoint(p: Point) {
		this._p = p;
		this.update();
	}
}

export class ShapeDrawingTimeAxisView extends ShapeDrawingAxisView {
	update() {
		const timeScale = this._source.chart.timeScale();
		this._pos = timeScale.timeToCoordinate(this._p.time);
	}

	text() {
		return this._source.options.timeLabelFormatter(this._p.time);
	}

	visible(): boolean {
		return this._source.options.showTimeAxisLabels;
	}

	tickVisible(): boolean {
		return this._source.options.showTimeAxisLabels;
	}
}

export class ShapeDrawingPriceAxisView extends ShapeDrawingAxisView {
	update() {
		const series = this._source.series;
		this._pos = series.priceToCoordinate(this._p.price);
	}

	text() {
		return this._source.options.priceLabelFormatter(this._p.price);
	}

	visible(): boolean {
		return this._source.options.showPriceAxisLabels;
	}

	tickVisible(): boolean {
		return this._source.options.showPriceAxisLabels;
	}
}
