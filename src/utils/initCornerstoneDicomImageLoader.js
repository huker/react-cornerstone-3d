import dicomParser from 'dicom-parser';
import * as cornerstone from '@cornerstonejs/core';
import * as cornerstoneTools from '@cornerstonejs/tools';
import cornerstoneDICOMImageLoader from '@cornerstonejs/dicom-image-loader';

window.cornerstone = cornerstone;
window.cornerstoneTools = cornerstoneTools;
const {preferSizeOverAccuracy, useNorm16Texture} =
    cornerstone.getConfiguration().rendering;

// const token = `eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJfaWQiOiI1YjY5MGNmOTZkYjI2MzA0M2MzM2QxZjYiLCJ1c2VybmFtZSI6ImxpdSIsInJlYWxuYW1lIjoi5LqR5Zu-5rWL6K-V55So5Yy755SfIiwidHlwZSI6InVzZXIiLCJhY2NvdW50X3R5cGUiOiJwaHlzaWNpYW4iLCJ2ZW5kb3IiOiI1NzcxZDJjYTQwODU4YzY2NTVjYjQ0YjkiLCJzYWx0Ijoic2t2L1ZVVnljMTB0Q0NHMzlCSkFsdz09IiwiaWF0IjoxNzE5MzY5NzcxLCJleHAiOjE3MTk0MjAxNzF9.MZF-2n-o7OBJFyE5Vn58TvNZNbUoCKTf24HNgf2fuS0`;

export default function initCornerstoneDICOMImageLoader() {
    cornerstoneDICOMImageLoader.external.cornerstone = cornerstone;
    cornerstoneDICOMImageLoader.external.dicomParser = dicomParser;
    cornerstoneDICOMImageLoader.configure({
        useWebWorkers: true,
        decodeConfig: {
            convertFloatPixelDataToInt: false,
            use16BitDataType: preferSizeOverAccuracy || useNorm16Texture,
        },
        // 走wado uri时打开这儿
        // beforeSend: (xhr) => {
        //     xhr.setRequestHeader('Authorization', `bearer ${token}`);
        // }
    });

    let maxWebWorkers = 1;

    if (navigator.hardwareConcurrency) {
        maxWebWorkers = Math.min(navigator.hardwareConcurrency, 7);
    }

    var config = {
        maxWebWorkers,
        startWebWorkersOnDemand: false,
        taskConfiguration: {
            decodeTask: {
                initializeCodecsOnStartup: false,
                strict: false,
            },
        },
    };

    cornerstoneDICOMImageLoader.webWorkerManager.initialize(config);
    cornerstoneTools.init();
}
