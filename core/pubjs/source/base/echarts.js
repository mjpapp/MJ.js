define(function(require, exports) {
	var pubjs = require('pubjs');
	var view = require('@base/view');
	var echarts = require('@libs/echarts/2.2.2/dist/echarts-all');
	var util = require('util');
	var $ = require('jquery');

	// 2.2.2版本不再支持cmd，可通过全局变量访问
	if (!echarts) {
		echarts = window.echarts;
	}

	// build默认配置
	var DEFAULT_BUILD = {
		calculable: true
		,title: {
			text: ''
			,x: 'center'
		}
		,toolbox: {
			show : true
			,feature : {
				restore : {show: true}
				,saveAsImage : {show: true}
			}
		}
		,series: {} // 传入对象为公用，传入数组为分别设置
		,tooltip: {trigger: 'item'}
	}

	var Base = view.container.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				type: null    // 类型，可选为 line(折线图)|bar(柱形图)|scatter(散点图)|k(K线图)|pie(饼图)|radar(雷达图)|chord(和弦图)|force(力导布局图)|map(地图)
				,theme: 'default'   // 主题，默认只有default、macarons、infographic,其它主题需传入主题配置对象(require theme下的主题文件)
				,title: null   // [String|Object] String为标题居中，Object为高级配置，参见echarts的title
				,url: ''
				,param: null
				,autoLoad: true
				,reqMethod: 'get'
				,loadingText: LANG('资料加载中..')  // Loading提示信息
				,emptyText: LANG('没有数据')
				,width: '100%'
				,height: '100%'
				,xField: {
					field: 'name'       // X轴字段名称
					,format: null       // X轴格式化函数
				}
				,yField:[
					{
						field: 'value'  // Y轴字段名称
						,yAxisIndex: 0 // 字段Y轴索引
						,text: null     // Y轴label
						,format: null   // Y轴格式化函数
					}
				]
				,itemFilter: null    // 数据过滤函数
				,itemFormat: null    // 数据属性格式化函数 (先调用filter，再调用format, 再调用dataProcess)
				,dataProcess: null   // 数据合并和其它处理
				,build: DEFAULT_BUILD
			});

			this.$data = [];
			this.$list = [];
			this.$rowData = null;
			this.$option = null;
			this.$echarts = null;

			this.Super('init', arguments);
		}
		,afterBuild: function() {
			var el = this.getDOM(),
				c = this.getConfig();

			el.width(c.width || '100%');
			el.height(c.height || '100%');
			el.css('position', 'relative');

			this.doms = {
				tip: $('<div class="M-chartTip"/>').appendTo(el).hide(),
				main: $('<div class="M-echarts-main"/>').appendTo(el)
			}

			el.children().each(function() {
				$(this).width('100%').height('100%').css({
					width: '100%'
					,height: '100%'
					,position: 'absolute'
					,left: 0
					,top: 0
				});
			});

			this.$echarts = echarts.init(this.doms.main[0], c.theme);
			this.buildOpt();

			if (c.autoLoad && c.url) {
				this.load();
			}
		}
		,setOption: function() {
			this.$echarts.clear();
			this.$echarts.setOption(this.$option);
			return this;
		}
		,buildOpt: function() {
			var option = {},
				c = this.getConfig();

			option = $.extend(option, c.build);

			if (util.isString(c.title)) {
				c.title = {text: c.title};
			}
			option.title = $.extend(option.title, c.title);

			this.$option = option;

			return option;
		}
		,getCharts: function() {
			return this.$echarts;
		}
		,resize: function() {
			this.$echarts.resize();
		}
		,reset: function() {
			this.toggleEmpty(0);
			this.toggleLoading(0);
			this.$echarts.clear();
			return this;
		}
		,setParam: function(param, replace){
			if (replace){
				this.setConfig('param', param);
			} else {
				this.extendConfig('param', param);
			}
			return this;
		}
		,getParam: function() {
			var param = this.getConfig('param') || {};
			return param;
		}
		,load: function() {
			var c = this.getConfig();
			if (c.url){
				this.toggleLoading(1);
				this.abort();
				this.$ajax_id = pubjs.data[c.reqMethod](c.url, this.getParam(), this);
			} else {
				pubjs.error('Chart load data with no url!');
			}
			return this;
		}
		,onData: function(err, data){
			this.toggleLoading(0);
			if (err){
				this.toggleEmpty(1);
				return false;
			}
			if (data && data.items && data.items.length) {
				this.setData(data.items);
			} else {
				this.toggleEmpty(1);
			}
			return false;
		}
		,getData: function() {
			return this.$data;
		}
		,setData: function(data) {
			if (data && util.isArray(data.items)) {
				data = data.items;
			}
			this.$data = data;
			this.formatData();
			this.buildRowData();
			this.buildLegend();
			this.buildXAxis();
			this.buildSeries();
			this.buildMore();
			this.fixMarkLinePoint();
			this.setOption();
		}
		,formatData: function() {
			var self = this,
				c = this.getConfig();

			self.$list = [];

			util.each(this.$data, function(item, i) {
				if (!util.isFunc(c.itemFilter) || c.itemFilter.call(self, item, i, c)) {
					self.$list.push(util.isFunc(c.itemFormat) ? c.itemFormat.call(self, item, i) : item);
				}
			});

			if (util.isFunc(c.dataProcess)) {
				self.$list = c.dataProcess.call(self, self.$list, c);
			}

		}
		// 数据分组
		,buildRowData: function() {
			var self = this,
				c = this.getConfig();

			if (!util.isArray(c.yField)) {
				c.yField = [c.yField];
			}

			this.$dataMax = [];

			var rowData = {};
			util.each(this.$list, function(item) {
				util.each(c.yField, function(filedOpt) {
					var xField = util.isString(c.xField) ? c.xField : c.xField.field;
					var yfield = util.isString(filedOpt) ? filedOpt : filedOpt.field;
					var yAxisIndex = filedOpt.yAxisIndex || 0;

					if ((xField in item) && (yfield in item)) {
						if (!(yfield in rowData)) {
							rowData[yfield] = {
								name: filedOpt.text
								,yAxisIndex: filedOpt.yAxisIndex   // 纵向坐标轴index
								,data: []
								,type: filedOpt.type
							}
						}

						if (!self.$dataMax[yAxisIndex] || item[yfield] > self.$dataMax[yAxisIndex]) {
							self.$dataMax[yAxisIndex] = item[yfield];
						}

						rowData[yfield].data.push(util.extend({}, item, {
							name: util.isFunc(c.xField && c.xField.format) ? c.xField.format.call(self, item[xField], item, c) : item[xField]
							,value: util.isFunc(filedOpt && filedOpt.format) ? filedOpt.format.call(self, item[yfield], item, c) : item[yfield]
						}));
					}

				});
			});

			this.$rowData = rowData;
		}
		,buildLegend: function() {
			var option = this.$option,
				legend = this.getConfig('build/legend');

			if (!legend) {
				return;
			}

			legend.data = [];
			option.legend = legend;

			util.each(this.$rowData, function(row, rowField) {
				legend.data.push(row.name);
			});

			this.$option.legend = legend;
		}
		,buildXAxis: function() {
			var i = 0,
				option = this.$option,
				xAxis = this.getConfig('build/xAxis');

			if (!xAxis) {
				return;
			}

			option.xAxis = [];
			util.each(this.$rowData, function(row, rowField) {
				var xA = util.isArray(xAxis) ? xAxis[i] : $.extend({}, xAxis);
				xA.data = [];
				util.each(row.data, function(v) {
					xA.data.push(v.name);
				});
				option.xAxis.push(xA);
				return false;
			});
		}
		,buildSeries: function(useKV) {
			var i = 0,
				option = this.$option,
				c = this.getConfig(),
				series = this.getConfig('build/series');

			if (!series) {
				pubjs.error('config build/series is necessary');
				return;
			}

			option.series = [];
			util.each(this.$rowData, function(row, rowField) {
				var ser = util.isArray(series) ? series[i] : $.extend({}, series);
				ser.name = row.name;
				ser.type = row.type || c.type;
				//if (c.type) {
				//	ser.type = c.type;
				//}
				if (row.yAxisIndex && util.isArray(c.build.yAxis) && c.build.yAxis[row.yAxisIndex]) {
					ser.yAxisIndex = row.yAxisIndex;
				}
				ser.data = row.data;
				option.series.push(ser);
				i++;
			});
		}
		,removeOptItem: function(itemName) {
			if (itemName in this.$option) {
				delete this.$option[itemName];
			}
		}
		// 由子模块拓展
		,buildMore: function(){}
		// fix: 原生配置markLine和markPoint不可影藏
		,fixMarkLinePoint: function() {
			util.each(this.$option.series, function(ser) {
				if (ser.markLine && ser.markLine.show === false) {
					util.extend(ser, {markLine: null});
				}

				if (ser.markPoint && ser.markPoint.show === false) {
					util.extend(ser, {markPoint: null});
				}
			});
		}
		,abort:function(){
			if (this.$ajax_id) {
				pubjs.data.abort(this.$ajax_id);
				this.$ajax_id = null;
			}
			return this;
		}
		,toggleLoading: function(show) {
			// var doms = this.doms;
			// doms.main.toggle(!show);
			// doms.tip.removeClass('M-chartEmpty');
			// doms.tip.toggle(!!show).toggleClass('M-chartLoading', !!show).text(this.getConfig('loadingText'));
			this.$echarts[show ? 'showLoading' : 'hideLoading']({
				effect: 'whirling'
				,text: LANG('加载中...')
			});
		}
		,toggleEmpty: function(show) {
			var doms = this.doms;
			doms.main.toggle(!show);
			doms.tip.removeClass('M-chartLoading');
			doms.tip.toggle(!!show).toggleClass('M-chartEmpty', !!show).text(this.getConfig('emptyText'));
		}
	});

	exports.base = Base;

	// 折线图
	var Line = Base.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				type: 'line'
				,build: {
					yAxis: [
						{
							type : 'value'
							,axisLabel : {
								interval: 0
								,formatter: '{value}'
							}
						}
					]
					,xAxis: {
						type : 'category'
						,boundaryGap : false
					}
					,legend: {
						x: 'left'
					}
					,option: {
						dataRange: {
							precision: 0
						}
					}
					,series: {
						markPoint : {
							data : [
								{type : 'max', name: '最大值'}
								,{type : 'min', name: '最小值'}
							]
						}
						,markLine : {
							data : [
								{type : 'average', name: '平均值'}
							]
						}
					}
				}
			});

			this.Super('init', arguments);
		}
		,buildMore: function() {
			var self = this;

			var option = this.$option;
			var yAxis = this.getConfig('build/yAxis');

			if (!util.isArray(yAxis)) {
				yAxis = [yAxis];
			}

			option.yAxis = [];
			util.each(this.$dataMax, function(max, yAxisIndex) {
				option.yAxis[yAxisIndex] = yAxis[yAxisIndex] || util.clone(yAxis[0]);
			});

			// 避免最大值盖住标题
			util.each(option.yAxis, function(axis, index) {
				axis.max = Math.ceil(self.$dataMax[index]*1.3/100) * 100;
			});
		}
	});
	exports.line = Line;

	// 柱状图
	var Bar = Base.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				type:'bar'
				// Array 依次定义每个指标的柱颜色
				// ,color: ''
				,xField: {
					field: 'name'         // 名称字段名
					,format: null         // 名称字段格式化函数
				}
				,yField: [
					{
						field: 'value'        // 值字段名
						,text: '-'            // Y轴label
						,format: null         // 值字段格式化函数
					}
				]
				,build: {
					legend: {
						orient : 'vertical',
						x : 'left'
					}
					,xAxis: {
						type : 'category',
						boundaryGap : true
					}
					,yAxis: [
						{
							type : 'value'
						}
					]
					,series: {
						barWidth: 10
						,markPoint : {
							data : [
								{type : 'max', name: '最大值'},
								{type : 'min', name: '最小值'}
							]
						}
						,markLine : {
							data : [
								{type : 'average', name: '平均值'}
							]
						}
					}
				}
			});

			this.Super('init', arguments);
		},
		buildMore: function() {
			var c = this.getConfig();
			var color = c.color.slice(0);
			util.each(this.$option.series, function(item) {
				var currentColor = color.shift();
				if (currentColor) {
					item.itemStyle = {
						normal: {
							color: currentColor
						}
					}
				}
			});
		}
	});

	exports.bar = Bar;

	// 饼状图
	var Pie = Base.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				type:'pie'
				,xField: {
					field: 'name'         // 名称字段名
					,format: null         // 名称字段格式化函数
				}
				,yField: [
					{
						field: 'value'        // 值字段名
						,format: null         // 值字段格式化函数
					}
				]
				,build: {
					series: {
						radius: ['50%', '70%'],
						selectedMode: 'single'
					}
					,tooltip: {
						trigger: 'item'
						,formatter: "{b} : {c} ({d}%)"
					}
					,legend: {
						x : 'center'
						,y: 'bottom'
					}
				}
			});

			this.Super('init', arguments);
		}
		,buildMore: function() {
			var option = this.$option;
			if (!option.legend) {return;}
			option.legend.data = [];
			util.each(option.series, function(ser) {
				util.each(ser.data, function(item) {
					option.legend.data.push(item.name);
				});
			});
		}
	});

	exports.pie = Pie;

	// 南丁格尔玫瑰图
	var Rose = Pie.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				build: {
					series: {
						roseType : 'area'
						,selectedMode: 'multiple'
						,radius: [30, 90]
					}
				}
			});

			this.Super('init', arguments);
		}
	});

	exports.rose = Rose;


	// 漏斗图
	var Funnel = Base.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				type:'funnel'
				,xField: {
					field: 'name'         // 名称字段名
					,format: null         // 名称字段格式化函数
				}
				,yField: [
					{
						field: 'value'        // 值字段名
						,format: null         // 值字段格式化函数
					}
				]
				,build: {
					legend: {
						x : 'center'
						,y: 'bottom'
					}
				}
			});

			this.Super('init', arguments);
		}
		,buildMore: function() {
			var option = this.$option;
			if (!option.legend) {return;}
			option.legend.data = [];
			util.each(option.series, function(ser) {
				util.each(ser.data, function(item) {
					option.legend.data.push(item.name);
				});
			});
		}
	});
	exports.funnel = Funnel;


	// 地图
	var Map = Base.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				type: 'map'
				,xField: {
					field: 'name'   // 名称字段名
					,format: null   // 名称字段格式化
				}
				,yField: [
					{
						field: 'value'  // 值字段名
						,format: null   // 名称字段格式化
					}
				]
				,build: {
					legend:{
						orient: 'vertical'
						,x:'left'
					}
					,dataRange: {
						min: 0
						,max: 1000
						,x: 'left'
						,y: 'bottom'
						,text:['高','低']
						,precision: 0
						,calculable : true
					}
					,series: {
						type: 'map'
						,mapType: 'china'
						,roam: false
						,mapLocation: {x: 70}
						,itemStyle:{
							normal:{label:{show:true}}
							,emphasis:{label:{show:true}}
						}
					}
				}
			});

			this.Super('init', arguments);
		}
		,buildMore: function() {
			// 默认是均分为100分，所以取整
			this.$option.dataRange.max = Math.ceil(Math.max.apply(this.$dataMax)/100) * 100;
		}
	});
	exports.map = Map;
});