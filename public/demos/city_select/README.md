# 序号定位

### 实现原理、流程

- 根据在索引列表按下的 Y 轴位置, 获取当前按下对应的索引序号
  - 初始化时就把所有索引列表每一项 Y 位置存在数组中
  - 按下时就把当前按下的 Y 轴位置与索引列表数组循环对比
    - 小于索引列表数组第一项 Y 轴位置，则按下对应的索引等于第一个
    - 大于索引列表数组最后一项 Y 轴位置，则按下对应的索引等于最后一项
    - 大于当前循环到的序号 Y 轴位置，小于当前循环到的序号下一项 Y 轴位置，则按下对应的索引等于当前循环到的序号
- 根据获取到的当前按下对应的索引序号，设置当前城市的提示字母
- 根据获取到的当前按下对应的索引序号，定位到当前城市
  - 获取对应的城市列表的 Y 轴位置
  - 设置滚动条的位置等于 获取到的当前城市 Y 轴位置