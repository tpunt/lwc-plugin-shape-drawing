import {
	IChartApi,
	ISeriesApi,
	SeriesOptionsMap,
	Time,
} from 'lightweight-charts';
import { ShapeDrawingOptions } from './options';

export interface Point {
	time: Time;
	price: number;
}

export interface ShapeDrawingDataSource {
	chart: IChartApi;
	series: ISeriesApi<keyof SeriesOptionsMap>;
	options: ShapeDrawingOptions;
	points: Point[];
}
