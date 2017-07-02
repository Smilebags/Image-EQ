var previousTime = new Date();

var DCTData, IDCTData = [];
var imageData, mappedDCTData;

var canvasSize = 256;

var c = document.getElementById("canvasElement");
var ctx = c.getContext("2d");

// trigger the update of the image element when the image loads
$(document).ready(function() {
    checkpoint("Start calculations");
    // initially draw the first image to canvas
    drawDCTToCanvas($('#imageViewer')[0]);
    $('#fileInput').on('change', function(ev) {
        var f = ev.target.files[0];
        var fr = new FileReader();

        fr.onload = function(ev2) {
            console.dir(ev2);
            $('#imageViewer').attr('src', ev2.target.result);
            calculateDCT();
            updateOutput();
        };

        fr.readAsDataURL(f);
    });
    $("#update").click(function() {
        updateOutput();
    });
});



// create Image from URL
function imageFromURL(url) {
    var imageObj = new Image();
    imageObj.src = url;
    return
}

function drawImageToCanvas(imageElement) {
    ctx.drawImage(imageElement, 0, 0);
}

function drawDCTToCanvas(imageElement) {
    checkpoint("Start drawDCTToCanvas");

    ctx.drawImage(imageElement, 0, 0);

    checkpoint("Get imageData");


}

function generateDCT(imageData) {
    var DCTImageData = imageData;
    var DCTRowOutput = [];
    for (var i = 0; i < canvasSize; i++) {
        DCTRowOutput[i] = [];
    }
    var DCTFinalOutput = [];
    for (var i = 0; i < canvasSize; i++) {
        DCTFinalOutput[i] = [];
    }
    for (var y = 0; y < canvasSize; y++) {
        for (var col = 0; col < 3; col++) {
            var DCTArray = [];
            for (var x = 0; x < canvasSize; x++) {
                DCTArray.push(imageData.data[(y * 4 * canvasSize) + (x * 4) + col]);
            }
            var premultipliedDCT = DCT(DCTArray);
            DCTRowOutput[y][col] = premultipliedDCT;
        }
    }
    checkpoint("DCT vertically");
    for (var x = 0; x < canvasSize; x++) {
        for (var col = 0; col < 3; col++) {
            var DCTArray = [];
            for (var y = 0; y < canvasSize; y++) {
                DCTArray.push(DCTRowOutput[y][col][x]);
            }
            var premultipliedDCT = DCT(DCTArray);
            DCTFinalOutput[x][col] = premultipliedDCT;
        }
    }
    checkpoint("DCT Horizontally");
    return DCTFinalOutput;
}

function generateIDCT(DCTData, imageDataTemplate) {
    var DCTImageData = imageDataTemplate;
    var DCTRowOutput = [];
    for (var i = 0; i < canvasSize; i++) {
        DCTRowOutput[i] = [];
    }
    var DCTFinalOutput = [];
    for (var i = 0; i < canvasSize; i++) {
        DCTFinalOutput[i] = [];
    }
    for (var y = 0; y < canvasSize; y++) {
        for (var col = 0; col < 3; col++) {
            var DCTArray = [];
            for (var x = 0; x < canvasSize; x++) {
                DCTArray.push(DCTData[x][col][y]);
            }
            var premultipliedDCT = DCTArray;
            IDCT(premultipliedDCT);
            DCTRowOutput[y][col] = premultipliedDCT;
        }
    }
    checkpoint("DCT vertically");
    for (var x = 0; x < canvasSize; x++) {
        for (var col = 0; col < 3; col++) {
            var DCTArray = [];
            for (var y = 0; y < canvasSize; y++) {
                DCTArray.push(DCTRowOutput[y][col][x]);
            }
            var premultipliedDCT = DCTArray;
            IDCT(premultipliedDCT);
            DCTFinalOutput[x][col] = premultipliedDCT;
        }
    }
    checkpoint("DCT Horizontally");
    for (var x = 0; x < canvasSize; x++) {
        for (var y = 0; y < canvasSize; y++) {
            for (var col = 0; col < 3; col++) {
                DCTImageData.data[(x * canvasSize * 4) + (y * 4) + col] = DCTFinalOutput[x][col][y];
            }
        }
    }
    return DCTImageData;
}

function mapDCTValues(array) {
    // data is in form array[x][col][y]
    var newArray = array;
    var lo = document.querySelector("#freqLo").value;
    var md = document.querySelector("#freqMd").value;
    var hi = document.querySelector("#freqHi").value;
    for (var x = 0; x < canvasSize; x++) {
        for (var col = 0; col < 3; col++) {
            for (var y = 0; y < canvasSize; y++) {
                if (!(x == 0 && y == 0)) {
                    var weight = Math.sqrt((Math.pow((x / canvasSize), 2) + Math.pow((y / canvasSize), 2)) / Math.sqrt(2));
                    var multValue = weight <= 0.5 ? lerp(lo, md, weight * 2) : lerp(md, hi, (weight * 2) - 1);
                    newArray[x][col][y] *= multValue; //(1 / (x ^ 2 + y ^ 2));
                }
            }
        }
    }
    return newArray;
}


function lerp(v1, v2, progress) {
    return v1 * (1 - progress) + v2 * progress;
}

function calculateDCT() {
    drawImageToCanvas($('#imageViewer')[0])
    imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    DCTData = generateDCT(imageData);
}

function updateOutput() {
    mappedDCTData = mapDCTValues(DCTData);
    IDCTData = generateIDCT(mappedDCTData, imageData);
    ctx.putImageData(IDCTData, 0, 0);
}

function checkpoint(message) {
    console.log(message + ": " + Math.floor((new Date() - previousTime) * 10) / 10000 + " sec.");
    previousTime = new Date();
}






// Math functions
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
    var returnArray = [];
    for (var i = 0; i < N; i++) {
        returnArray[i] = 2 * re[i] * Math.cos(K * i) - 2 * im[i] * Math.sin(K * i);
    }
    return returnArray;
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