import {useEffect} from "react";
import {Enums, init as csRenderInit, RenderingEngine} from "@cornerstonejs/core";
import initCornerstoneDICOMImageLoader from '../utils/initCornerstoneDicomImageLoader.js';

const {ViewportType} = Enums;

const renderingEngineId = 'myRenderingEngine';
const viewportId = 'CT_STACK';

const windowWidth = 400;
const windowCenter = 40;

const lower = windowCenter - windowWidth / 2.0;
const upper = windowCenter + windowWidth / 2.0;

const ctVoiRange = {lower, upper};

/**
 * wodo uri的方式
 */
function StackImages() {

    let viewport;

    useEffect(() => {
        const content = document.getElementById('content');
        if (!content.children || (content.children.length === 0)) {
            setup();
        }
    }, [])

    const setup = async () => {
        const content = document.getElementById('content');
        const element = document.createElement('div');
        element.id = 'cornerstone-element';
        element.style.width = '50%';
        element.style.height = '100%';
        content.appendChild(element);

        initCornerstoneDICOMImageLoader();
        await csRenderInit({
            gpuTier: {
                tier: 0
            }
        });

        const renderingEngine = new RenderingEngine(renderingEngineId);

        const viewportInput = {
            viewportId,
            type: ViewportType.STACK,
            element
        };

        renderingEngine.enableElement(viewportInput);

        viewport = (
            renderingEngine.getViewport(viewportId)
        );
        const stack = [`wadouri:http://10.16.100.58/api/studies/1.2.156.112605.189250941700568.240411083139.2.9628.13045/series/1.2.156.112605.189250941700568.240411083146.3.6096.46376/instances/1.2.156.112605.189250941700568.240411083231.4.18284.73325/wodo`];
        await viewport.setStack(stack);
        viewport.setProperties({voiRange: ctVoiRange});
        viewport.render();
    }

    const getInfo = () => {
    }

    const drawPoint = () => {
        const context = viewport.canvas.getContext('2d');
        context.fillStyle = 'rgba(203,195,145,0.5)';
        context.fillRect(0, 0, 10, 10)
    }

    return (
        <div style={{width: '100%', height: '400px'}}>
            <div>
                <button onClick={getInfo}>get info</button>
                <button onClick={drawPoint}>draw</button>
            </div>
            <div id="content" style={{width: '100%', height: '100%'}}/>
        </div>

    );
}

export default StackImages;
