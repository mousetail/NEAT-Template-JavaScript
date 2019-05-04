export function randomGaussian(mean, sd) {
    let y1, x1, x2, w;
    do {
        x1 = Math.random()*2 - 1;
        x2 = Math.random()*2 - 1;
        w = x1 * x1 + x2 * x2;
    } while (w >= 1);
    w = Math.sqrt((-2 * Math.log(w)) / w);
    y1 = x1 * w;

    let m = mean || 0;
    let s = sd || 1;
    return y1 * s + m;
}
