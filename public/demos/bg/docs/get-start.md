## 线性渐变背景

```scss
@import '../../style/mixins/background.scss';

$start-color   : #4eb0f6;
$end-color     : #007fff;

.button--to-right {
  // 从右到左
  @include background-linear('to right', $start-color, $end-color);
}

.button--to-left {
  // 从左到右
  @include background-linear('to left', $start-color, $end-color);
}

.button--to-bottom {
  // 从上到下
  @include background-linear('to bottom', $start-color, $end-color);
}

.button--to-top {
  // 从下到上
  @include background-linear('to top', $start-color, $end-color);
}
```


## SVG 背景图

```scss
@import '../../style/mixins/icon.scss';
@import '../../style/mixins/background.scss';

.icon-right {
  ...
  @include encoded-svg-background('right');
}

.icon-error {
  ...
  @include encoded-svg-background('error');
}
```