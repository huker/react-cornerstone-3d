import React, {useEffect, useRef, useState} from "react";
import {Enums, RenderingEngine} from "@cornerstonejs/core";
import {Modal, Tooltip} from 'antd';

const {ViewportType, Events} = Enums;

const windowWidth = 1500;
const windowCenter = -450;

const lower = windowCenter - windowWidth / 2.0;
const upper = windowCenter + windowWidth / 2.0;

const ctVoiRange = {lower, upper};

let outputImage = {};
const CustomCanvasImageTool = (props) => {

    let customCanvasVp = useRef(null);

    const {stackImageIds} = props;

    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [images, setImages] = useState(null);

    useEffect(() => {
    }, [])

    const getCustomCanvasData = async () => {
        setOpen(true);
        const element = document.createElement("div");
        element.id = "cornerstone-custom-canvas";
        element.style.width = "350px";
        element.style.height = "350px";
        element.style.visible = "hidden";
        document.body.appendChild(element);
        const viewportId = "stack_custom_canvas";
        const renderingEngine = new RenderingEngine("RenderingEngineDoc");
        const viewportInput = {
            viewportId,
            type: ViewportType.STACK,
            element
        };
        renderingEngine.enableElement(viewportInput);
        customCanvasVp.value = renderingEngine.getViewport(viewportId);
        customCanvasVp.value.element.addEventListener(Events.IMAGE_RENDERED, onImageRender);

        customCanvasVp.value.setStack(stackImageIds.value);
        customCanvasVp.value.setProperties({voiRange: ctVoiRange});

        // 取第二页 第四页 做例子
        const mockSlices = [1, 3];
        const result = [];
        for (let i = 0; i < mockSlices.length; i++) {
            const image = await getOneImage(mockSlices[i]);
            result.push({
                slice: mockSlices[i],
                image
            });
        }
        setImages(result);
        customCanvasVp.value.element.removeEventListener(Events.IMAGE_RENDERED, onImageRender);
        document.body.removeChild(element);
        setLoading(false);
    }

    const getOneImage = (slice) => {
        return new Promise((resolve, reject) => {
            outputImage = {
                resolve,
                data: null
            };
            customCanvasVp.value.setImageIdIndex(slice);
        })
    }

    const onImageRender = () => {
        const data = customCanvasVp.value.canvas.toDataURL('image/png');
        outputImage.resolve(data);
    }

    return (
        <>
            <Tooltip
                title="比如打印报告中需要插入各个病灶对应图层的图像。现打印第二张、第四张图像的数据作为例子">
                <button onClick={getCustomCanvasData} style={{marginRight: '5px'}}>虚拟画布数据</button>
            </Tooltip>
            <Modal
                loading={loading}
                open={open}
                title="结果"
                footer={null}
                onCancel={() => {
                    setOpen(false);
                }}
            >
                {
                    images && images.map((value, index) => {
                        return <div key={'custom-output-image-' + index}>
                            <p>slice index: {value.slice}</p>
                            <img src={value.image}/>
                        </div>
                    })
                }
            </Modal>
        </>
    );
}

export default CustomCanvasImageTool;
