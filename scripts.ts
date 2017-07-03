/// <reference path="typings/globals/jquery/index.d.ts"/>

interface DCTData {
    [index: number]: number[][]
}

var previousTime = Number(new Date());

var canvasSize = 256;




// trigger the update of the image element when the image loads
$(document).ready(function () {

    $(".upload-prompt").click(function(){
        $("#fileInputLabel").click();
    });
    var c: HTMLCanvasElement = < HTMLCanvasElement > document.getElementById("canvasElement");
    var ctx = c.getContext("2d");

    var imageElement = <HTMLImageElement>$('#imageViewer')[0];
    imageElement.onload = function() {
        drawImageToCanvas(<HTMLImageElement>this);
        imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
        DCTData = calculateDCT(imageData);
    }

    $("input[type='range']").change(function() {
        mappedDCTData = mapDCTValues(DCTData);
        IDCTData = generateIDCT(mappedDCTData);
        ctx.putImageData(IDCTData, 0, 0);
    });

    var DCTData: DCTData;
    var IDCTData = new ImageData(canvasSize, canvasSize);
    var imageData = new ImageData(canvasSize, canvasSize);
    var mappedDCTData: DCTData;
    checkpoint("Start calculations");

    
    // imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
    // DCTData = calculateDCT(imageData);
    // mappedDCTData = mapDCTValues(DCTData);
    // IDCTData = generateIDCT(mappedDCTData);
    // ctx.putImageData(IDCTData, 0, 0);


    // initially draw the first image to canvas
    $('#fileInput').on('change', function (ev: Event) {
        var f = ( < HTMLInputElement > ev.target).files[0];
        var fr = new FileReader();

        fr.onload = function (ev2) {
            console.dir(ev2);
            $('#imageViewer').attr('src', ( < FileReader > ev2.target).result);
            drawImageToCanvas(imageElement);
            imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
            DCTData = calculateDCT(imageData);
            mappedDCTData = mapDCTValues(DCTData);
            IDCTData = generateIDCT(mappedDCTData);
            ctx.putImageData(IDCTData, 0, 0);
        };

        fr.readAsDataURL(f);
    });
    $("#update").click(function () {
        mappedDCTData = mapDCTValues(DCTData);
        IDCTData = generateIDCT(mappedDCTData);
        ctx.putImageData(IDCTData, 0, 0);
    });
    $("#recalculate").click(function () {
        drawImageToCanvas(imageElement);
        imageData = ctx.getImageData(0, 0, canvasSize, canvasSize);
        DCTData = calculateDCT(imageData);
    });




function calculateDCT(imageData: ImageData): DCTData {
    var DCTData = generateDCT(imageData);
    return DCTData;
}


function drawImageToCanvas(imageElement: HTMLImageElement): void {
    ctx.drawImage(imageElement, 0, 0);
}

function drawImageDataToCanvas(imageData: ImageData): void {
    ctx.putImageData(imageData, 0, 0);
}

function drawDCTToCanvas(DCT: DCTData): void {
    var imageData = formatDCTAsImageData(DCT);
    ctx.putImageData(imageData, 0, 0);
}

function generateDCT(imageData: ImageData): DCTData {
    var DCTRowOutput = [];
    for (var i = 0; i < canvasSize; i++) {
        DCTRowOutput[i] = [];
    }
    var DCTFinalOutput: DCTData = new Array();
    for (var i = 0; i < canvasSize; i++) {
        DCTFinalOutput[i] = [];
    }
    for (var y = 0; y < canvasSize; y++) {
        for (var col = 0; col < 3; col++) {
            var DCTArray = [];
            for (var x = 0; x < canvasSize; x++) {
                DCTArray.push(Number(imageData.data[(y * 4 * canvasSize) + (x * 4) + col]));
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

function generateIDCT(DCTData: DCTData): ImageData {
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
            premultipliedDCT = IDCT(DCTArray);
            DCTRowOutput[y][col] = premultipliedDCT;
        }
    }
    //take the vertical IDCT results
    for (var x = 0; x < canvasSize; x++) {
        for (var col = 0; col < 3; col++) {
            var DCTArray = [];
            for (var y = 0; y < canvasSize; y++) {
                DCTArray.push(DCTRowOutput[y][col][x]);
            }
            var premultipliedDCT = IDCT(DCTArray);
            DCTFinalOutput[x][col] = premultipliedDCT;
        }
    }
    checkpoint("DCT Horizontally");
    var DCTImageData = formatDCTAsImageData(DCTFinalOutput);
    return DCTImageData;
}

function formatDCTAsImageData(DCT: DCTData): ImageData {
    var imageData = new ImageData(canvasSize, canvasSize);
    for (var x = 0; x < canvasSize; x++) {
        for (var y = 0; y < canvasSize; y++) {
            for (var col = 0; col < 4; col++) {
                imageData.data[(x * canvasSize * 4) + (y * 4) + col] = col != 3 ? DCT[y][col][x] : 255;
            }
        }
    }
    return imageData;
}

function mapDCTValues(array: DCTData): DCTData {
    // data is in form array[x][col][y]
    var newArray: DCTData = JSON.parse(JSON.stringify(array));
    var lo = Number(( < HTMLInputElement > document.querySelector("#freqLo")).value);
    var md = Number(( < HTMLInputElement > document.querySelector("#freqMd")).value);
    var hi = Number(( < HTMLInputElement > document.querySelector("#freqHi")).value);
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


function lerp(v1: number, v2: number, progress: number): number {
    return (v1 * (1 - progress) + v2 * progress);
}

function checkpoint(message: String) {
    console.log(message + ": " + Math.floor((Number(new Date()) - previousTime) * 10) / 10000 + " sec.");
    previousTime = Number(new Date());
}






// Math functions
function FFT(re: Float64Array, im: Float64Array) {
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

function DCT(s: number[]): number[] {
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

function IDCT(s: number[]): number[] {
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

});