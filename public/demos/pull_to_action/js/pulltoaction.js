/**
 * https://github.com/BoxFactura/pulltorefresh.js
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.PullToAction = factory();
  }
})(this, function() {

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


  function _ptrMarkup() {
    return `<div class='__PREFIX____box'>
        <div class='__PREFIX____content'>
          <div class='__PREFIX____icon'></div>
          <div class='__PREFIX____text'></div>
        </div>
      </div>`;
  }

  function _ptrStyles() {
    return `.__PREFIX__ {
      pointer-events: none;
      font-size: 0.85em;
      font-weight: bold;
      top: 0;
      height: 0;
      transition: height 0.3s, min-height 0.3s;
      -webkit-transition: height 0.3s, min-height 0.3s;
      text-align: center;
      width: 100%;
      overflow: hidden;
      display: flex;
      align-items: flex-end;
      align-content: stretch;
    }
    .__PREFIX__--pull {
      transition: none;
    }
    .__PREFIX____box {
      padding: 10px;
      flex-basis: 100%;
    }
    .__PREFIX____text {
      margin-top: .33em;
      color: rgba(0, 0, 0, 0.3);
      line-height: 1;
    }
    .__PREFIX____icon {
      color: rgba(0, 0, 0, 0.3);
      transition: transform .3s;
      -webkit-transition: transform .3s;
    }
    .__PREFIX__--top {
      touch-action: pan-x pan-down pinch-zoom;
    }
    .__PREFIX__--release .__PREFIX____icon {
      transform: rotate(180deg);
      -webkit-transform: rotate(180deg);
    }`;
  }


  var defaults = {
    distThreshold: 60,
    distMax: 80,
    distReload: 50,
    bodyOffset: 20,
    mainElement: 'body',
    triggerElement: 'body',
    indicatorElement: '.pull__indicator', // 指示器
    classPrefix: 'pull__indicator',
    cssProp: 'min-height',
    iconArrow: '&#8675;',
    iconRefreshing: '&hellip;',
    instructionsPullToRefresh: '下拉刷新',
    instructionsReleaseToRefresh: '放开刷新',
    instructionsRefreshing: 'Refreshing',
    refreshTimeout: 500,
    getMarkup: _ptrMarkup,
    getStyles: _ptrStyles,
    onInit: function () {},
    onRefresh: function () { return location.reload(); },
    resistanceFunction: function (t) { return Math.min(1, t / 2.5); },
    shouldPullToRefresh: function () { return !window.scrollY; },
  };



  function PullToAction(options) {
    var _this = this;

    _this.settings = extend(defaults, options || {});
    // _this.settings = Object.assign({}, defaults, options || {});

    // 如果传的是字符串, 则查找 dom
    var methods = ['mainElement', 'indicatorElement', 'triggerElement'];
    methods.forEach(function(method) {
      if (typeof _this.settings[method] === 'string') {
        _this.settings[method] = document.querySelector(_this.settings[method]);
      }
    });

    _this._init();
  }

  PullToAction.prototype = {
    constructor: PullToAction,
    _init: function() {
      var _this = this;

      var handlers = null;
      _this._state = 'pending'; // 状态: ''releasing', 'pulling', 'pending', 'refreshing'
      _this._setup = false; // 是否安装
      _this.supportsPassive = false;
      _this._enable = false;
      _this._timeout = null;
      _this.pullStartY = null;
      _this.pullMoveY = null; 
      _this.dist = 0; // 下拉距离
      _this.distResisted = 0;

      if (!_this._setup) {
        handlers = _this._setupEvents();
        _this._setup = true
      }
      
      var ref = _this._setupDOM();
      var styleNode = ref.styleNode;
      var indicatorElement = ref.indicatorElement;
      
      return {};
    },

    _setupEvents: function() {
      var _this = this;

      // 重置
      function onReset() {
        var cssProp = _this.settings.cssProp;
        var indicatorElement = _this.settings.indicatorElement;
        var classPrefix = _this.settings.classPrefix;

        indicatorElement.classList.remove(classPrefix + '--refresh');
        indicatorElement.style[cssProp] = '0px';
        _this._state = 'pending';
      }

      function _onTouchStart(e) {
        // 是否可以下拉刷新
        if (_this.settings.shouldPullToRefresh()) {
          _this.pullStartY = e.touches[0].screenY;

          clearTimeout(_this._timeout);
          _this._enable = _this.settings.triggerElement.contains(e.target);
          _this._state = 'pending';
          _this._update();
        }
      }

      function _onTouchMove(e) {
        var distThreshold = _this.settings.distThreshold; // 触发距离
        var distMax = _this.settings.distMax; // 最大下拉距离
        var cssProp = _this.settings.cssProp; // css 属性
        var classPrefix = _this.settings.classPrefix;
        var shouldPullToRefresh = _this.settings.shouldPullToRefresh;
        var indicatorElement = _this.settings.indicatorElement;

        if (!_this.pullStartY) {
          if (shouldPullToRefresh()) {
            _this.pullStartY = e.touches[0].screenY;
          }
        } else {
          _this.pullMoveY = e.touches[0].screenY;
        }

        if (!_this._enable || _this._state === 'refreshing') {
          if (shouldPullToRefresh() && _this.pullStartY < _this.pullMoveY) {
            e.preventDefault();
          }

          return;
        }

        // 更改 action DOM
        if (_this._state === 'pending') {
          indicatorElement.classList.add(classPrefix + '--pull');
          _this._state = 'pulling';
          _this._update();
        }

        // 下拉距离
        if (_this.pullStartY && _this.pullMoveY) {
          _this.dist = _this.pullMoveY - _this.pullStartY;
        }

        // 设置 css
        if (_this.dist > 0) {
          e.preventDefault();
          indicatorElement.style[cssProp] = _this.distResisted + 'px';
          _this.distResisted = _this.settings.resistanceFunction(_this.dist / distThreshold) * Math.min(distMax, _this.dist);

          // pulling =>> releasing
          if (_this._state === 'pulling' && _this.distResisted > distThreshold) {
            indicatorElement.classList.add(classPrefix + '--release');
            _this._state = 'releasing';
            _this._update();
          }

          // releasing =>> pulling
          if (_this._state === 'releasing' && _this.distResisted < distThreshold) {
            indicatorElement.classList.remove(classPrefix + '--release');
            _this._state = 'pulling';
            _this._update();
          }

        }
      }

      function _onTouchEnd(e) {
        var indicatorElement = _this.settings.indicatorElement;
        var distThreshold = _this.settings.distThreshold;
        var distReload = _this.settings.distReload;
        var cssProp = _this.settings.cssProp;
        var classPrefix = _this.settings.classPrefix;
        var refreshTimeout = _this.settings.refreshTimeout;

        if (_this._state === 'releasing' && _this.distResisted > distThreshold) {
          _this._state = 'refreshing';
          indicatorElement.style[cssProp] = distReload + 'px';
          indicatorElement.classList.add(classPrefix + '--refresh');
          
          _this._timeout = setTimeout(function() {
            var retval = _this.settings.onRefresh(onReset);
            if (retval && typeof retval.then === 'function') {
              retval.then(function() {
                return onReset();
              });
            }

            if (!retval && !_this.settings.onRefresh.length) {
              onReset();
            }
          }, refreshTimeout);
        } else {
          if (_this._state === 'refreshing') {
            // 正在刷新中
            return;
          }

          indicatorElement.style[cssProp] = '0px';
          _this._state = 'pending';
        }

        _this._update();
        indicatorElement.classList.remove(classPrefix + '--release');
        indicatorElement.classList.remove(classPrefix + '--pull');
        _this.pullStartY = null;
        _this.pullMoveY = null;
        _this.dist = 0;
        _this.distResisted = 0;
      }

      function _onScroll(e) {
        var mainElement = _this.settings.mainElement;
        var classPrefix = _this.settings.classPrefix;
        var shouldPullToRefresh = _this.settings.shouldPullToRefresh;
        mainElement.classList.toggle(classPrefix + '--top', shouldPullToRefresh());
      }


      window.addEventListener('scroll', _onScroll);
      window.addEventListener('touchstart', _onTouchStart);
      window.addEventListener('touchend', _onTouchEnd);
      window.addEventListener('touchmove', _onTouchMove, _this.supportsPassive ? {
        passive: _this.settings.passive || false,
      } : undefined);

      return {
        onTouchStart: _onTouchStart,
        onTouchMove: _onTouchMove,
        onTouchEnd: _onTouchEnd,
        onScroll: _onScroll,
      };
    },

    /**
     * 更新 aciton DOM
     * 
     */
    _update: function() {
      var _this = this;

      var _state = _this._state;
      var iconArrow = _this.settings.iconArrow; // icon 箭头
      var iconRefreshing = _this.settings.iconRefreshing; // icon 刷新
      var instructionsPullToRefresh = _this.settings.instructionsPullToRefresh; // 下拉刷新提示
      var instructionsRefreshing = _this.settings.instructionsRefreshing; // 刷新中提示
      var instructionsReleaseToRefresh = _this.settings.instructionsReleaseToRefresh; // 松开提示

      var classPrefix = _this.settings.classPrefix;
      var indicatorElement = _this.settings.indicatorElement;
      var iconEl = indicatorElement.querySelector('.' + classPrefix + '__icon');
      var textEl = indicatorElement.querySelector('.' + classPrefix + '__text');

      // icon
      if (_state === 'refreshing') {
        iconEl.innerHTML = iconRefreshing;
      } else {
        iconEl.innerHTML = iconArrow;
      }

      // text
      if (_state === 'releasing') {
        textEl.innerHTML = instructionsReleaseToRefresh;
      } else if (_state === 'pulling' || _state === 'pending') {
        textEl.innerHTML = instructionsPullToRefresh;
      } else if (_state === 'refreshing') {
        textEl.innerHTML = instructionsRefreshing
      }

    },

    _setupDOM: function() {
      var _this = this;

      var mainElement = _this.settings.mainElement;
      var classPrefix = _this.settings.classPrefix;
      var getMarkup = _this.settings.getMarkup;
      var getStyles = _this.settings.getStyles;

      // html
      var $indicatorElement = document.createElement('div');
      $indicatorElement.classList.add(classPrefix);
      $indicatorElement.innerHTML = getMarkup().replace(/__PREFIX__/g, classPrefix);
      _this.settings.indicatorElement = $indicatorElement;
      if (mainElement !== document.body) {
        mainElement.parentNode.insertBefore($indicatorElement, mainElement);
      } else {
        document.body.insertBefore($indicatorElement, document.body.firstChild);
      }

      // css
      var styleEle;
      var styleEleId = '#pull-to-refresh-js-style';
      if (!document.querySelector(styleEleId)) {
        styleEle = document.createElement('style');
        styleEle.setAttribute('id', styleEleId.substr(1));
        document.head.appendChild(styleEle)
      } else {
        styleEle = document.querySelector(styleEleId);
      }
      styleEle.textContent = getStyles().replace(/__PREFIX__/g, classPrefix).replace(/\s+/g, ' ');

      return {
        styleNode: styleEle,
        indicatorElement: _this.settings.indicatorElement,
      };
    },
  };


  return PullToAction;
});