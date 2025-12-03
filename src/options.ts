import { LineStyle, Time, isBusinessDay } from 'lightweight-charts';

export enum HoveredCornerShape {
	Circle = 0,
	Square = 1,
}

export interface ShapeDrawingOptions {
	borderColor: string;
	borderWidth: number;
	borderStyle: LineStyle;
	borderVisible: boolean;
	fillColor: string; // Either rgba, or hex/rgb with fillOpacity applied to it
	fillOpacity: number; // Overridden if fillColor is an rgba string
	joinFirstToLastCorner: boolean; // Allows for a series of lines to be joined
	extendToRight: boolean; // Draw a horizontal line from the click point to the right
	extendToLeft: boolean; // Draw a horizontal line

	mutable: boolean; // Whether the shape can be moved or changed by the user. Hovering is also ignored if false.
	hoveredFillOpacity: number; // Only applied if fillOpacity option above is applied
	hoveredFillDetection: boolean; // Allows for hovering over the middle of a shape. Always off if joinFirstToLastCorner = false
	hoveredCornerShape: HoveredCornerShape | null; // The fill is the same as the border color
	hoveredCornerSize: number; // The size of the corner in pixels
	hoveredBorderWidth: number;
	hoveredBorderDetection: boolean;

	// Axis options
	showTimeAxisLabels: boolean;
	showPriceAxisLabels: boolean;
	labelColor: string;
	labelTextColor: string;
	priceLabelFormatter: (price: number) => string;
	timeLabelFormatter: (time: Time) => string;

	timeframeInSeconds: number; // The timeframe of the data. If 0, the inferred timeframe will be used (requires >= 2 data points)
	clientData: string; // Allow the client to store arbitrary data with the shape (for augmentation in their own code)
}

export const defaultOptions: ShapeDrawingOptions = {
	//* Define the default values for all the primitive options.
	borderColor: '#0ff',
	borderWidth: 1,
	borderStyle: LineStyle.Solid,
	borderVisible: true,
	fillColor: '#ccc',
	fillOpacity: 0.5,
	joinFirstToLastCorner: true,
	extendToLeft: false,
	extendToRight: false,

	mutable: true,
	hoveredBorderWidth: 2,
	hoveredFillOpacity: 0.7,
	hoveredCornerShape: HoveredCornerShape.Square,
	hoveredCornerSize: 20,
	hoveredFillDetection: true,
	hoveredBorderDetection: true,

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
	timeframeInSeconds: 0,
	clientData: '',
} as const;
