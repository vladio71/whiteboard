import {getPointOnCurve} from "./CurvesCreationTool";

export function getDefaultBezierControlPoints(start, end) {
    let cp1 = {x: (end.x - start.x) / 5 + start.x, y: ((end.y - start.y) / 5) * 4 + start.y};
    let cp2 = {x: ((end.x - start.x) / 5) * 4 + start.x, y: (end.y - start.y) / 5 + start.y};
    return {cp1, cp2}
}

export function makeCurve(start, end) {
    const {cp1, cp2} = getDefaultBezierControlPoints(start, end)
    return {cp1, cp2}
}

function binom(n, k) {
    let coeff = 1;
    for (let i = n - k + 1; i <= n; i++) coeff *= i;
    for (let i = 1; i <= k; i++) coeff /= i;
    return coeff;
}

export function bezier(t, plist) {
    var order = plist.length - 1;

    var y = 0;
    var x = 0;

    for (let i = 0; i <= order; i++) {
        x = x + (binom(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (plist[i].x));
        y = y + (binom(order, i) * Math.pow((1 - t), (order - i)) * Math.pow(t, i) * (plist[i].y));
    }

    return {
        x: x,
        y: y
    };
}

export function makeHightOrderCurvePath(path, points) {

    let accuracy = 0.01;
    for (let i = 0; i < 1; i += accuracy) {
        let p = bezier(i, points);
        path.lineTo(p.x, p.y);
    }
    const last = points[points.length - 1]
    path.lineTo(last.x, last.y)

}

export function getPoints(data) {
    if (data.length <= 2) return data
    return data.map(el => {
        return el?.point ? el.point : el
    })
}

export const moveCurve = (curve, d) => {
    const path = new Path2D();
    const newCurve = {
        ...curve,
        points: curve.points.map(p => {
            if (p?.point) {
                return {
                    ...p,
                    point: {x: p.point.x + d.x, y: p.point.y + d.y}
                }
            } else {
                return {x: p.x + d.x, y: p.y + d.y}
            }

        }),
    }
    let end
    let points
    if (newCurve.points.length < 3) {
        path.moveTo(newCurve.points[0].x, newCurve.points[0].y);
        const start = newCurve.points[0]
        end = newCurve.points[newCurve.points.length - 1]
        points = [start, end]
        makeCurve(start, end, path)
    } else {
        points = getPoints(newCurve.points)
        end = points[points.length - 1]
        makeHightOrderCurvePath(path, points)
    }

    return {
        newCurve,
        points,
        end,
        path
    }
}

export function AlignCurveToNearestPoint(p, ctx, scale, last) {
    const diff = {x: p.center.x - last.x, y: p.center.y - last.y}
    let n = 1
    if (Math.abs(diff.y) > Math.abs(diff.x)) {
        if (diff.y > 0) {
            while (ctx.isPointInPath(p.i, p.center.x, p.center.y - n)) {
                n++
            }
            return [getAdditionalPoint({
                x: p.center.x,
                y: p.center.y - n - 10
            }, p.center), {x: p.center.x, y: p.center.y - n - 10 * scale.current}]
        } else {
            while (ctx.isPointInPath(p.i, p.center.x, p.center.y + n)) {
                n++
            }
            return [getAdditionalPoint({
                x: p.center.x,
                y: p.center.y + n + 10
            }, p.center), {x: p.center.x, y: p.center.y + n + 10 * scale.current}]
        }
    } else {
        if (diff.x > 0) {
            while (ctx.isPointInPath(p.i, p.center.x - n, p.center.y)) {
                n++
            }
            return [getAdditionalPoint({
                x: p.center.x - n - 10,
                y: p.center.y
            }, p.center), {x: p.center.x - n - 10 * scale.current, y: p.center.y}]
        } else {
            while (ctx.isPointInPath(p.i, p.center.x + n, p.center.y)) {
                n++
            }
            return [getAdditionalPoint({
                x: p.center.x + n + 10,
                y: p.center.y
            }, p.center), {x: p.center.x + n + 10 * scale.current, y: p.center.y}]
        }
    }
}

export function AlignPointToObjectBorder(p, ctx, clientX, clientY) {
    let posX = clientX
    let posY = clientY

    for (let i = 1; i < 15; i++) {
        if (ctx.isPointInStroke(p.p, posX + i, posY)) {
            return [getAdditionalPoint({x: posX + i, y: posY}, p.center), {x: posX + i, y: posY}]

        }
        if (ctx.isPointInStroke(p.p, posX - i, posY)) {
            return [getAdditionalPoint({x: posX - i, y: posY}, p.center), {x: posX - i, y: posY}]

        }
        if (ctx.isPointInStroke(p.p, posX, posY + i)) {
            return [getAdditionalPoint({x: posX, y: posY + i}, p.center), {x: posX, y: posY + i}]

        }
        if (ctx.isPointInStroke(p.p, posX, posY - i)) {
            return [getAdditionalPoint({x: posX, y: posY - i}, p.center), {x: posX, y: posY - i}]

        }
    }
}

export function getAdditionalPoint(point, center) {
    let d = {x: point.x - center.x, y: point.y - center.y}
    if (Math.abs(d.y) > 180) {
        d.y = d.y > 0 ? 180 : -180
    }
    if (Math.abs(d.x) > 180) {
        d.x = d.x > 0 ? 180 : -180
    }
    if (Math.abs(d.y) < 50) {
        d.y = d.y > 0 ? d.y + 50 : d.y - 50
    }
    if (Math.abs(d.x) > 50) {
        d.x = d.x > 0 ? d.x + 50 : d.x - 50
    }
    return {x: point.x + d.x, y: point.y + d.y}

}

export function drawArrow(ctx, angle, point) {
    const size = ctx.lineWidth * 3 + 5;
    ctx.beginPath();
    ctx.save();

    ctx.translate(point.x, point.y);
    ctx.rotate(angle);
    ctx.moveTo(-size / 2, 0);
    ctx.lineTo(-size, -size);
    ctx.lineTo(size / 2, 0);
    ctx.lineTo(-size, size);
    ctx.lineTo(-size / 2, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
}

export function getCurveArrowAngle(points, borders, common) {


    const pointsForRender = getPoints(points).map(p => {
        return {
            x: p.x - (borders.minX) * common.scale + 200,
            y: p.y - (borders.minY) * common.scale + 200
        }
    })


    const tStart = bezier(0.98, pointsForRender)
    const dx = pointsForRender[points.length - 1].x - tStart.x;
    const dy = pointsForRender[points.length - 1].y - tStart.y;
    const endingAngle = Math.atan2(dy, dx);

    return {
        endingAngle
    }

}

export function calculatePointOnCurve(plist, t) {
    if (plist.length > 2) {
        return bezier(t, getPoints(plist))
    } else {
        const start = plist[0]
        const end = plist[1]
        const {cp1, cp2} = getDefaultBezierControlPoints(start, end)
        return getPointOnCurve(start, cp1, cp2, end, t)
    }
}

export function calculatePointsForCurve(plist) {

    if (plist.length > 2) {
        return calculateHighOrderPoints(plist)
    } else {
        const start = plist[0]
        const end = plist[1]
        const {cp1, cp2} = getDefaultBezierControlPoints(start, end)
        return {
            addPoints: [getPointOnCurve(start, cp1, cp2, end, 0.5)],
            points: plist
        }
    }
}


export function calculateHighOrderPoints(pArr) {
    const addPoints = []
    const points = []
    const samplePoints = [...pArr]
    let progress = 0
    const step = 1 / ((samplePoints.length - 1) * 2)
    samplePoints.forEach((p, i) => {

        points.push(bezier(progress, getPoints(samplePoints)))
        progress += step

        if (i !== samplePoints.length - 1) {
            addPoints.push(bezier(progress, getPoints(samplePoints)))
            progress += step
        }
    })
    return {
        addPoints,
        points
    }
}