import { CrosshairMode, LastPriceAnimationMode, LineSeries, LineStyle, createChart, Time, MouseEventParams } from 'lightweight-charts';
import { generateLineData } from './sample-data';
import { ShapeDrawing } from '../shape-drawing';

const priceSize = 0.01;
const pricePrecision = 2;
const chart = ((window as unknown as any).chart = createChart('chart', {
	autoSize: true,
	crosshair: {
		mode: CrosshairMode.Normal,
	},
	layout: {
		background: {
			color: '#ccc',
		},
	},
}));

/************************** Statically add some shapes **************************/

const lineSeries = chart.addSeries(LineSeries, {
	color: '#000000',
	lastPriceAnimation: LastPriceAnimationMode.Disabled,
	crosshairMarkerVisible: false,
	priceFormat: {
		type: 'price',
		precision: pricePrecision,
		minMove: priceSize,
	},
});
const data = generateLineData();
lineSeries.setData(data);

const time1a = data[data.length - 50].time;
const time2a = data[data.length - 10].time;

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
		borderWidth: 5,
		borderStyle: LineStyle.Dashed,
		showTimeAxisLabels: true,
		showPriceAxisLabels: true,
		labelColor: '#aaa',
		labelTextColor: '#000',
	},
);

lineSeries.attachPrimitive(shape1);

const time1b = data[data.length - 150].time;
const time2b = data[data.length - 130].time;
const time3b = data[data.length - 110].time;
const time4b = data[data.length - 90].time;

const shape2 = new ShapeDrawing(
	[
		{ price: 600, time: time1b },
		{ price: 200, time: time2b },
		{ price: 200, time: time3b },
		{ price: 600, time: time4b },
		{ price: 1000, time: time3b },
		{ price: 1000, time: time2b },
	],
	{
		fillColor: '#ff6b6b',
		fillOpacity: 0.7,
		borderColor: '#f00',
		borderWidth: 3,
		borderStyle: LineStyle.LargeDashed,
		showTimeAxisLabels: true,
		showPriceAxisLabels: true,
		labelColor: '#666',
		labelTextColor: '#fff',
	},
);

lineSeries.attachPrimitive(shape2);

/************************** Interactively add some shapes **************************/

class Point {
	price: number;
	time: Time;

	constructor(price: number, time: Time) {
		this.price = price;
		this.time = time;
	}
}

const edgeCountElement = document.getElementById('edge-count') as HTMLInputElement;
const edgesElement = document.getElementById('edges') as HTMLUListElement;
let edgeCount = 2;
let edges: Point[] = [];

edgeCountElement.addEventListener('input', () => {
	edgeCount = parseInt(edgeCountElement.value);
	edgesElement.innerHTML = '';
});

const chartElement = document.getElementById('chart');
let crosshairPrice = 0;
let crosshairTime: Time | null = null;

window.addEventListener('keyup', (event) => {
	if (event.key === 'Escape') {
		edges = [];
		edgesElement.innerHTML = '';
	}
});

chartElement!.addEventListener('click', chartClickEvent);
chart.subscribeCrosshairMove(chartCrosshairMoveEvent);

function chartClickEvent() {
	addEdge();
}

function chartCrosshairMoveEvent(event:  MouseEventParams<Time>) {
	if (!event.point || event.seriesData.size === 0) {
		return;
	}

	const seriesValues = event.seriesData.entries().next().value;

	crosshairPrice = roundNumber(
		seriesValues![0].coordinateToPrice(event.point!.y) || 0,
		pricePrecision,
	);

	crosshairTime = seriesValues![1].time || null;
}

function addEdge() {
	const newPoint = new Point(crosshairPrice, crosshairTime!);

	edges.push(newPoint);

	const li = document.createElement('li');
	li.textContent = `X: ${newPoint.price}, Y: ${newPoint.time}`;
	edgesElement.append(li);

	if (edges.length === edgeCount) {
		const shape = new ShapeDrawing(edges, {
			fillColor: '#0f0',
			fillOpacity: 0.5,
			borderColor: '#f0f',
			borderWidth: 5,
			borderStyle: LineStyle.Dashed,
		});

		lineSeries.attachPrimitive(shape);

		edges = [];
		edgesElement.innerHTML = '';
	}
}

function roundNumber(n: number, dp: number) {
	const shiftedNumber = +`${Number(n).toFixed(20)}e+${dp}`;
	const roundedShiftedNumber = Math.round(shiftedNumber);
	const result = +`${roundedShiftedNumber}e-${dp}`;
	return result;
}
