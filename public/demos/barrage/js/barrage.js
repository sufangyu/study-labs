/**
 * http://www.bestvist.com/2017/10/25/barrage-canvas/
 * 
 * http://www.zhangxinxu.com/study/201709/canvas-barrage-video-demo.html
 * 
 * http://www.rainx.org/2016/12/22/html5-canvas%E5%AE%9E%E7%8E%B0%E9%AB%98%E5%B9%B6%E5%8F%91%E8%A7%86%E9%A2%91%E5%BC%B9%E5%B9%95%E5%8A%9F%E8%83%BD/
 * 
 */
(function() {

  var requestAnimFrame = (function() {
    return  window.requestAnimationFrame       ||
            window.webkitRequestAnimationFrame ||
            window.mozRequestAnimationFrame    ||
            function(callback) {
              window.setTimeout(callback, 1000 / 60);
            };
  })();

  var cancelAnimFrame = (function() {
    return  window.cancelAnimationFrame ||  
            Window.webkitCancelAnimationFrame ||  
            window.mozCancelAnimationFrame ||  
            window.msCancelAnimationFrame ||  
            window.oCancelAnimationFrame ||  
            function(id){  
              window.clearTimeout(id);  
            }  
  })();



  function Barrage() {
    this.init();
  }


  Barrage.prototype.init = function() {
    this.canvas = document.getElementById('canvas');
    let rect = this.canvas.getBoundingClientRect();
    this.w = rect.right - rect.left;
    this.h = rect.bottom - rect.top;
    console.log('rect =>>', rect, this.w, this.h);

    this.ctx = this.canvas.getContext('2d');
    this.ctx.font = '20px Microsoft YaHei';
    this.barrageList = [];
    this.timer = null;
  };


  /**
   * 添加字幕数据
   * 数据格式 {"value": "***", "color": "#ccc", "speed": "1.250"}
   * 
   * @param {any} options 
   * @returns 
   */
  Barrage.prototype.shoot = function(options) {
    if (!options.value) {
      return;
    }

    var value = options.value;
    var top = this._getTop();
    var color = options.color || '#' + Math.floor(Math.random() * 0xffffff).toString(16); // 随机颜色
    var speed = options.speed ||  +(Math.random() * 4).toFixed(1) + 1; // 随机速度
    var width = Math.ceil(this.ctx.measureText(value).width); // 字幕文字宽度
    var barrage = {
      value: value,
      top: top,
      left: this.w,
      color: color,
      speed: speed,
      width: width
    };

    console.log('speed =>>', speed);

    this.barrageList.push(barrage);
  };


  Barrage.prototype.draw = function() {
    var _this = this;

    // 没有字幕
    if (this.barrageList.length === 0) {
      this.end();
      return;
    }
    
    
    if (this.barrageList.length) {
      // 1. 清除屏幕
      cancelAnimFrame(this.timer);
      this.clear();

      // 生成新的字幕
      for (var i = 0; i < this.barrageList.length; i++) {
        let b = this.barrageList[i];
        console.log('speed =>>', b.speed);

        // 当前字幕文字滚出可视区外
        if (b.left + b.width <= 0) {
          this.barrageList.splice(i, 1);
          i--;
          continue;
        }

        // 位置减去偏移量
        b.left -= b.speed;
        this._drawText(b);
      }
    }

    this.timer = requestAnimFrame(this.draw.bind(this));
  };

  /**
   * 字幕滚动完
   */
  Barrage.prototype.end = function() {
    cancelAnimFrame(this.timer);
    this.clear();
    this.timer = null;
  };

  /**
   * 清除字幕
   * 
   */
  Barrage.prototype.clear = function() {
    this.ctx.clearRect(0, 0, this.w, this.h);
    this.ctx.restore();
  };


  /**
   * 绘制文字
   * 
   * @param {any} barrage 
   */
  Barrage.prototype._drawText = function(barrage) {
    this.ctx.fillStyle = barrage.color;
    this.ctx.fillText(barrage.value, barrage.left, barrage.top);
  };


  /**
   * 获取随机 top 值
   * 
   * @returns 
   */
  Barrage.prototype._getTop = function() {
    //canvas绘制文字x,y坐标是按文字左下角计算，预留30px
    return Math.floor(Math.random() * (this.h - 30)) + 30;
  };

  window.Barrage = Barrage;

})();