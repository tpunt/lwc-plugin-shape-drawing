import { LineStyle, Time } from 'lightweight-charts';
import { ShapeDrawing } from '../shape-drawing';
import { chart, data, lineSeries, state, chartElement } from './data';
import { chartCrosshairMoveEvent, chartMouseDownEvent, chartMouseUpEvent, keyUpEvent } from './helpers';

/************************** Statically add a shape **************************/

const timeframe = 60 * 60 * 24; // 1 day
let index = data.length - 50;

lineSeries.setData(data.slice(index));

const time1a = lineSeries.data()[lineSeries.data().length - 50].time as number - (timeframe) as Time;
const time2a = lineSeries.data()[lineSeries.data().length - 10].time;
const time3a = lineSeries.data()[lineSeries.data().length - 1].time;

const shape1 = new ShapeDrawing(
	[
		{ price: 100, time: time1a },
		{ price: 100, time: time2a },
		{ price: 500, time: time3a },
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
		hoveredFillOpacity: 0.8,
	},
);

lineSeries.attachPrimitive(shape1);

// Allows for interactivity with the shape
state.drawnObjects[shape1.objectId] = shape1;

/************************** Interactively add shapes **************************/

window.addEventListener('keyup', keyUpEvent);
chartElement!.addEventListener('mousedown', chartMouseDownEvent);
chartElement!.addEventListener('mouseup', chartMouseUpEvent);
chart.subscribeCrosshairMove(chartCrosshairMoveEvent);

/*
let flag = false;

setInterval(setNewData, 1000);

setInterval(() => {
	index -= 50;
	lineSeries.setData(data.slice(index));
}, 3000);

function setNewData() {
	const priceDelta = Math.random() * (flag ? 100 : -100);
	const lastData = applyNewPriceToData(timeframe, data as LineData[], priceDelta);

	flag = !flag;

	lineSeries.update(lastData);
}

function applyNewPriceToData(timeframe: number, data: LineData[], priceDelta: number): LineData {
	const currentTime = Math.floor(new Date().getTime() / 1000);
	const currentAlignedTime = currentTime - (currentTime % timeframe);
	const lastData = data[data.length - 1];
	const newPrice = lastData.value + priceDelta;
	const lastAlignedTime = lastData.time as number;

	if (currentAlignedTime > lastAlignedTime) {
		data.push({
			time: currentAlignedTime as Time,
			value: newPrice,
		});
	} else {
		lastData.value = newPrice;
	}

	return {
		...data[data.length - 1],
	}
}
*/
