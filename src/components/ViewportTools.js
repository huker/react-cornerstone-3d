import React, {useEffect} from "react";
import lodash from "lodash";
import {Dropdown} from 'antd';
import {colorMapOptions, flipOptions, wwwcOptions} from "../utils/constants";
import * as cornerstone from "@cornerstonejs/core";

const windowWidth = 1500;
const windowCenter = -450;

const lower = windowCenter - windowWidth / 2.0;
const upper = windowCenter + windowWidth / 2.0;

const ctVoiRange = {lower, upper};

const ViewportTools = (props) => {

    const {viewport} = props;

    useEffect(() => {
    }, [])

    // 重置Viewport
    const handleReset = () => {
        viewport.setProperties({
            voiRange: ctVoiRange,
            rotation: 0,
            invert: false
        });
        viewport.resetCamera();
        viewport.unsetColormap();
        viewport.render();
    }
    const handleWwwcSelect = (v) => {
        const item = lodash.find(wwwcOptions, {key: v.key});
        if (item) {
            const ww = item.value[0];
            const wc = item.value[1];
            const lower = wc - ww / 2.0;
            const upper = wc + ww / 2.0;
            viewport.setProperties({
                voiRange: {
                    lower,
                    upper
                }
            });
            viewport.render();
        }
    }

    const handleRotate = () => {
        const {rotation} = viewport.getProperties();
        const _rotation = rotation + 90 > 360 ? rotation + 90 - 360 : rotation + 90;
        viewport.setProperties({
            rotation: _rotation
        });
        viewport.render();
    }

    const handleFlipSelect = (v) => {
        const {flipHorizontal, flipVertical} = viewport.getCamera();
        if (v.key === 'horizontal') {
            viewport.setCamera({
                flipHorizontal: !flipHorizontal
            })
        }
        if (v.key === 'vertical') {
            viewport.setCamera({
                flipVertical: !flipVertical
            })
        }
        viewport.render();
    }

    const handleInvert = () => {
        const {invert} = viewport.getProperties();
        viewport.setProperties({
            invert: !invert
        });
        viewport.render();
    }

    const handleColorMapSelect = (v) => {
        const CPU_COLORMAPS = cornerstone.CONSTANTS.CPU_COLORMAPS;
        const colormap = CPU_COLORMAPS[v.key];
        if (colormap) {
            viewport.setColormap(colormap);
            viewport.render();
        }
    }

    return (
        <>
            <Dropdown menu={{items: wwwcOptions, onClick: handleWwwcSelect}} placement="bottomRight" arrow>
                <button style={{marginRight: '5px'}}>设置窗值</button>
            </Dropdown>
            <button style={{marginRight: '5px'}} onClick={handleRotate}>旋转90°</button>
            <Dropdown menu={{items: flipOptions, onClick: handleFlipSelect}} placement="bottomRight" arrow>
                <button style={{marginRight: '5px'}}>翻转</button>
            </Dropdown>
            <button style={{marginRight: '5px'}} onClick={handleInvert}>反色</button>
            <Dropdown menu={{items: colorMapOptions, onClick: handleColorMapSelect}} placement="bottomRight" arrow>
                <button style={{marginRight: '5px'}}>伪彩</button>
            </Dropdown>
            <button onClick={handleReset} style={{marginRight: '5px'}}>重置</button>
        </>
    );
}

export default ViewportTools;
