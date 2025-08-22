# Shape Drawing - Lightweight Charts™ Plugin

This plugin adds enables for arbitrary shapes to be drawn on the chart. It requires LWC version `5.0.0` or greater.

## Running Locally

```shell
npm install
npm run dev
```

Visit `localhost:5173` in the browser.

## Example:

```js
// Draw a triangle
const shape1 = new ShapeDrawing(
	[
		{ price: 100, time: 1755856347 },
		{ price: 100, time: 1755856347 },
		{ price: 500, time: 1755846347 },
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
```

In `./src/example/example.ts`, the following is shown:

<img width="1002" height="503" alt="demo screenshot" src="https://github.com/user-attachments/assets/cd751349-9a9f-4f4c-858d-6d650419ea9f" />

The file also shows an implementation of interactive drawing via clicking on the chart. E.g.

https://github.com/user-attachments/assets/97dc1993-6dd6-4c50-b951-a008db28c577
