/**
 * http://www.jb51.net/article/88600.htm
 */
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof exports === 'object') {
    module.exports = factory();
  } else {
    root.Calendar = factory();
  }
})(this, function() {

  /**
   * 日期转化为字符串， 4位年+2位月+2位日
   * 
   * @param {any} date 
   * @returns 
   */
  function getDateStr(date) {
    var _year = date.getFullYear();
    // 月从0开始计数
    var _month = date.getMonth() + 1;
    var _d = date.getDate();

    _month = (_month > 9) ? ("" + _month) : ("0" + _month);
    _d = (_d > 9) ? ("" + _d) : ("0" + _d);

    return _year + _month + _d;
  }


  var dateObj = (function(){
    // 默认为当前系统时间
    var _date = new Date();
    return {
      getDate : function(){
        return _date;
      },
      setDate : function(date) {
        _date = date;
      }
    };
  })();


  var defaults = {
    wrapper: 'body',
    defaultValue: '',
    selectCallback: null,
  };
  var defaultsType = {};

  function Calendar(options) {
    var _this = this;

    _this.settings = $.extend({}, defaults, options);

    if (_this.settings.defaultValue) {
      // 有默认值, 设置时间
      var dateArr = _this.settings.defaultValue.split('-');
      _this._year = Math.round(dateArr[0]);
      _this._month = Math.round(dateArr[1]);
      _this._date = Math.round(dateArr[2]);
      
      var _now = new Date(_this._year, _this._month, _this._date);
      dateObj.setDate(_now)
    } else {
      // 没有默认值, 设置当前时间
      var _date = dateObj.getDate();
      _this._year = _date.getFullYear();
      _this._month = _date.getMonth() + 1;
      _this._date = _date.getDate();
    }

    _this._init();
  };

  Calendar.prototype = {
    constroctor: Calendar,

    _init: function() {
      var _this = this;

      _this.$wrapper = $(_this.settings.wrapper);
      _this._renderBaseDOM();
      _this._renderCalendarDataDOM();
      _this._showCalendarData();
      _this._bindEvents();
    },
    
    _bindEvents: function() {
      var _this = this;

      _this.$wrapper.on('click', '.calendar__btn__month--prev', function() {
        _this.reRenderCalendarData('prev');
      });

      _this.$wrapper.on('click', '.calendar__btn__month--next', function() {
        _this.reRenderCalendarData('next');
      });


      _this.$wrapper.on('click', '.calendar__cell', function() {
        var _calendar = $(this).attr('data-calendar');
        var _year = Math.round(_calendar.substr(0, 4));
        var _month = Math.round(_calendar.substr(4, 2));
        var _date = Math.round(_calendar.substr(6, 2));

        _this._year = _year;
        _this._month = _month;
        _this._date = _date;

        dateObj.setDate(new Date(_this._year, _this._month - 1, _this._date));
        _this._showCalendarData();

        console.log(_this.settings);
        if (typeof _this.settings.selectCallback === 'function') {
          var mySelect = _this._year + '-' + _this._month + '-' + _this._date;
          _this.settings.selectCallback(mySelect);
        }
      });
    },

    reRenderCalendarData: function(action) {
      var _this = this;
      var step = 1;

      if (action === 'prev') {
        step = -1;
      }

      _this._month += step;

      var currentSetDate = new Date(_this._year, _this._month - 1, 1);
      dateObj.setDate(currentSetDate);
      _this._year = currentSetDate.getFullYear();
      _this._month = currentSetDate.getMonth() + 1;
      _this._date = currentSetDate.getDate();

      _this._showCalendarData();
    },

    /**
     * 渲染显示日历数据
     * 如果设置年月日的时候，超出当月，js会自动算成下个月的. 
     * 例如4月只有30天，如果设置成31 日，获得的Date类型中自动会算成5月1日；如果设置成5月0日，js会处理成4月30日，那么5月-1日也就是4月29日 
     */
    _showCalendarData: function() {
      var _this = this;

      var _year = _this._year;
      var _month = _this._month;
      var _date = _this._date;

      // 设置表头时间
      var titleStr = _this._year + "年 " + _this._month + "月";
      _this.$mySelect.html(titleStr);

      // 设置表格中的日期数据
      var $tds = _this.$table.find('td');
      // 当前月第一天
      var _firstDay = new Date(_year, _month - 1, 1);
      $.each($tds, function(index, item) {
        var _thisDay = new Date(_year, _month - 1, index + 1 - _firstDay.getDay());
        var _thisDayStr = getDateStr(_thisDay);
        
        // 情况状态
        $(item).removeClass('calendar__cell--current calendar__cell--last calendar__cell--next');
        $(item).attr({
          'title': (_thisDay.getFullYear() + '-' + (_thisDay.getMonth() + 1) + '-' + _thisDay.getDate()),
          'data-calendar': _thisDayStr,
        });
        $(item).html('<div class="calendar__date">'+ _thisDay.getDate() +'</div>');

        if (_thisDayStr === getDateStr(new Date(_year, _month - 1, _date))) {
          // 当天
          $(item).addClass('calendar__cell--current');
        }

        if (_thisDayStr.substr(0, 4) < getDateStr(_firstDay).substr(0, 4) || (_thisDayStr.substr(0, 4) === getDateStr(_firstDay).substr(0, 4) && _thisDayStr.substr(4, 2) < getDateStr(_firstDay).substr(4, 2))) {
          // console.log('上一个月');
          $(item).addClass('calendar__cell--last');
        } else if (_thisDayStr.substr(0, 4) > getDateStr(_firstDay).substr(0, 4) || (_thisDayStr.substr(0, 4) === getDateStr(_firstDay).substr(0, 4) && _thisDayStr.substr(4, 2) > getDateStr(_firstDay).substr(4, 2))) {
          // console.log('下一个月');
          $(item).addClass('calendar__cell--next');
        }
      });
    },

    _renderCalendarDataDOM: function() {
      var _this = this;

      _this._renderHeader();
      _this._renderBody();
    },

    _renderHeader: function() {
      var _this = this;
      
      _this.$prevMonthBtn = $('<a class="calendar__btn__month calendar__btn__month--prev" title="Previous month">&lt;</a>');
      _this.$nextMonthBtn = $('<a class="calendar__btn__month calendar__btn__month--next" title="Next month">&gt;</a>');
      _this.$mySelect = $('<span class="calendar__select"></span>');
      
      _this.$CalendarHeader.append(_this.$prevMonthBtn);
      _this.$CalendarHeader.append(_this.$mySelect);
      _this.$CalendarHeader.append(_this.$nextMonthBtn);
    },

    _renderBody: function() {
      var _this = this;

      _this._renderTable();
    },

    _renderTable: function() {
      var _this = this;

      _this.$table = $('<table class="calendar__table" cellspacing="0"></table>');
      var $tableThead = $('<thead class="calendar__thead">' +
      '<tr role="row">' +
          '<th title="星期日"><span>日</span></th>' +
          '<th title="星期一"><span>一</span></th>' +
          '<th title="星期二"><span>二</span></th>' +
          '<th title="星期三"><span>三</span></th>' +
          '<th title="星期四"><span>四</span></th>' +
          '<th title="星期五"><span>五</span></th>' +
          '<th title="星期六"><span>六</span></th>' +
        '</tr>' +
      '</thead>');

      // 一个月最多 31 天, 所以一个月最多占 6 行表格
      var _bodyHtml = '';
      for(var i = 0; i < 6; i++) {  
        _bodyHtml += '<tr role="row">' +
          '<td class="calendar__cell"></td>' +
          '<td class="calendar__cell"></td>' +
          '<td class="calendar__cell"></td>' +
          '<td class="calendar__cell"></td>' +
          '<td class="calendar__cell"></td>' +
          '<td class="calendar__cell"></td>' +
          '<td class="calendar__cell"></td>' +
        '</tr>';
      }

      var $tableTBody = $('<tbody class="calendar__tbody"></tbody');
      $tableTBody.html(_bodyHtml);

      _this.$table.append($tableThead);
      _this.$table.append($tableTBody);
      _this.$CalendarBody.append(_this.$table);
    },

    _renderBaseDOM: function() {
      var _this = this;

      _this.$Calendar = $('<div class="calendar" /></div>');
      _this.$CalendarPanel = $('<div class="calendar__panel" /></div>');
      _this.$CalendarPanelDate = $('<div class="calendar__panel--date"></div>');
      _this.$CalendarHeader = $('<div class="calendar__header"></div>');
      _this.$CalendarBody = $('<div class="calendar__body"></div>');
      _this.$CalendarFooter = $('<div class="calendar__footer"></div>');

      _this.$CalendarPanelDate.append(_this.$CalendarHeader);
      _this.$CalendarPanelDate.append(_this.$CalendarBody);
      _this.$CalendarPanelDate.append(_this.$CalendarFooter);

      _this.$CalendarPanel.append(_this.$CalendarPanelDate);
      _this.$Calendar.append(_this.$CalendarPanel);
      _this.$wrapper.append(_this.$Calendar);
    },
  };

  return Calendar;

});