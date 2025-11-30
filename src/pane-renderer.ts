import { CanvasRenderingTarget2D } from 'fancy-canvas';
import { Coordinate, IPrimitivePaneRenderer, LineStyle } from 'lightweight-charts';
import { ViewPoint } from './pane-view';
import { HoveredCornerShape, ShapeDrawingOptions } from './options';

export class ShapeDrawingPaneRenderer implements IPrimitivePaneRenderer {
	_points: ViewPoint[];
	_options: ShapeDrawingOptions;
	_applyHighlighting: boolean;

	constructor(points: ViewPoint[], options: ShapeDrawingOptions, applyHighlighting: boolean) {
		this._points = points;
		this._applyHighlighting = applyHighlighting;
		this._options = options;
	}

	draw(target: CanvasRenderingTarget2D) {
		target.useBitmapCoordinateSpace(scope => {
			if (this._points.some(p => p.x === null || p.y === null)) {
				return;
			}

			let borderWidth = this._options.borderWidth;
			let fillOpacity = this._options.fillOpacity;

			if (this._applyHighlighting) {
				borderWidth = this._options.hoveredBorderWidth;
				fillOpacity = this._options.hoveredFillOpacity;
			}

			const points = this._points.map(p => ({
				x: Math.round(p.x! * scope.horizontalPixelRatio) as Coordinate,
				y: Math.round(p.y! * scope.verticalPixelRatio) as Coordinate,
			}));
			const ctx = scope.context;

			ctx.beginPath();

			let drawingPoints = points;

			if (this._options.extendToLeft || this._options.extendToRight) {
				// For drawing a horizontal line, but not the hover animations on the far left/right.
				drawingPoints = [];

				if (this._options.extendToLeft) {
					drawingPoints.push({ x: 0 as Coordinate, y: points[0].y });
				}

				drawingPoints.push(...points);

				if (this._options.extendToRight) {
					drawingPoints.push({ x: scope.bitmapSize.width as Coordinate, y: points[points.length - 1].y });
				}
			}

			if (this._options.joinFirstToLastCorner) {
				ctx.moveTo(drawingPoints[drawingPoints.length - 1].x, drawingPoints[drawingPoints.length - 1].y);
			}

			for (let i = 0; i < drawingPoints.length; ++i) {
				ctx.lineTo(drawingPoints[i].x, drawingPoints[i].y);
			}

			if (this._options.joinFirstToLastCorner) {
				if (this._options.fillColor.startsWith('rgb')) {
					if (this._options.fillColor.startsWith('rgba')) {
						ctx.fillStyle = this._options.fillColor;
					} else {
						// Converts rgb(a, b, c) to rgba(a, b, c, 0.5) if fillOpacity is 0.5
						ctx.fillStyle = this._options.fillColor.substring(
							0, this._options.fillColor.length - 1
						) + `, ${fillOpacity})`;
					}
				} else {
					ctx.fillStyle = this._hexToRgba(this._options.fillColor, fillOpacity);
				}
				ctx.fill();
			}

			if (this._options.borderVisible) {
				ctx.strokeStyle = this._options.borderColor;
				ctx.lineWidth = borderWidth;
				setLineStyle(ctx, this._options.borderStyle);
			} else { // border will default to a thin black line without the following
				ctx.lineWidth = 0.00001;
				ctx.strokeStyle = this._hexToRgba(this._options.fillColor, fillOpacity);
			}

			ctx.stroke();

			if (this._applyHighlighting && this._options.hoveredCornerShape !== null) {
				switch (this._options.hoveredCornerShape) {
					case HoveredCornerShape.Circle: {
						ctx.fillStyle = this._options.borderColor;
						const cornerRadius = this._options.hoveredCornerSize / 2;

						for (const point of points) {
							ctx.beginPath();
							ctx.arc(point.x, point.y, cornerRadius, 0, 2 * Math.PI);
							ctx.fill();
						}
						break;
					}
					case HoveredCornerShape.Square: {
						ctx.fillStyle = this._options.borderColor;
						const cornerSize = this._options.hoveredCornerSize;

						for (const point of points) {
							ctx.beginPath();
							ctx.rect(point.x - cornerSize / 2, point.y - cornerSize / 2, cornerSize, cornerSize);
							ctx.fill();
						}
						break;
					}
				}
			}
		});
	}

	private _hexToRgba(hex: string, opacity: number): string {
		hex = hex.substring(1);

		if (hex.length === 3) {
			hex = `${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`;
		}

		const r = parseInt(hex.substring(0, 2), 16);
		const g = parseInt(hex.substring(2, 4), 16);
		const b = parseInt(hex.substring(4, 6), 16);

		return `rgba(${r}, ${g}, ${b}, ${opacity})`;
	}
}

// This is not yet exported via the public API. So for now, it has just been copied from
// lightweight-charts/src/renderers/draw-line.ts
export function setLineStyle(ctx: CanvasRenderingContext2D, style: LineStyle): void {
	const dashPatterns = {
		[LineStyle.Solid]: [],
		[LineStyle.Dotted]: [ctx.lineWidth, ctx.lineWidth],
		[LineStyle.Dashed]: [2 * ctx.lineWidth, 2 * ctx.lineWidth],
		[LineStyle.LargeDashed]: [6 * ctx.lineWidth, 6 * ctx.lineWidth],
		[LineStyle.SparseDotted]: [ctx.lineWidth, 4 * ctx.lineWidth],
	};

	const dashPattern = dashPatterns[style];
	ctx.setLineDash(dashPattern);
}
