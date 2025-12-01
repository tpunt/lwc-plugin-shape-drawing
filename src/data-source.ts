import { IChartApi, ISeriesApi, SeriesOptionsMap, Time, Logical } from 'lightweight-charts';
import { ShapeDrawingOptions } from './options';

export class Point {
	price: number;
	time: Time;
	logical?: Logical | undefined;

	constructor(price: number, time: Time) {
		this.price = price;
		this.time = time;
	}
}

export interface ShapeDrawingDataSource {
	chart: IChartApi;
	series: ISeriesApi<keyof SeriesOptionsMap>;
	options: ShapeDrawingOptions;
	points: Point[];
	isHovered(): boolean;
	isSelected(): boolean;
}
