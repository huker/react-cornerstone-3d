# react + cornerstone3D demo

This project was create with Create React App

`npm start`

render
- [StackImages.js](src%2Fviews%2FStackImages.js) loader加载file文件，渲染序列
- [StackImages-wado.js](src%2Fviews%2FStackImages-wado.js) wadouri load images

viewport
- 调窗(默认左键)
- 缩放(默认右键)
- 移动
- 重置
- 窗口变化resize

基础信息
- dicom信息
- 总页数、当前页数

tool
- 工具注册，左键工具激活切换
- 测量工具、鼠标滚动翻页的使用
- 手动翻页、滚动条翻页

其他
- 当前画布数据获取
- 虚拟画布数据获取（比如需要导出多层slice）
