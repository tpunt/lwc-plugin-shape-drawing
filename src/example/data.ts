import { CrosshairMode, LastPriceAnimationMode, LineSeries, createChart } from 'lightweight-charts';
import { State } from './classes';
import { generateLineData } from './sample-data';
import { shapeDrawingSelection } from './helpers';

export const chartOptions = {
	autoSize: true,
	crosshair: {
		mode: CrosshairMode.Normal,
	},
	layout: {
		background: {
			color: '#ccc',
		},
	},
};
export const seriesPriceSize = 0.01;
export const seriesPricePrecision = 2;

export const shapeDrawingSelectionElement = document.getElementById('shapeDrawingSelection') as HTMLDivElement;

// Shape drawing options
export const fillOpacityElement = document.getElementById('fillOpacity') as HTMLInputElement;

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

lineSeries.setData(generateLineData());

shapeDrawingSelectionElement.addEventListener('click', shapeDrawingSelection);

// Change the shape's fill opacity
fillOpacityElement.addEventListener('input', (event) => {
	if (state.currentlySelectedShape) {
		state.shapeOptions['fillOpacity'] = parseFloat((event.target as HTMLInputElement).value);
		state.currentlySelectedShape.applyOptions(state.shapeOptions);
	}
});

export const chartElement = document.getElementById('chart');

export const state = new State();
