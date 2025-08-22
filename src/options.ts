import { LineStyle, Time, isBusinessDay } from 'lightweight-charts';

export interface ShapeDrawingOptions {
	borderColor: string;
	borderWidth: number;
	borderStyle: LineStyle;
	borderVisible: boolean;
	labelColor: string;
	labelTextColor: string;
	fillColor: string; // Either rgba, or hex/rgb with fillOpacity applied to it
	fillOpacity: number; // Overridden if fillColor is an rgba string

	showTimeAxisLabels: boolean;
	showPriceAxisLabels: boolean;
	priceLabelFormatter: (price: number) => string;
	timeLabelFormatter: (time: Time) => string;
}

export const defaultOptions: ShapeDrawingOptions = {
	//* Define the default values for all the primitive options.
	borderColor: '#0ff',
	borderWidth: 1,
	borderStyle: LineStyle.Solid,
	borderVisible: true,
	fillColor: '#ccc',
	fillOpacity: 0.5,

	showTimeAxisLabels: false,
	showPriceAxisLabels: false,
	labelColor: 'rgba(50, 50, 50, 1)',
	labelTextColor: 'white',
	priceLabelFormatter: (price: number) => price.toFixed(2),
	timeLabelFormatter: (time: Time) => {
		if (typeof time == 'string') return time;
		const date = isBusinessDay(time)
			? new Date(time.year, time.month, time.day)
			: new Date(time * 1000);
		return date.toLocaleDateString();
	},
} as const;
