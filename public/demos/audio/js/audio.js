(function(window, document, $, undefined) {
  'use strict';

  // If there's no jQuery or Zepto, it can't work
  if (!$) {
    console.warn('There\'s no jQuery or Zepto, it can\'t work');
    return;
  }

  /**
   * ------------------------------------------------------------------------
   * Constants
   * ------------------------------------------------------------------------
   */
  var NAME               = 'audio';
  var VERSION            = '1.0.0-beta';
  var DATA_KEY           = 'yu.audio';
  var EVENT_KEY          = '.' + DATA_KEY;
  var DATA_API_KEY       = '.data-api';
  var JQUERY_NO_CONFLICT = $.fn[NAME];


  var Event = {
    CLICK          : 'click' + EVENT_KEY,
    MOUSEDOWN      : 'mousedown' + EVENT_KEY,
    MOUSEMOVE      : 'mousemove' + EVENT_KEY,
    MOUSEUP        : 'mouseup' + EVENT_KEY,
    TOUCHSTAR      : 'touchstart' + EVENT_KEY,
    TOUCHMOVE      : 'touchmove' + EVENT_KEY,
    TOUCHEND       : 'touchend' + EVENT_KEY,
    PLAY           : 'play' + EVENT_KEY,
    LOADEDMETADATA : 'loadedmetadata' + EVENT_KEY,
    DURATIONCHANGE : 'durationchange' + EVENT_KEY,
    LOAD_DATA_API  : 'load' + EVENT_KEY + DATA_API_KEY,
  };


  /**
   * ------------------------------------------------------------------------
   * Defaults
   * ------------------------------------------------------------------------
   */
  var Default = {
    src       : '',
    onPlay    : function() {},
    onPause   : function() {},
    onStop    : function() {},
    onPrev    : function() {},
    onNext    : function() {},
    onProgress: function() {},
  };

  var DefaultType = {
    src       : 'string',
    onPlay    : 'function',
    onPause   : 'function',
    onStop    : 'function',
    onPrev    : 'function',
    onNext    : 'function',
    onProgress: 'function',
  };


  /**
   * ------------------------------------------------------------------------
   * Class Definition
   * ------------------------------------------------------------------------
   */
  function Func(element, options) {
    var _this = this;

    _this.settings = $.extend({}, $.fn[NAME].defaults, options || {});
    _this._element = element;

    _this._init();
  }

  Func.prototype = {
    constructor: Func,

    _init: function() {
      var _this = this;

      _this.$element = $(_this._element);
      _this.$audioControls = $('<div class="audio__controls">');
      _this.$audioProgress = $('<div class="audio__progress">');
      _this.$progress = $('<div class="progress">');
      _this.$progressBar = $('<div class="progress__bar"></div>');
      _this.$progressHandle = $('<div class="progress__handle">');
      _this.$audioTimeCurrent = $('<div class="audio__time--current">00:00</div>');
      _this.$audioTimeTotal = $('<div class="audio__time--total">00:00</div>');
      _this.audio = document.createElement('audio');
      _this.$audio = $(_this.audio);

      _this.hasLoaded = false;  // 是否已经请求加载
      _this.isDragDown = false;  // 拖拽是否按下
      _this.audioStatus = 'unplay';  // 状态: unplay, play, pause, stop
      _this.durationTimer = null;
      _this.progresTimer = null;

      _this._renderBaseDom();
      _this._bindEvents();
    },

    _bindEvents: function() {
      var _this = this;

      _this.onControls();
      _this.onProgressEvents();
      _this.onProgressHandle();

      _this.onDurationchange();
      _this.onPlayToggle();
      _this.onLoadstart();
    },

    /**
     * 监听 播放/暂停事件
     * 
     */
    onPlayToggle: function() {
      var _this = this;

      _this.$audio.on(Event.PLAY, function() {
        clearInterval(_this.progresTimer);
        
        _this.progresTimer = setInterval(function() {
          if (_this.audioStatus === 'pause' || _this.audioStatus === 'stop') {
            return;
          }

          // 单曲播放结束
          if (_this.audio.currentTime === _this.audio.duration) {
            var $button = $('[data-action="toggle"]');
            _this.stop($button);
          }

          // 播放进度
          if (!_this.isDragDown) {
            var percent = (_this.audio.currentTime / _this.audio.duration).toFixed(4) * 100;
            percent = _this._limitPercent(percent);
            _this._setAudioProgress(percent);
          }

          // 当前时间
          var formatCurrentTime = _this._getFormatTime(_this.audio.currentTime);
          _this._setAudioTime(formatCurrentTime, _this.$audioTimeCurrent);
        }, 1000);
      });
    },

    onLoadstart: function() {
      var _this = this;

      _this.$audio.on(Event.LOADEDMETADATA, function() {
        _this.$progress.removeClass('progress--load');
      });
    },

    /**
     * 监听 播放时间改变事件
     * 
     */
    onDurationchange: function() {
      var _this = this;

      _this.$audio.on(Event.DURATIONCHANGE, function() {
        var formatTime = _this._getFormatTime(_this.audio.duration);
        _this._setAudioTime(formatTime, _this.$audioTimeTotal);
      });
    },

    /**
     * 监听 进度条事件
     * 
     */
    onProgressEvents: function() {
      var _this = this;

      _this.$progress.on(Event.MOUSEDOWN, function(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        if (!_this.hasLoaded) {
          return;
        }

        var startX = ev.offsetX;
        var progressWidth = $(this).width();
        var percent = (startX / progressWidth).toFixed(4) * 100;
        percent = _this._limitPercent(percent);
        var currentTime = _this.audio.duration * (percent / 100);
        _this._setAudioProgress(percent);
        _this.setAudioCurrentTime(currentTime);
        
        if (typeof(_this.settings.onProgress) === 'function') {
          _this.settings.onProgress(percent / 100);
        }
      });
    },

    /**
     * 监听 进度条拖拽事件
     * 
     */
    onProgressHandle: function() {
      var _this = this;

      _this.$progressHandle.on(Event.MOUSEDOWN, down);
      $(document).on(Event.MOUSEMOVE, move);
      $(document).on(Event.MOUSEUP, up);

      _this.$progressHandle.on(Event.TOUCHSTAR, down);
      $(document).on(Event.TOUCHMOVE, move);
      $(document).on(Event.TOUCHEND, up);
      
      var startX = 0;
      var percent = 0; // 拖拽到的进度
      var prevPercent = 0; // 已经播放的进度
      
      function down(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        // 未加载资源
        if (!_this.hasLoaded) {
          return;
        }

        var ev = ev.originalEvent || ev;
        var touch = ev.changedTouches ? ev.changedTouches[0] : ev;

        percent = 0;
        prevPercent = 0;
        _this.isDragDown = true;
        startX = touch.clientX;

        var progressWidth = _this.$audioProgress.width();
        percent = prevPercent = (_this.$progressBar.width() / progressWidth).toFixed(4) * 100;
        percent = prevPercent = _this._limitPercent(percent);

        var currentTime = _this.audio.duration * (prevPercent / 100);
        _this.setAudioCurrentTime(currentTime);

        _this.$progressHandle.addClass('active');
      }

      function move(ev) {
        ev.stopPropagation();
        ev.preventDefault();

        // 未加载资源 or 未按下
        if (!_this.isDragDown || !_this.hasLoaded) {
          return;
        }

        var ev = ev.originalEvent || ev;
        var touch = ev.changedTouches ? ev.changedTouches[0] : ev;

        // 拖拽的距离
        var distanceX = touch.clientX - startX;
        if (Math.abs(distanceX) >= 5) {
          // 进度条容器的宽度
          var progressWidth = _this.$audioProgress.width();
          // 当前拖拽距离的百分比
          var dragPercent = (distanceX / progressWidth).toFixed(4) * 100;

          percent = prevPercent + dragPercent;
          percent = _this._limitPercent(percent);
          
          _this._setAudioProgress(percent);
        }
      }

      function up(ev) {
        ev.stopPropagation();

        if (_this.isDragDown) {
          var $button = $('[data-action="toggle"]');
          _this.$progressHandle.removeClass('active');

          _this.isDragDown = false;
          startX = 0;

          if (typeof(_this.settings.onProgress) === 'function') {
            _this.settings.onProgress(percent / 100);
          }

          // 拖拽完全部播放进度, 停止播放
          if (percent >= 100) {
            _this.stop($button);
            return;
          }
          
          var currentTime = _this.audio.duration * (percent / 100);
          _this.setAudioCurrentTime(currentTime);
        }
      }
    },

    /**
     * 监听 控制按钮事件
     * 
     */
    onControls: function() {
      var _this = this;

      // 播放/暂停
      _this.$audioControls.on('click', '[data-action="toggle"]', function() {
        if ( _this.audioStatus === 'unplay' || _this.audioStatus === 'pause' || _this.audioStatus === 'stop') {
          _this.play($(this));
        } else if (_this.audioStatus === 'play') {
          _this.pause($(this));
        }
      });

      // 上一首
      _this.$audioControls.on('click', '[data-action="prev"]', function() {
        console.log('上一首');
      });


      // 下一首
      _this.$audioControls.on('click', '[data-action="next"]', function() {
        console.log('下一首');
      });
    },

    /**
     * 播放
     * 
     * @param {any} $button 
     */
    play: function($button) {
      var _this = this;

      if (_this.settings.src === '') {
        console.warn('There\'s no audio src, it can\'t work');
        return;
      }
      
      // 未加载资源时, 先加载资源
      if (!_this.hasLoaded) {
        _this.loadAudio(_this.settings.src);
      }


      _this.audioStatus = 'play';
      _this.audio.play();
      $button.attr({
        'title': "pause",
      });

      if (typeof(_this.settings.onPlay) === 'function') {
        _this.settings.onPlay($button);
      }
    },

    /**
     * 暂停
     * 
     * @param {any} $button 
     */
    pause: function($button) {
      console.log('暂停...');      
      var _this = this;
      
      _this.audioStatus = 'pause';
      _this.audio.pause();

      $button.attr({
        'title': "play",
      });

      if (typeof(_this.settings.onPause) === 'function') {
        _this.settings.onPause($button);
      }
    },

    /**
     * 停止
     * 
     * @param {any} $button 
     */
    stop: function($button) {
      var _this = this;

      _this.audioStatus = 'stop';
      $button.attr({
        'title': "play",
      });

      if (typeof(_this.settings.onStop) === 'function') {
        _this.settings.onStop($button);
      }

      _this.resetAudio();
      _this.audio.pause();
    },
    
    /**
     * 加载资源
     * 
     * @param {any} src
     */
    loadAudio: function(src) {
      var _this = this;

      _this.audio.src = src;
      _this.hasLoaded = true;
      _this.$progress.addClass('progress--load');
    },

    /**
     * 重置 播放样式
     * 
     * @param {any} currentTime 
     */
    resetAudio: function() {
      var _this = this;

      _this.audio.currentTime = 0;
      _this.audioStatus === 'unplay';
      _this.setAudioCurrentTime(0);
      _this._setAudioProgress(0);
    },

    /**
     * 设置播放的当前时间
     * 
     * @param {any} currentTime 
     */
    setAudioCurrentTime: function(currentTime) {
      var _this = this;

      _this.audio.currentTime = currentTime;
    },

    /**
     * 设置播放进度
     * 
     * @param {any} percent 
     */
    _setAudioProgress: function(percent) {
      var _this = this;

      var percent = _this._limitPercent(percent);

      _this.$progressBar.css({
        width: percent + '%',
      });

      _this.$progressHandle.css({
        left: percent + '%',
      });

      // 即将播放的开始时间
      var formatCurrentTime = _this._getFormatTime((percent / 100) * _this.audio.duration);
      _this._setAudioTime(formatCurrentTime, _this.$audioTimeCurrent);
    },

    /**
     * 限制百分比
     * 
     * @param {any} percent 
     */
    _limitPercent: function(percent) {
      if (percent <= 0) {
        percent = 0;
      } else if (percent >= 100) {
        percent = 100;
      }

      return percent;
    },

    /**
     * 设置时间
     * 
     * @param {any} time 
     * @param {any} $time 
     */
    _setAudioTime: function(time, $time) {
      $time.html(time);
    },

    /**
     * 格式化时间
     * 
     * @param {any} time 
     */
    _getFormatTime: function(time) {
      var MM = Math.floor(time / 60);
      var SS = time % 60;
      if (MM < 10) {
        MM = "0" + MM;
      }
      if (SS < 10) {
        SS = "0" + SS;
      }

      var min = MM + ":" + SS;
      return min.split('.')[0];
    },

    /**
     * 渲染基础 DOM
     * 
     */
    _renderBaseDom: function() {
      var _this = this;

      _this._renderControls();
      _this._renderProgress();
      _this._renderAudioInfo();
    },
    
    /**
     * 渲染控制按钮
     * 
     */
    _renderControls: function() {
      var _this = this;

      var $prev = $('<a class="js-controls-button" data-action="prev" title="prev"><svg class="icon__controls"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-prev"></use></svg></a>');
      var $play = $('<a class="js-controls-button" data-action="toggle" title="play"><svg class="icon__controls"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-play"></use></svg></a>');
      var $next = $('<a class="js-controls-button" data-action="next" title="next"><svg class="icon__controls"><use xmlns:xlink="http://www.w3.org/1999/xlink" xlink:href="#icon-next"></use></svg></a>');

      _this.$audioControls.append($prev);
      _this.$audioControls.append($play);
      _this.$audioControls.append($next);
      _this.$element.append(_this.$audioControls);
    },
    
    /**
     * 渲染进度
     * 
     */
    _renderProgress: function() {
      var _this = this;

      _this.$progress.append(_this.$progressBar);
      _this.$progress.append(_this.$progressHandle);
      _this.$audioProgress.append(_this.$progress);
      _this.$element.append(_this.$audioProgress);
    },
    
    /**
     * 渲染音频信息
     * 
     */
    _renderAudioInfo: function() {
      var _this = this;

      var $audioInfo = $('<div class="audio__info">');

      $audioInfo.append(_this.$audioTimeCurrent);
      $audioInfo.append(_this.$audioTimeTotal);
      _this.$element.append($audioInfo);
    },
  };



  /**
   * ------------------------------------------------------------------------
   * Plugin
   * ------------------------------------------------------------------------
   */
   function Plugin(options) {
    var _this = this;
    var obj;

    return this.each(function(){
        var $this = $(this);
        var instance = window.jQuery ? $this.data(NAME) : $.fn[NAME].lookup[$this.data(NAME)];
        
        if (!instance) {
          obj = new Func($this, options);

          if (window.jQuery) {
            $this.data(NAME, obj);
          } else {
            $.fn[NAME].lookup[++$.fn[NAME].lookup.i] = obj;
            $this.data(NAME, $.fn[NAME].lookup.i);
            instance = $.fn[NAME].lookup[$this.data(NAME)];
          }
        } else {
          obj = new Func($this, options);
        }

        if (typeof options === 'string') { 
          instance[options]();
        }

        // 提供外部调用公共方法
      });
  };

  
  $.fn[NAME] = Plugin;
  $.fn[NAME].defaults = Default;
  
  if (!window.jQuery) {
    $.fn[NAME].lookup = {i: 0};
  }



  /**
   * ------------------------------------------------------------------------
   * Plugin DATA-API
   * ------------------------------------------------------------------------
   */
  $(window).on(Event.LOAD_DATA_API, function () {
    $('[data-audio="audio"]').each(function () {
      var $audio = $(this);
      var src = $audio.attr('data-src');
      var options = {
        src: src,
      };

      Plugin.call($audio, options);
    });
  });


  return Func;
})(window, document, window.jQuery || window.Zepto);