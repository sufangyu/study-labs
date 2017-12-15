/**
 * 横竖屏操作类
 * 
 * https://github.com/zuopf769/notebook/blob/master/fe/%E7%A7%BB%E5%8A%A8%E7%AB%AF%E5%A6%82%E4%BD%95%E5%BC%BA%E5%88%B6%E9%A1%B5%E9%9D%A2%E6%A8%AA%E5%B1%8F/README.md
 */
var orientationUtil = (function() {
  var resizeTimer = null;

  /**
   * 竖屏固定成横屏
   * @param {*}  
   * @param {*} width 
   * @param {*} height 
   */
  function changeToPortrait($print, width, height) {
    $print.width(height);
    $print.height(width);
    $print.css('top',  (height - width) / 2 );
    $print.css('left',  0 - (height - width) / 2 );
    $print.css('transform', 'rotate(90deg)');
    $print.css('-webkit-transform', 'rotate(90deg)');
    $print.css('transform-origin', '50% 50%');
    $print.css('-webkit-transform-origin', '50% 50%');
  }


  /**
   * 横屏固定成竖屏
   * @param {*}  
   * @param {*} width 
   * @param {*} height 
   */
  function changeToLandscape($print, width, height) {
    $print.width(height);
    $print.height(width);
    $print.css('top',  (height - width) / 2 );
    $print.css('left',  0 - (height - width) / 2 );
    $print.css('transform', 'rotate(-90deg)');
    $print.css('-webkit-transform', 'rotate(-90deg)');
    $print.css('transform-origin', '50% 50%');
    $print.css('-webkit-transform-origin', '50% 50%');
  }


  /**
   * 强制设置竖屏模式
   * @param {*}  
   * @param {*} width 
   * @param {*} height 
   */
  function resetInitial($print, width, height) {
    $print.width(width);
    $print.height(height);
    $print.css('top',  0 );
    $print.css('left',  0 );
    $print.css('transform' , 'none');
    $print.css('-webkit-transform' , 'none');
    $print.css('transform-origin' , '50% 50%');
    $print.css('-webkit-transform-origin' , '50% 50%');
  }
  

  return {
    /**
     * 获取当前是横竖屏
     */
    getOrientation: function() {
      var orientation = 'landscape';
      var width = document.documentElement.clientWidth;
      var height = document.documentElement.clientHeight;
      if (width < height) {
        // 竖屏
        orientation = 'landscape';
      } else {
        // 横屏
        orientation = 'portrait';
      }
      return orientation;
    },
    /**
     * 强制横屏
     */
    fixPortrait: function($print, cb) {
      var width = document.documentElement.clientWidth;
      var height = document.documentElement.clientHeight;

      // 当前是竖屏
      if (width < height) {
        changeToPortrait($print, width, height);
      }

      var evt = "onorientationchange" in window ? "orientationchange" : "resize";

      window.addEventListener(evt, function() {
        if (resizeTimer) {
          return;
        }

        resizeTimer = setTimeout(function() {
          clearTimeout(resizeTimer);
          resizeTimer = null;

          cb && cb();
          var width = document.documentElement.clientWidth;
          var height =  document.documentElement.clientHeight;

          if (width > height) {
            // 当前是横屏, 还原会初始状态
            resetInitial($print, width, height);
          } else {
            // 当前是竖屏, 强制设置横屏模式
            changeToPortrait($print, width, height);
          }
        }, 300);
      }, false);
    },
    /**
     * 强制竖屏
     */
    fixLandscape: function($print, cb) {
      var width = document.documentElement.clientWidth;
      var height = document.documentElement.clientHeight;

      if (width > height) {
        console.log(width > height);
        // 当前是横屏, 强制设置竖屏模式
        changeToLandscape($print, width, height);
      }

      var evt = "onorientationchange" in window ? "orientationchange" : "resize";

      window.addEventListener(evt, function() {
        if (resizeTimer) {
          return;
        }

        resizeTimer = setTimeout(function() {
          clearTimeout(resizeTimer);
          resizeTimer = null;

          cb && cb();
          var width = document.documentElement.clientWidth;
          var height =  document.documentElement.clientHeight;

          if (width > height) {
            // 当前是横屏, 强制设置竖屏模式
            changeToLandscape($print, width, height);
          } else {
            // 当前是竖屏, 还原会初始状态
            resetInitial($print, width, height);
          }
        }, 300);
      }, false);
    },
  }
})();