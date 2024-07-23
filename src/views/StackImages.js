import React, {useEffect, useRef, useState} from "react";
import {Col, Divider, Layout, Row, Slider} from 'antd';
import {Enums, init as csRenderInit, RenderingEngine} from "@cornerstonejs/core";
import {wadouri} from '@cornerstonejs/dicom-image-loader';
import initCornerstoneDICOMImageLoader from '../utils/initCornerstoneDicomImageLoader.js';
import * as cornerstoneTools from '@cornerstonejs/tools';
import './index.css';

const {Header, Sider, Content} = Layout;
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
        label: '直线工具',
        key: cornerstoneTools.LengthTool.toolName,
    },
    {
        label: 'CT值工具',
        key: cornerstoneTools.ProbeTool.toolName,
    }
];

/**
 * demo按照file加载的模式
 */
function StackImages() {

    let isScrolling = false;

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
        isScrolling = false;
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

    const handleScrollToIndex = () => {
        cornerstoneTools.utilities.scroll(viewport, {
            delta: 5
        });
    }

    const onSliderChange = (value) => {
        if (!viewport) return;
        if (isScrolling) return;
        if (value === currentImageIdIndex) return;
        isScrolling = true;

        cornerstoneTools.utilities.scroll(viewport, {
            delta: value - currentImageIdIndex
        });
    }

    const getCanvasData = () => {
        console.log(viewport.canvas.toDataURL('image/jpeg'))
    }

    return (
        <Layout className="dicom-main-layout">
            <Sider width="25%" theme="light" className="dicom-main-sider">
                {/* dicom文件加载 */}
                <Row>
                    <Col span={12}>选择一个dicom文件夹:</Col>
                    <Col span={12}>
                        <input
                            type="file"
                            multiple
                            webkitdirectory="true"
                            onChange={onFileChange}
                        /></Col>
                </Row>
                <Divider/>
                {/* 工具 */}
                <div style={{padding: '0 20px'}}>
                    <Row style={{marginTop: '20px'}}>
                        <Col>鼠标左键：</Col>
                    </Row>
                    <Row style={{marginTop: '5px'}}>
                        <Col>
                            <button onClick={() => {
                                handleToolMenuClick({key: cornerstoneTools.WindowLevelTool.toolName})
                            }} style={{marginRight: '5px'}}>
                                windowLevel
                            </button>
                        </Col>
                        <Col>
                            <button onClick={() => {
                                handleToolMenuClick({key: cornerstoneTools.PanTool.toolName})
                            }} style={{marginRight: '5px'}}>
                                pan
                            </button>
                        </Col>
                        <Col>
                            <button onClick={() => {
                                handleToolMenuClick({key: cornerstoneTools.ZoomTool.toolName})
                            }} style={{marginRight: '5px'}}>
                                zoom
                            </button>
                        </Col>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col>测量、绘制：</Col>
                    </Row>
                    <Row style={{marginTop: '5px'}}>
                        {
                            menuTools && menuTools.map((item) => {
                                return <button onClick={() => {
                                    handleToolMenuClick(item)
                                }} style={{marginRight: '5px'}}>
                                    {item.label}
                                </button>
                            })
                        }
                        <button onClick={toggleShowRect} style={{marginRight: '5px'}}>
                            {pointRectShowState === 'show' ? '隐藏手动绘制' : '显示手动绘制'}
                        </button>
                    </Row>
                    <Row style={{marginTop: '20px'}}>
                        <Col>其他操作：</Col>
                    </Row>
                    <Row style={{marginTop: '5px'}}>
                        <button onClick={handleReset} style={{marginRight: '5px'}}>重置viewport</button>
                        <button onClick={handleScrollToIndex} style={{marginRight: '5px'}}>scroll to +5</button>
                        <button onClick={getCanvasData} style={{marginRight: '5px'}}>获取画布数据</button>
                    </Row>
                </div>
            </Sider>

            <Layout>
                <Header className="dicom-main-header">
                    react+cornerstone3d示例
                </Header>
                <Content className="dicom-main-content">
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
                    <div className={'dicom-viewport-slider'}>
                        {
                            viewport &&
                            <Slider min={0}
                                    max={viewport.imageIds.length - 1}
                                    value={currentImageIdIndex}
                                    onChange={onSliderChange}/>
                        }
                    </div>
                </Content>
            </Layout>
        </Layout>
    );
}

export default StackImages;
