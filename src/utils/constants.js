import * as cornerstoneTools from '@cornerstonejs/tools';

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

const wwwcOptions = [
    {
        key: 'wwwc1',
        value: [400, 60],
        label: '腹 400/60',
    },
    {
        key: 'wwwc2',
        value: [400, 40],
        label: '胸 400/40',
    },
    {
        key: 'wwwc3',
        value: [1500, 300],
        label: '骨 1500/300',
    }
];

const flipOptions = [
    {
        key: 'horizontal',
        label: '水平翻转',
    },
    {
        key: 'vertical',
        label: '垂直翻转',
    }
];

const colorMapOptions = [
    {key: 'jet', label: 'Jet'},
    {key: 'hsv', label: 'HSV'},
    {key: 'cool', label: 'Cool'},
    {key: 'coolwarm', label: 'CoolWarm'},
    {key: 'hotIron', label: 'Hot Iron'},
    {key: 'pet', label: 'PET'}
];

export {
    tools,
    menuTools,
    wwwcOptions,
    flipOptions,
    colorMapOptions
}
