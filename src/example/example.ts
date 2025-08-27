import { LineStyle } from 'lightweight-charts';
import { ShapeDrawing } from '../shape-drawing';
import { chart, lineSeries, state, chartElement } from './data';
import { chartCrosshairMoveEvent, chartMouseDownEvent, chartMouseMoveEvent, chartMouseUpEvent, keyUpEvent } from './helpers';

/************************** Statically add a shape **************************/

const time1a = lineSeries.data()[lineSeries.data().length - 50].time;
const time2a = lineSeries.data()[lineSeries.data().length - 10].time;

const shape1 = new ShapeDrawing(
	[
		{ price: 100, time: time1a },
		{ price: 100, time: time2a },
		{ price: 500, time: time2a },
	],
	{
		fillColor: '#ff0',
		fillOpacity: 0.5,
		borderColor: '#0ff',
		borderWidth: 3,
		borderStyle: LineStyle.Dashed,
		showTimeAxisLabels: true,
		showPriceAxisLabels: true,
		labelColor: '#aaa',
		labelTextColor: '#000',
		hoveredBorderWidth: 8,
		hoveredFillOpacity: 0.6,
	},
);

lineSeries.attachPrimitive(shape1);

// Allows for interactivity with the shape
state.drawnObjects[shape1.objectId] = shape1;

/************************** Interactively add shapes **************************/

window.addEventListener('keyup', keyUpEvent);
chartElement!.addEventListener('mousedown', chartMouseDownEvent);
chartElement!.addEventListener('mousemove', chartMouseMoveEvent);
chartElement!.addEventListener('mouseup', chartMouseUpEvent);
chart.subscribeCrosshairMove(chartCrosshairMoveEvent);
