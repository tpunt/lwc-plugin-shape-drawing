import { CrosshairMode, LastPriceAnimationMode, LineSeries, createChart } from 'lightweight-charts';
import { defaultShapeOptions, State } from './classes';
import { generateLineData } from './sample-data';
import { shapeDrawingSelection } from './helpers';

export const chartOptions = {
	autoSize: true,
	crosshair: {
		mode: CrosshairMode.Normal,
	},
	layout: {
		background: {
			color: '#666',
		},
	},
};
export const seriesPriceSize = 0.01;
export const seriesPricePrecision = 2;

export const shapeDrawingSelectionElement = document.getElementById('shapeDrawingSelection') as HTMLDivElement;

// Shape drawing options
export const fillOpacityElement = document.getElementById('fillOpacity') as HTMLInputElement;
export const showTimeAxisLabelsElement = document.getElementById('showTimeAxisLabels') as HTMLInputElement;
export const showPriceAxisLabelsElement = document.getElementById('showPriceAxisLabels') as HTMLInputElement;

// Initial setup

export const chart = ((window as any).chart = createChart('chart', chartOptions));
export const lineSeries = chart.addSeries(LineSeries, {
	color: '#000000',
	lastPriceAnimation: LastPriceAnimationMode.Disabled,
	crosshairMarkerVisible: false,
	priceFormat: {
		type: 'price',
		precision: seriesPricePrecision,
		minMove: seriesPriceSize,
	},
});
export const data = generateLineData();

shapeDrawingSelectionElement.addEventListener('click', shapeDrawingSelection);

// Change the shape's fill opacity
fillOpacityElement.addEventListener('input', (event) => {
	if (state.currentlySelectedShape) {
		state.shapeOptions['fillOpacity'] = parseFloat((event.target as HTMLInputElement).value);
		state.currentlySelectedShape.applyOptions(state.shapeOptions);
	} else {
		defaultShapeOptions.fillOpacity = parseFloat((event.target as HTMLInputElement).value);
	}
});

// Change the shape's show time axis labels
showTimeAxisLabelsElement.addEventListener('change', (event) => {
	if (state.currentlySelectedShape) {
		state.shapeOptions['showTimeAxisLabels'] = (event.target as HTMLInputElement).checked;
		state.currentlySelectedShape.applyOptions(state.shapeOptions);
	} else {
		defaultShapeOptions.showTimeAxisLabels = (event.target as HTMLInputElement).checked;
	}
});

// Change the shape's show price axis labels
showPriceAxisLabelsElement.addEventListener('change', (event) => {
	if (state.currentlySelectedShape) {
		state.shapeOptions['showPriceAxisLabels'] = (event.target as HTMLInputElement).checked;
		state.currentlySelectedShape.applyOptions(state.shapeOptions);
	} else {
		defaultShapeOptions.showPriceAxisLabels = (event.target as HTMLInputElement).checked;
	}
});

export const chartElement = document.getElementById('chart');

export const state = new State();
