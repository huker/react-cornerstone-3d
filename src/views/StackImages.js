import React, {useEffect, useRef, useState} from "react";
import {Dropdown, Space} from 'antd';
import {DownOutlined} from '@ant-design/icons';
import {Enums, init as csRenderInit, RenderingEngine} from "@cornerstonejs/core";
import {wadouri} from '@cornerstonejs/dicom-image-loader';
import initCornerstoneDICOMImageLoader from '../utils/initCornerstoneDicomImageLoader.js';
import * as cornerstoneTools from '@cornerstonejs/tools';
import './index.css';

const {ViewportType, Events} = Enums;

const renderingEngineId = 'myRenderingEngine';
const viewportId = 'CT_STACK';

const windowWidth = 1500;
const windowCenter = -450;

const lower = windowCenter - windowWidth / 2.0;
const upper = windowCenter + windowWidth / 2.0;

const ctVoiRange = {lower, upper};

const tools = [
    {
        tool: cornerstoneTools.WindowLevelTool,
        name: cornerstoneTools.WindowLevelTool.toolName,
        mouse: cornerstoneTools.Enums.MouseBindings.Primary
    },
    {
        tool: cornerstoneTools.PanTool,
        name: cornerstoneTools.PanTool.toolName,
        mouse: cornerstoneTools.Enums.MouseBindings.Primary
    },
    {
        tool: cornerstoneTools.ZoomTool,
        name: cornerstoneTools.ZoomTool.toolName,
        mouse: cornerstoneTools.Enums.MouseBindings.Secondary
    },
    {
        tool: cornerstoneTools.StackScrollMouseWheelTool,
        name: cornerstoneTools.StackScrollMouseWheelTool.toolName
    },
    {
        tool: cornerstoneTools.LengthTool,
        name: cornerstoneTools.LengthTool.toolName,
        mouse: cornerstoneTools.Enums.MouseBindings.Primary
    },
    {
        tool: cornerstoneTools.ProbeTool,
        name: cornerstoneTools.ProbeTool.toolName,
        mouse: cornerstoneTools.Enums.MouseBindings.Primary
    }
];

const menuTools = [
    {
        label: 'Length Tool',
        key: cornerstoneTools.LengthTool.toolName,
    },
    {
        label: 'Probe Tool',
        key: cornerstoneTools.ProbeTool.toolName,
    }
];

/**
 * demo按照file加载的模式
 */
function StackImages() {

    let toolGroup = useRef(null);

    let pointRectShowStateRef = useRef('hidden');

    let [viewport, setViewport] = useState(null);
    let [dicomBasicInfo, setDicomBasicInfo] = useState(null);
    let [currentImageIdIndex, setCurrentImageIdIndex] = useState(0);
    let [pointRectShowState, setPointRectShowState] = useState('hidden');   // show hidden

    useEffect(() => {
        const content = document.getElementById('content');
        if (!content.children || (content.children.length === 0)) {
            setup();
        }
    }, [])

    useEffect(() => {
        pointRectShowStateRef.current = pointRectShowState;
    }, [pointRectShowState])

    const setup = async () => {
        // dom
        const content = document.getElementById('content');
        const element = document.createElement('div');
        element.id = 'cornerstone-element';
        element.style.width = '100%';
        element.style.height = '100%';
        content.appendChild(element);
        // init
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
        setViewport(renderingEngine.getViewport(viewportId));
        initTools();
    }

    const onFileChange = async (event) => {
        const files = event.target.files;
        if (!files) {
            return;
        }
        const imageIds = [];
        for (let i = 0; i < files.length; i++) {
            imageIds[i] = wadouri.fileManager.add(files[i]);
        }
        loadImageStack(imageIds);
    }

    const loadImageStack = async (imageIds) => {
        // stack render
        await viewport.setStack(imageIds);
        viewport.setProperties({voiRange: ctVoiRange});
        viewport.render();
        // load dicom info
        const image = viewport.csImage;
        const patientName = image.data.string('x00100010') || 'N/A';
        const patientID = image.data.string('x00100020') || 'N/A';
        const patientAge = image.data.string('x00101010') || 'N/A';
        const patientSex = image.data.string('x00100040') || 'N/A';
        setDicomBasicInfo({patientName, patientID, patientAge, patientSex});
        // add event listener
        viewport.element.addEventListener(Events.IMAGE_RENDERED, onImageRender);
    }

    const onImageRender = () => {
        setCurrentImageIdIndex(viewport.currentImageIdIndex);
        if (pointRectShowStateRef.current === 'show') {
            drawRect();
        }
    }

    const initTools = () => {
        tools.forEach((v) => {
            cornerstoneTools.addTool(v.tool);
        })
        toolGroup.current = cornerstoneTools.ToolGroupManager.createToolGroup('myToolGroup');
        tools.forEach((v) => {
            toolGroup.current.addTool(v.name);
        })
        // 左键
        tools.forEach((v) => {
            if (v.mouse) {
                // 包含鼠标事件的工具
                toolGroup.current.setToolActive(v.name, {
                    bindings: [{mouseButton: v.mouse}]
                });
            } else {
                toolGroup.current.setToolActive(v.name);
            }
        })
        toolGroup.current.addViewport(viewportId, renderingEngineId);
    }

    const handleToolMenuClick = (info) => {
        tools.forEach((v) => {
            if (v.mouse && (v.mouse === cornerstoneTools.Enums.MouseBindings.Primary)) {
                toolGroup.current.setToolPassive(v.name);
            }
        })
        toolGroup.current.setToolActive(info.key, {
            bindings: [{mouseButton: cornerstoneTools.Enums.MouseBindings.Primary}]
        });
    }

    const toggleShowRect = () => {
        const next = pointRectShowState === 'show' ? 'hidden' : 'show';
        setPointRectShowState(next);
        if (next === 'show') {
            drawRect();
        } else {
            viewport.render();
        }
    }

    const drawRect = () => {
        if (!viewport) return;
        const context = viewport.canvas.getContext('2d');
        context.fillStyle = 'rgba(203,195,145,0.5)';
        context.fillRect(0, 0, 50, 50)
        context.textAlign = 'center';
        context.font = '14px serif';
        context.fillStyle = 'rgba(203,195,145)';
        context.fillText('病灶信息', 75, 75)
    }

    const handleReset = () => {
        viewport.setProperties({voiRange: ctVoiRange});
        viewport.resetCamera();
        viewport.render();
    }

    return (
        <div style={{width: '100%', height: '400px', paddingTop: '20px'}}>
            {/*file upload*/}
            <input
                type="file"
                multiple
                webkitdirectory="true"
                onChange={onFileChange}
            />
            {/*tools*/}
            <div style={{margin: '20px 0', fontSize: '14px'}}>
                <button onClick={() => {
                    handleToolMenuClick({key: cornerstoneTools.WindowLevelTool.toolName})
                }} style={{marginRight: '5px'}}>
                    左键: windowLevel
                </button>
                <button onClick={() => {
                    handleToolMenuClick({key: cornerstoneTools.PanTool.toolName})
                }} style={{marginRight: '5px'}}>
                    左键: pan
                </button>
                <button onClick={toggleShowRect} style={{marginRight: '5px'}}>
                    {pointRectShowState === 'show' ? 'hide point rect' : 'show point rect'}
                </button>
                <button onClick={handleReset} style={{marginRight: '5px'}}>reset</button>
                <Dropdown menu={{items: menuTools, onClick: handleToolMenuClick}}>
                    <a onClick={e => e.preventDefault()}>
                        <Space>
                            选择左键测量工具
                            <DownOutlined/>
                        </Space>
                    </a>
                </Dropdown>
            </div>
            {/*viewport*/}
            <div className={'dicom-viewport-wrapper'}>
                <div className={'dicom-viewport'} id="content" style={{width: '100%', height: '100%'}}
                     onContextMenu={event => {
                         event.preventDefault();
                     }}
                     onMouseDown={(event) => {
                         event.preventDefault();
                     }}
                />
                <div>
                    {
                        dicomBasicInfo &&
                        <div className={'dicom-viewport-overlay-left-top'}>
                            <p>Patient Name:{dicomBasicInfo.patientName}</p>
                            <p>Patient ID:{dicomBasicInfo.patientID}</p>
                            <p>Patient Sex:{dicomBasicInfo.patientSex}</p>
                            <p>Patient Age:{dicomBasicInfo.patientAge}</p>
                        </div>
                    }
                    <div className={'dicom-viewport-overlay-right-bottom'}>
                        {currentImageIdIndex + 1 || 1} / {viewport && viewport.imageIds.length || 1}
                    </div>
                </div>
            </div>

        </div>

    );
}

export default StackImages;
