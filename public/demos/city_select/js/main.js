$(document).ready(function(){
  new CitySelect().init();
});


/**
 * http://www.17sucai.com/preview/458010/2017-09-19/dom/demo.html
 * 
 */
function CitySelect() {
  var _this = this;

  _this.$cityLetterList = $('.city-letter-list');
  _this.$cityLetterCurrent = $('.city-letter-current');

  _this.currentCityIndexe = 0; // 当前序号
  _this.indexesPositionArr = []; // 序号索引每项的位置
}

CitySelect.prototype.init = function (){
  console.log('初始化..');
  var _this = this;

  this.getIndexesPostion();
  this.bindEvents();
};

/**
 * 获取 索引每个项目的位置
 * 
 */
CitySelect.prototype.getIndexesPostion = function() {
  var _this = this;

  _this.$cityLetterList.children().each(function(index, item) {
    // console.log(index, item);
    var $item = $(item);
    var positionY = $item.offset().top - $(window).scrollTop();
    _this.indexesPositionArr.push(positionY);
  });
};

CitySelect.prototype.bindEvents = function() {
  var _this = this;

  // 是否按下
  var isDown = false;

  _this.$cityLetterList.on('touchstart', function(ev) {
    ev.preventDefault();
    onLetterDown(ev);
  });
  _this.$cityLetterList.on('touchmove', function(ev) {
    ev.preventDefault();
    onLetterMove(ev);
  });
  _this.$cityLetterList.on('touchend', function(ev) {
    ev.preventDefault();
    onLetterUp(ev);
  });

  _this.$cityLetterList.on('mousedown', function(ev) {
    ev.preventDefault();
    onLetterDown(ev);
  });
  _this.$cityLetterList.on('mousemove', function(ev) {
    ev.preventDefault();
    onLetterMove(ev);
  });
  _this.$cityLetterList.on('mouseup', function(ev) {
    ev.preventDefault();
    onLetterUp(ev);
  });



  function onLetterDown(ev) {
    isDown = true;

    _this.$cityLetterCurrent.removeClass('hide');
    _this.$cityLetterList.parent().addClass('active');
    _this.matchingCity(ev);
  }

  function onLetterMove(ev) {
    if (!isDown) {
      return;
    }

    _this.matchingCity(ev);
  }

  function onLetterUp() {
    isDown = false;
    
    _this.$cityLetterCurrent.addClass('hide');
    _this.$cityLetterList.parent().removeClass('active');
  }
};

/**
 * 匹配 城市
 * 
 * @param {any} ev 
 */
CitySelect.prototype.matchingCity = function(ev) {
  var _this = this;

  var touch = ev.changedTouches ? ev.changedTouches[0] : ev;
  var positionY = touch.clientY;

  $(_this.indexesPositionArr).each(function(index, posY) {
    // 小于第一项索引位置
    if (positionY < _this.indexesPositionArr[0]) {
      _this.setCurrentCity(0);
      _this.setCurrentPosition();
      return false;
    }

    // 大于最后一项索引位置
    if(positionY > _this.indexesPositionArr[_this.indexesPositionArr.length - 1]) {
      _this.setCurrentCity(_this.indexesPositionArr.length - 1);
      _this.setCurrentPosition();
      return false;
    }

    // 大于序号位置 && 小于下一项需要位置
    if (positionY > _this.indexesPositionArr[index] && positionY < _this.indexesPositionArr[index + 1]) {
      _this.setCurrentCity(index);
      _this.setCurrentPosition();
      return false;
    }
  });
};

/**
 * 设置当前城市字母提示
 * 
 * @param {any} ev 
 */
CitySelect.prototype.setCurrentCity = function(index) {
  var _this = this;

  var $currentCity = _this.$cityLetterList.children().eq(index);
  var currentCityText = $currentCity.html();
  var currentCityletter = $currentCity.attr('data-letter');

  _this.currentCityIndexe = index;
  _this.currentCityletter = currentCityletter;
  
  _this.$cityLetterCurrent.html(currentCityText);
};

/**
 * 设置当前城市位置
 * 
 * @param {any} ev 
 */
CitySelect.prototype.setCurrentPosition = function() {
  var _this = this;

  var $currentCity = $('.city-list[data-letter='+ _this.currentCityletter +']');
  // console.log($currentCity);

  if ($currentCity.length) {
     var currentCityPosY = $currentCity.offset().top;
    $(document).scrollTop(currentCityPosY);
  }
};