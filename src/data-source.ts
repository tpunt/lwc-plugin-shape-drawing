import { IChartApi, ISeriesApi, SeriesOptionsMap, Time, Logical } from 'lightweight-charts';
import { ShapeDrawingOptions } from './options';

export interface Point {
	time: Time;
	price: number;
	logical?: Logical;
}

export interface ShapeDrawingDataSource {
	chart: IChartApi;
	series: ISeriesApi<keyof SeriesOptionsMap>;
	options: ShapeDrawingOptions;
	points: Point[];
	isHovered(): boolean;
	isSelected(): boolean;
}
