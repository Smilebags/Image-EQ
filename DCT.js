function FFT(re, im) {
    var N = re.length;
    for (var i = 0; i < N; i++) {
        for (var j = 0, h = i, k = N; k >>= 1; h >>= 1)
            j = (j << 1) | (h & 1);
        if (j > i) {
            re[j] = [re[i], re[i] = re[j]][0]
            im[j] = [im[i], im[i] = im[j]][0]
        }
    }
    for (var hN = 1; hN * 2 <= N; hN *= 2)
        for (var i = 0; i < N; i += hN * 2)
            for (var j = i; j < i + hN; j++) {
                var cos = Math.cos(Math.PI * (j - i) / hN),
                    sin = Math.sin(Math.PI * (j - i) / hN)
                var tre = re[j + hN] * cos + im[j + hN] * sin,
                    tim = -re[j + hN] * sin + im[j + hN] * cos;
                re[j + hN] = re[j] - tre;
                im[j + hN] = im[j] - tim;
                re[j] += tre;
                im[j] += tim;
            }
};

function DCT(s) {
    var N = s.length,
        K = -Math.PI / (2 * N),
        re = new Float64Array(N),
        im = new Float64Array(N);
    for (var i = 0, j = N; j > i; i++) {
        re[i] = s[i * 2];
        re[--j] = s[i * 2 + 1];
    }
    FFT(re, im);
    for (var i = 0; i < N; i++)
        s[i] = 2 * re[i] * Math.cos(K * i) - 2 * im[i] * Math.sin(K * i);
};

function IDCT(s) {
    var N = s.length;
    var K = Math.PI / (2 * N);
    var im = new Float64Array(N);
    var re = new Float64Array(N);
    re[0] = s[0] / N / 2;
    for (var i = 1; i < N; i++) {
        var im2 = Math.sin(i * K);
        var re2 = Math.cos(i * K);
        re[i] = (s[N - i] * im2 + s[i] * re2) / N / 2;
        im[i] = (im2 * s[i] - s[N - i] * re2) / N / 2;
    }
    FFT(im, re);
    for (var i = 0; i < N / 2; i++) {
        s[2 * i] = re[i]
        s[2 * i + 1] = re[N - i - 1]
    }
}



// set up two copies of test data
var origArr = [45, 39, 38, 34, 34, 27, 26, 29, 33, 56, 59, 94, 96, 87, 76, 53, 25, 9, 6, 6, 6, 10, 18, 27, 54, 89, 97, 98, 96, 70, 20, 7];
var arr = [45, 39, 38, 34, 34, 27, 26, 29, 33, 56, 59, 94, 96, 87, 76, 53, 25, 9, 6, 6, 6, 10, 18, 27, 54, 89, 97, 98, 96, 70, 20, 7];
// convert the second array into its discrete cosine transform
DCT(arr);
console.log(arr);
// convert it back
IDCT(arr);
console.log(arr);