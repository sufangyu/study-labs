$(document).ready(function() {
  new Captcha().init();
});


function Captcha() {
  var _this = this;

  _this.$captcha = $('.js-captcha');
  _this.$ncWrapper = $('<div class="nc__wrapper"></div>');

  _this.isUnlock = false; // 是否已经解锁

}

Captcha.prototype.init = function() {
  console.log('初始化..');
  var _this = this;

  _this.renderBase();
  _this.renderLoading();

  setTimeout(function() {
    _this.renderDragVerify();
    _this.bindEvents();
  }, 500);
};

Captcha.prototype.renderBase = function() {
  var _this = this;

  _this.$captcha.append(_this.$ncWrapper);
};

Captcha.prototype.renderLoading = function() {
  var _this = this;
  var $loading = $('<div class="nc__text"><span class="nc__lang__cnt" data-nc-lang="_loadingTEXT"><em>加载中</em><i class="loader nc__loader"></i></span></div>');

  _this.$ncWrapper.append($loading);
};

Captcha.prototype.renderDragVerify = function() {
  var _this = this;

  _this.$ncBg = $('<div class="nc__bg" style="width: 0.0001px;"></div>');
  _this.$ncButton = $('<span class="nc__btn nc__btn--slide" style="left: 0px;"></div>');
  _this.$ncText = $('<div class="nc__text slidetounlock"><span class="nc__lang__cnt" data-nc-lang="_startTEXT">请按住滑块，拖动到最右边</span></div>');

  _this.$ncWrapper.html('');
  _this.$ncWrapper.append(_this.$ncBg);
  _this.$ncWrapper.append(_this.$ncButton);
  _this.$ncWrapper.append(_this.$ncText);
};

Captcha.prototype.bindEvents = function() {
  var _this = this;

  _this.onButtonDrag();
  _this.onButtonTransitionEnd();

};

/**
 * 监听按钮拖拽相关事件
 * 
 */
Captcha.prototype.onButtonDrag = function() {
  var _this = this;

  _this.$ncButton.on('touchstart', onDown);
  _this.$ncButton.on('touchmove', onMove);
  _this.$ncButton.on('touchend', onUp);
  _this.$ncButton.on('mousedown', onDown);
  $(document).on('mousemove', onMove);
  $(document).on('mouseup', onUp);

  var startX = 0; // 按下的 X 位置
  var maxDistanceX = _this.$ncWrapper.width() - _this.$ncButton.outerWidth(true);
  var isDown = false; // 是否按下
  
  function onDown(ev) {
    ev.preventDefault();

    var touch = ev.changedTouches ? ev.changedTouches[0] : ev;
    isDown = true;
    startX = touch.clientX;
  }

  function onMove(ev) {
    ev.preventDefault();

    // 未按下 或者 已经解锁, 不再执行拖拽相关操作
    if (!isDown || _this.isUnlock) {
      return;
    };
    
    var touch = ev.changedTouches ? ev.changedTouches[0] : ev;
    var distanceX = touch.clientX - startX;

    if (distanceX >= maxDistanceX) {
      distanceX = maxDistanceX;
      _this.setVerifySuccess();
    } else if (distanceX < 0) {
      distanceX = 0;
    }

    _this.setDragDistanceX(distanceX);
  }

  function onUp(ev) {
    ev.preventDefault();

    // 未按下 或者 已经解锁, 不再往下执行
    if (!isDown || _this.isUnlock) {
      return;
    }

    isDown = false;

    var touch = ev.changedTouches ? ev.changedTouches[0] : ev;
    var distanceX = touch.clientX - startX;

    if (distanceX >= maxDistanceX) {
      distanceX = maxDistanceX;
      _this.setVerifySuccess();
    } else if (distanceX > 0) {
      distanceX = 0;
      _this.setVerifyFail();
    }

    _this.setDragDistanceX(distanceX);

  }

}

/**
 * 监听拖拽按钮运动结束事件
 * 
 */
Captcha.prototype.onButtonTransitionEnd = function() {
  var _this = this;

  _this.$ncButton.on('transitionend webkitTransitionEnd', function() {
    _this.$ncButton.removeClass('btn--move');
    _this.$ncBg.removeClass('bg--move');
  });
}

/**
 * 设置拖拽验证成功
 * 
 * @param {any} distanceX 
 */
Captcha.prototype.setVerifySuccess = function(distanceX) {
  var _this = this;
  _this.isUnlock = true;

  _this.$ncButton
    .addClass('nc__btn--ok')
    .removeClass('nc__btn--slide')
    .off('touchstart touchmove touchend mousedown');

  _this.$ncText
    .removeClass('slidetounlock')
    .find('.nc__lang__cnt')
      .html('验证通过')
      .attr({
        'data-nc-lang': '_yesTEXT'
      });
}


/**
 * 设置拖拽验证成功
 * 
 * @param {any} distanceX 
 */
Captcha.prototype.setVerifyFail = function(distanceX) {
  var _this = this;

  _this.$ncButton.addClass('btn--move');
  _this.$ncBg.addClass('bg--move');
}

/**
 * 设置推拽按钮位置以及已拖拽的宽度
 * 
 * @param {any} distanceX 
 */
Captcha.prototype.setDragDistanceX = function(distanceX) {
  var _this = this;

  _this.$ncButton.css({
    'left': distanceX,
  });

  _this.$ncBg.css({
    'width': distanceX,
  });
}

