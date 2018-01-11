;
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.BackTop = factory();
  }
})(this, function () {

  /**
   * 对象的拷贝
   * 
   * @param {any} target 
   * @param {any} source 
   * @returns 
   */
  function extend(target, source) {
    for (var p in source) {
      if (source.hasOwnProperty(p)) {
        target[p] = source[p];
      }
    }
    return target;
  }


  /**
   * requestAnimationFrame.js
   * by zhangxinxu 2013-09-30
   */
  (function () {
    var lastTime = 0;
    var vendors = ['webkit', 'moz'];
    for (var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
      window.requestAnimationFrame = window[vendors[x] + 'RequestAnimationFrame'];
      window.cancelAnimationFrame = window[vendors[x] + 'CancelAnimationFrame'] || // Webkit中此取消方法的名字变了
        window[vendors[x] + 'CancelRequestAnimationFrame'];
    }

    if (!window.requestAnimationFrame) {
      window.requestAnimationFrame = function (callback, element) {
        var currTime = new Date().getTime();
        var timeToCall = Math.max(0, 16.7 - (currTime - lastTime));
        var id = window.setTimeout(function () {
          callback(currTime + timeToCall);
        }, timeToCall);
        lastTime = currTime + timeToCall;
        return id;
      };
    }
    if (!window.cancelAnimationFrame) {
      window.cancelAnimationFrame = function (id) {
        clearTimeout(id);
      };
    }
  }());


  /**
   * 运动效果
   * 
   * @param {any} t 
   * @param {any} b 
   * @param {any} c 
   * @param {any} d 
   * @returns 
   */
  function easeInOutCubic(t, b, c, d) {
    var cc = c - b;
    t /= d / 2;
    if (t < 1) {
      return cc / 2 * t * t * t + b;
    } else {
      return cc / 2 * ((t -= 2) * t * t + 2) + b;
    }
  };


  /**
   * 获取当前滚动位置
   * 
   * @param {any} targetNode 
   * @returns 
   */
  function getCurrentScrollTop(targetNode) {
    if (targetNode === window) {
      return window.pageYOffset || document.body.scrollTop || document.documentElement.scrollTop;
    }
    return targetNode.scrollTop;
  }

  /**
   * 返回顶部
   * 
   * @param {any} targetNode 
   * @param {any} callback 
   */
  function scrollToTop(targetNode, callback) {
    console.log('返回顶部 =>>', targetNode);

    // 当前 scrollTop
    var scrollTop = getCurrentScrollTop(targetNode);
    var startTime = Date.now();
    var frameFunc = function() {
      var timestamp = Date.now();
      var time = timestamp - startTime;

      setScrollTop(easeInOutCubic(time, scrollTop, 0, 450), targetNode);

      if (time < 450) {
        window.requestAnimationFrame(frameFunc);
      }
    };

    window.requestAnimationFrame(frameFunc);

    if (typeof callback === 'function') {
      callback();
    }
  }

  /**
   * 设置滚动位置
   * 
   * @param {any} value 
   * @param {any} targetNode 
   */
  function setScrollTop(value, targetNode) {
    if (targetNode === window) {
      document.body.scrollTop = value;
      document.documentElement.scrollTop = value;
    } else {
      targetNode.scrollTop = value;
    }
  }


  
  /**
   * ------------------------------------------------------------------------
   * Defaults
   * ------------------------------------------------------------------------
   */
  var defaults = {
    target           : window,
    visibilityHeight : 400,
    onClick          : null,
    template         : '<div class="back__top__content"><i class="back__top__icon"></i></div>',
  };

  var defaultsType = {
    target: 'object', // 设置需要监听其滚动事件的元素，值为一个返回对应 DOM 元素的函数
    visibilityHeight: 'number', // 滚动高度达到此参数值才出现 BackTop
    onClick: 'function', // 点击按钮的回调函数
    template: 'string', // DOM 结构
  };


  /**
   * ------------------------------------------------------------------------
   * Function
   * ------------------------------------------------------------------------
   */
  function BackTop(options) {
    var _this = this;
    _this.settings = extend(defaults, options || {});

    _this.$parent = document.querySelector('body');
    _this.$target = window;

    if (_this.settings.target !== window) {
      // 非 window 元素, 重新获取元素
      _this.$target = document.querySelector(_this.settings.target);
      _this.$parent = _this.$target.parentNode;
    }

    console.log(_this.$parent);

    _this._init();
  }

  BackTop.prototype = {
    constructor: BackTop,

    _init: function () {
      var _this = this;
      
      _this.$backTop = _this._render();
      _this._bindEvents();
    },

    _bindEvents: function() {
      var _this = this;

      _this._onClick();
      _this._onScroll();
    },

    /**
     * 监听点击事件
     * 
     * @returns 
     */
    _onClick: function() {
      var _this = this;

      _this.$backTop.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();

        scrollToTop(_this.$target, _this.settings.onClick);
      }, false);
    },

    /**
     * 监听滚动事件
     * 
     * @returns 
     */
    _onScroll: function() {
      var _this = this;

      _this.$target.addEventListener('scroll', function() {
        var scrollTop = getCurrentScrollTop(_this.$target);

        if (scrollTop >= _this.settings.visibilityHeight) {
          _this.$backTop.classList.add('show');
        } else {
          _this.$backTop.classList.remove('show');
        }
      }, false);
    },

    /**
     * 渲染 DOM
     * 
     * @returns 
     */
    _render: function() {
      var _this = this;

      var $backTop = document.createElement('div');
      $backTop.className = 'back__top';
      $backTop.innerHTML = _this.settings.template;

      _this.$parent.appendChild($backTop);
      return $backTop;
    }
  };

  return BackTop;

});