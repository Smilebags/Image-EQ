export function FFT(re: Float64Array, im: Float64Array) {
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

export function DCT(s: number[]): number[] {
  var N = s.length,
    K = -Math.PI / (2 * N),
    re = new Float64Array(N),
    im = new Float64Array(N);
  for (var i = 0, j = N; j > i; i++) {
    re[i] = s[i * 2];
    re[--j] = s[i * 2 + 1];
  }
  FFT(re, im);
  var returnArray = [];
  for (var i = 0; i < N; i++) {
    returnArray[i] = 2 * re[i] * Math.cos(K * i) - 2 * im[i] * Math.sin(K * i);
  }
  return returnArray;
};

export function IDCT(s: number[]): number[] {
  var out = new Array;
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
    out[2 * i] = re[i]
    out[2 * i + 1] = re[N - i - 1]
  }
  return out;
}



