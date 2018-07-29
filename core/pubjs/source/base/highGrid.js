define(function(require, exports){
	var $ = require('jquery');
	var util = require('util');
	var pubjs = require('pubjs');
	var view = require('@base/view');
	var common = require('@base/common/base');
	var dialog = require('@base/dialog');
	var menu = require('@base/common/menu');
	var labels = require('@sys_labels').labels;
	var Tip = require('@base/tip').base;
	var dateRange = require('@base/common/date');

	var HighGrid = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'target': parent,
				'class': 'M-HighGrid',

				'cols': [],				// 列定义,type:op,index,id
				'metrics': [],			// 要显示的指标列，支持'{组名}'的形式过滤; 若不填，默认为tab参数中的cols的并集
				'tab': null,			// 指标分组配置信息；{'组名':{"text":"String", "cols":[]}}
				'subs': null,			// 子表格配置，eg: ['campaign', 'sweety']
				'amountSubs': null,		// 汇总子表格配置，eg: ['campaign', 'sweety']
				'url': null,			// 远程数据地址
				'param': {},			// 远程数据请求参数
				'data': null,			// 静态数据
				'default_metrics': [],	// 指标分组中属于默认组的指标，支持'{组名}'的形式过滤; 若不填，默认为metrics参数的值
				// 'default_sort': true,	// 默认栏目排序
				'includeDefaultGroup': true, // 默认引用defaultGroup的指标分组

				'hasSelect':false,		// 是否有多选列
				'hasMenu': false,		// 是否有操作列
				'hasCompare': false,		// 是否有"切换到对比表格"功能
				'hasBatch': false,		// 是否有批量操作功能
				'hasExport': true,		// 是否有导出控件
				'hasRefresh': true,		// 是否有刷新控件
				'hasAutoRefresh': false,// 是否有自动刷新控件
				'hasAmount': true,		// 是否有总计模块
				'hasAmountSubGrid': false, // 汇总是否有子表格
				'fireSubgridParam': false, // 是否发送子表格的参数
				'needSetSubgridParam': false, // 是否给子表格 setParam
				'transSubgridParamCb': false, // 子表格setParam 的回调方法, 返回param。
				'hasPager': true,		// 是否有分页模块
				'hasSubGrid': true,		// 是否有子表格模块
				'hasTab': true,			// 是否有指标分组模块
				'hasSearch': true,		// 是否有搜索模块
				'hasWordsSearch': true, // 是否有多词搜索
				'hasFilter': true,		// 是否有筛选栏
				'hasFilterResult': true, // 是否显示搜索结果集
				'hasFilterSidebar': false, // 是否自带sidebar框，用于表格在弹层中, onSidebarFilter最好要return false; 否则会感染其他显示状态的表格
				'filterAutoFire': false, // filter 构建完后，是否自动fire
				'sidebar_config': {}, // 自带sidebar配置
				'hasTrTitle': false,	// 是否行tr增加title属性
				'renderTrTitle': null,	// 行title属性渲染函数
				'hasDateRange': false, // 是否有时间控件
				'dateRange': null, // 日期控件配置
				'userStorageDate': true, // 使用storage时间

				'hasFixedHeightBtn': true, // 是否有固定表格高度按钮
				'autoCalHeight': false, //  是否自动计算表格高度

				'compareOptions': [],	// 对比维度选项
				'listRowHoverKey': '',	// tr高亮的参照key

				'key': pubjs.config('grid/key')||'_id',
				'nameKey': '',	// 名字字段，传递给子表格面包屑用
				"reqMethod":"get",		// 数据获取方式
				"reqType": "ajax",		// 默认通信方式使用ajax，可选websocket
				'auto_load': true,		// 自动加载数据
				'eventDataLoad': false, // 是否冒泡数据已加载完成事件
				'eventSelect': false,   // 是否发送选中事件.
				'refreshTime': 10,		// 刷新间隔
				'refreshAuto': 0,		// 自动刷新中
				'refreshCheckToday': true, // 刷新时会检查今天
				'pager': null,			// 分页模块配置信息
				'subFilter': null,		// 子表格过滤函数
				'formatData': null,		// 格式化数据函数
				'customControl': null,	// 自定义控件函数，eg: 在表格头部区域增加一个自定义RadioGroup过滤组件
				'wrapperClass': '',		// 参照物标识符，计算高宽时使用

				'gridName': '',			// 本地缓存标识符，用于自定义默认指标、报表导出
				'gridNameSuffix': '',	// 本地缓存标识符后缀，用于出现gridName相同的情况，作为辨别指标配置
				'subField': '',			// 用于子表格作为父行的标识，如果没有设置此值，缺省使用 gridName 作为父行标识
				'exportParam': '',		// 导出参数，用于请求不同导出接口，eg: xxx/export/[type]；若无此参数，使用 gridName 代替
				'metricForward': '',	// 支持调整指标显示顺序；支持数组和字符串形式，eg: ['win_rate']
				'isSendMetrics': true,	// 不发送metrics参数；无指标返回或者指标统一返回，不需返回指定值；缺省是发指标的
				'isCheckRight': true,	// 是否要检测指标权限，缺省为"true"

				'header_modules': [
					// {
					// 	'name': '', // 模块名称
					// 	'uri': '', // 模块路径
					// 	'config': {}, // 模块配置
					// 	'html': '<div><i class=""/></div>', // 可选html或模块
					// 	'class': '',
					// 	'css': {},
					// 	'op': '', // 操作标识
					// 	'fireEvent': '' // 广播名称，默认为onGridHeaderCustom
					// }
				],	// 头部功能栏可配置

				'style': {
					'selected': 'M-HighGridListRowSelected',	// 选中样式
					'highlight': 'M-HighGridListRowHighlight'	// 高亮样式
				},

				'highlight_time': 180,  // 保存成功后记录的高亮时间, 单位：秒

				'sortName': pubjs.config('grid/sortName')||'sort',			// 排序的字段名命名，默认是叫"sort", 有些项目是叫"order"，在config中读取
				'toggleColumns': [], // 该数组的列可以被隐藏或者显示
				'initColumnsState': 'hide' // 控制指定列默认是显示还是隐藏('show', 'hide')
			});

			this.$data = config.get('data');

			this.$sort = config.get('param/'+config.get('sortName')) || '';	// 排序，impressions|-1

			this.$selects = [];
			this.$highlights = [];
			config.set('highlight_time', config.get('highlight_time') * 1000);

			this.$allMetrics = []; // 列表拥有的所有指标

			// 如果使用userStorageDate，使用storage的时间，否则使用当天的时间戳，配合date控件使用
			if(config.get('userStorageDate')){
				this.$sysParam = pubjs.getDate();
			}else{
				this.$sysParam = pubjs.getTodayDate();
			}
							// 系统参数
			this.$customParam = config.get('param') ? config.get('param') : {};	// 自定义参数

			this.$gridListWidth = 0; // 窗口宽度
			this.$gridListHeight = 0; // 窗口高度

			// 记录有扩大缩小列的原宽度
			var originalExpandWidth = {};
			util.each(config.get('cols'), function(item){
				if(item){
					if(item.expand){
						originalExpandWidth[item.name] = item.width;
					}
				}
			});
			this.$originalExpandWidth = originalExpandWidth;

			// 初始化 tab 参数配置
			this.initTabConfig(config);

			// 初始化 metrics 参数配置
			this.initMetricsConfig(config);

			// 更新指标权限
			this.updateMetricRights(config);

			// 过滤指标组
			this.filterMetricsConfig(config);

			//this.updateMetricCols();

			// 过滤子表格的权限点
			this.filterSubs(config);

			this.Super('init', arguments);
		},
		filterSubs: function(config) {
			if(config.get('hasSubGrid')) {
				var subs = config.get('subs') || [];
				for(var i = subs.length -1; i >= 0; i--) {
					var sub = subs[i];
					var c;
					if (util.isString(sub)){
						var nameAsGrid = 'grid_' + sub;
						c = labels.get(nameAsGrid);
						if(!c || (c.right && !pubjs.checkRight(c.right))) {
							subs.splice(i, 1);
						}
					}
				}

				if(!subs || !subs.length) {
					config.set('hasSubGrid', false);
				}
			}
		},
		updateMetricCols: function(field) {
			var c = this.getConfig();
			var allMetrics = pubjs.config('allMetrics');
			// 没有指标权限的配置, 直接跳过.
			if(!allMetrics) {
				return false;
			}
			var ownMetrics = pubjs.config('ownMetrics');
			var metric;
			if(util.isString(field)) {
				field = [field];
			}
			util.each(field || ['cols', 'metrics'], function(field) {
				if(c[field] && c[field].length) {
					for(var i = c[field].length - 1; i >= 0; i--) {
						metric = c[field][i];
						metric = util.isString(metric) ? metric : (metric.name || metric.Name || metric.field);
						// 是指标并且用户不拥有该指标,去掉.
						if(allMetrics.indexOf(metric) !== -1 && ownMetrics.indexOf(metric) === -1) {
							c[field].splice(i, 1);
						}
					}
				}
			});
		},
		// 指标权限-根据后端返回的指标来过滤，在labels.js中
		updateMetricRights: function(config){
			var self = this;
			var i;
			var cache = [];
			var c = config.get();

			if(!c.isCheckRight){
				return;
			}

			// 更新 tab 参数
			var tab = c.tab;
			if(util.isEmptyObject(tab)){
				// tab配置为空对象时，自动加入默认列
				tab.default_metrics = {'text': LANG('默认'), 'cols': c.default_metrics};
			}

			var cols;
			for(var e in tab){
				if(tab[e]){
					cols = tab[e].cols;
					cache = [];
					for (i = 0; i < cols.length; i++) {
						// 如果是对象，不做权限检查
						if(util.isObject(cols[i])){
							cache.push(cols[i]);
							self.$allMetrics.push(cols[i]);
						}
						if(labels.has(cols[i])){
							cache.push(cols[i]);
							self.$allMetrics.push(cols[i]);
						}
					}
					tab[e].cols = cache;
				}
			}
			config.set('tab', tab);

			// 更新 default_metrics 参数
			var metrics = c.default_metrics;
			cache = [];
			for (i = 0; i < metrics.length; i++) {
				if (util.isString(metrics[i])) {
					var abbr = metrics[i].match(/{(.+)}/)
					if(abbr){
						var tabCfg = tab[abbr[1]];
						if(tabCfg && util.isArray(tabCfg.cols)){
							cache = cache.concat(tabCfg.cols);
							continue;
						}
					}
				}

				if(labels.has(metrics[i])){
					cache.push(metrics[i]);
				}
			}
			config.set('default_metrics', cache);
		},
		// 初始化tab参数配置
		initTabConfig: function(config){
			var c = config.get();
			// 自定义tab组
			var customValue = c.tab;
			// 默认tab组
			var defaultValue = null;
			if(c.includeDefaultGroup){
				defaultValue = util.clone(pubjs.config('defaultGroup'));
			}else{
				defaultValue = {};
			}

			// 结果集
			var tab = {};
			// 自定义tab的key数组
			var keys = [];

			// 处理自定义tab配置，null的情况不推入keys数组
			if(util.isObject(customValue)){
				for(var i in customValue){
					switch (customValue[i]){
						case null:
							defaultValue[i] = null;
							break;
						case true:
							keys.push(i);
							break;
						case false:
							keys.push(i);
							break;
						default:
							if(util.isObject(customValue[i])){
								defaultValue[i] = customValue[i];
							}
							keys.push(i);
					}
				}
			}

			util.each(defaultValue, function(item, idx){
				// 如果有自定义keys数组，只复制keys中字段的值到tab中
				if(keys.length){
					util.each(keys, function(key){
						if(key == idx){
							if(item){
								tab[key] = item;
							}
						}
					});
				}else{
				// 没有keys数组时，不是null就复制到tab中
					if(item){
						tab[idx] = item;
					}
				}
			});

			config.set('tab', tab);
		},
		// 初始化 metrics 参数配置
		initMetricsConfig: function(config){
			// 若无metrics 参数，则以tab参数("tab/组名/cols")下的并集作为默认值
			var c = config.get();
			if(c.hasTab && (!c.metrics || !c.metrics.length)){
				var metrics = [];
				var tab = c.tab;
				for (var e in tab) {
					if(tab[e]){
						metrics = metrics.concat(tab[e].cols);
					}
				}
				config.set('metrics', metrics);
				this.$AllMetrics = metrics;
			}
		},
		// 过滤默认指标（默认指标可能与tab组不对应，所以需要过滤掉tab组没有的默认指标）
		filterMetricsConfig: function(config){
			var self = this;
			var c = config.get();
			var default_metrics = c.default_metrics || [];
			var allMetrics = self.$allMetrics;
			var newMetrics = []; // 过滤后的新默认指标

			// allMetrics和default_metrics取交集
			if(allMetrics.length){
				util.each(allMetrics, function(item){
					util.each(default_metrics, function(metric){
						if(item == metric){
							newMetrics.push(metric);
						}
					});
				});
			}

			// 重新设置默认指标
			config.set('default_metrics', newMetrics);
		},
		// 过滤本地localstorage存储的指标，符合权限点有的
		filterCustomMetrics: function(custom){
			var res = [];

			if(custom){
				custom = custom.split(',');
			}

			if(this.$AllMetrics){

				var all = {};
				util.each(this.$AllMetrics, function(item){
					if(util.isObject(item)){
						all[item.name] = 1;
					}else{
						all[item] = 1;
					}
				});

				util.each(custom, function(item){
					if(item && all[item]){
						res.push(item);
					}
				});
			}
			return res;
		},
		// 解析子表格的Condition配置，用于子表格过滤指标组
		parseSubsCondition: function(config){
			var c = config.get();
			var ret = [];
			var param = c.param;
			var condition = '';

			if(param && param.condition){
				// 先解析字符串
				condition = JSON.parse(param.condition);
				util.each(condition, function(item, idx){
					if(item && util.isObject(item)){
						for(var i in item){
							var key = i;
							if(key){
								if (key.slice(-3) === '_id'){
									ret.push(key.slice(0,-3));
								}else {
									ret.push(key);
								}
							}
						}
					}
				});
			}
			// 返回condition的key数组
			return ret;
		},
		/** ---------------- 创建 ---------------- **/
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			self.$gridName = c.gridName || c.subName || '';	// 列表名字，用于storage记录
			self.$isCurrentFixedHeight = false; // 固定高度状态标记

			$([
				'<div class="M-HighGridDateRange"></div>',
				'<div class="M-HighGridSubgrid"></div>',
				'<div class="M-HighGridSubgridCtrl"></div>',
				'<div class="M-HighGridFilterSidebar"></div>',
				'<div class="M-HighGridFilterResult clear"></div>',
				'<div class="M-HighGridHeader">',
					'<div class="M-HighGridHeaderLeft"></div>',
					'<div class="M-HighGridHeaderCustom"></div>',
					'<div class="M-HighGridHeaderRight"></div>',
				'</div>',
				'<div class="M-HighGridList cl">',
				'</div>',
				'<div class="M-HighGridPager pt20 pb0 tr cl"></div>',
				'<div class="M-HighGridLoading">',
					'<i class="uk-icon-spinner uk-icon-spin">',
				'</div>'
			].join('')).appendTo(el);

			var doms = self.$doms = {
				dateRange: el.find('.M-HighGridDateRange'),
				filterResult: el.find('.M-HighGridFilterResult'),
				filterSidebar: el.find('.M-HighGridFilterSidebar'),
				header: el.find('.M-HighGridHeader'),
				headerLeft: el.find('.M-HighGridHeaderLeft'),
				headerRight: el.find('.M-HighGridHeaderRight'),
				pager: el.find('.M-HighGridPager'),
				gridList: el.find('.M-HighGridList')
			}

			self.$loading = el.find('.M-HighGridLoading').hide();


			// 有记录锁定列，模拟点击
			if(self.$gridName){
				self.$isCurrentFixedHeight = !!JSON.parse(pubjs.storage(self.$gridName+'_isCurrentFixedHeight'));
			}


			// 搜索控件
			if(c.hasSearch){
				self.create('search', Search, {
					'target': doms.headerLeft,
					'hasWordsSearch': c.hasWordsSearch
				});
			}

			// 清除已选按钮
			if(c.hasBatch){
				doms.selectedCount = $('<button class="btn btn-sm btn-default fl M-HighGridSelectedCount">').text(LANG('已选0个')).appendTo(doms.pager);
				self.uiBind(doms.selectedCount, 'click', 'eventEmptySelected');
			}

			// 默认构建筛选栏，hasFilter控制是否显示按钮
			// if(c.hasFilter){
				self.create('filter', Filter, {
					'target': doms.headerLeft,
					'hasFilterButton': c.hasFilter,
					'hasFilterResult': c.hasFilterResult,
					'hasFilterSidebar': c.hasFilterSidebar,
					'target_filterSidebar': doms.filterSidebar,
					'target_result': doms.filterResult,
					'parentTarget': el,
					'filterAutoFire': c.filterAutoFire,
					'sidebar_config': c.sidebar_config
				});
			// }


			// 批量操作
			if(c.hasBatch){
				self.create('batch', Batch, {
					'target': doms.headerLeft,
					'grid': self
				});
			}

			// 刷新控件
			if (c.hasRefresh){
				self.create('refresh', Refresh, {
					'target': doms.headerLeft,
					'hasAuto': c.hasAutoRefresh,
					'refreshTime': c.refreshTime,
					'refreshAuto': c.refreshAuto
				});
				self.toggleRefreshDisable(self.$sysParam);
			}
			// 自定义控件
			if(c.customControl){
				c.customControl.call(self, el.find('.M-HighGridHeaderCustom'));
			}

			// 导出控件
			if (c.hasExport){
				self.createAsync(
					'excel', '@base/highGrid.excelExport',
					util.extend(c.excelExport, {'target': doms.headerLeft})
				);
			}

			// 隐藏指定列事件
			if (c.toggleColumns.length) {
				self.create('toggleColumns', ToggleColumns, {
					'target': doms.headerLeft,
					'defaultState': c.initColumnsState
				});
			}

			// 切换对比栏
			if (c.hasCompare){
				self.create('compare', Compare, {
					'target': doms.headerLeft,
					'grid': self
				});
			}

			// 构建自定义header功能键
			if(c.header_modules && c.header_modules.length){
				util.each(c.header_modules, function(mod, idx){
					if(mod){
						if(mod.uri){
							self.createDelay(mod.name, mod.uri,
								util.extend(
									{},
									mod.config,
									{'target': doms.headerLeft}
								)
							);
						}
						if(mod.html){
							var html = $(mod.html).appendTo(doms.headerLeft);
							if(mod.css){
								html.css('float', 'left');
								html.css(mod.css);
							}
							if(mod.class){
								html.addClass(mod.class);
							}
							self.uiBind(html, 'click', {
								'name': mod.name,
								'op': mod.op || '',
								'fireEvent': mod.fireEvent
							}, 'eventHeaderCustomClick');
						}
					}
				});
			}


			// 指标分组
			if(c.hasTab){
				var customTabMetricsStorageName = 'customTabMetrics/'+pubjs.getTwoUserId()+'_'+c.gridName+c.gridNameSuffix;
				self.create('tab', Tab, {
					'tab': c.tab,
					'metrics': self.updateMetricsOrder(c.metrics),
					'gridName': c.gridName,
					'gridNameSuffix': c.gridNameSuffix,
					'default_metrics': c.default_metrics,
					'customTabMetricsStorageName': customTabMetricsStorageName,
					'target': doms.headerRight
				});

				// 更新指标分组配置
				var custom = pubjs.storage(customTabMetricsStorageName);

				// 自定义的也要过滤一下
				if(custom){
					custom = self.filterCustomMetrics(custom);
				}
				self.setConfig('metrics', custom && custom.length ? custom : self.getMetrics());
			}

			// 保证有metrics列，为了布局稳定
			if(c.cols.length && !c.metrics.length){
				c.metrics.push(c.cols.pop());
			}

			// 构建固定高度按钮
			if(c.hasFixedHeightBtn){
				var title = self.getFixedHeightTips();
				var fixedHeightBtn = $('<div class="M-HighGridFixedHeightBtn fr btn btn-sm btn-default" title="'+title+'"><em class="uk-icon-header"><em/></div>').appendTo(doms.pager);
				fixedHeightBtn.toggleClass('act', self.$isCurrentFixedHeight);
				self.uiBind(fixedHeightBtn, 'click', 'eventFixedHeight');
			}

			// 分页模块
			if(c.hasPager && c.url){
				self.create(
					'pager',
					common.pager,
					util.extend(c.pager, {
						'target': doms.pager,
						'addClass':c.hasFixedHeightBtn ? 'fr' : ''
					})
				);

			}

			if(c.hasDateRange){
				self.create(
					'dateRange',
					dateRange.dateRangeNew,
					util.extend(c.dateRange, {
						'target': doms.dateRange.show(),
						'pos': 'bR'
					})
				);
			}

			self.updateMetricCols();


			if (c.auto_load && c.url) {
				// 如果当前模块是隐藏状态，放入队列，等显示时候再加载数据 --eg:选项卡情况
				pubjs.checkDisplay(self, 'highgrid', self.load.bind(self));
			} else{
				self.buildTable(); // 开始构建表格
			}

			// 定时更新宽度
			// self.$WidthWatchId = setInterval(function(){

				// 表格高度改变的时候
				// if(self.$gridListHeight != doms.gridList.height()){
				// 	console.log($('.M-HighGridListHeader').width());
				// 	// 定时更新宽度
				// 	self.calculateWidth();
				// 	// 更新高度值
				// 	self.$gridListHeight = doms.gridList.height();

				// }
				// 表格宽度改变的时候
				// if(self.$gridListWidth != doms.gridList.width() && doms.gridList.is(':visible')){
				// 	// 定时更新宽度
				// 	self.calculateWidth();
				// 	// 更新宽度值
				// 	self.$gridListWidth = doms.gridList.width();
				// }
			// }, 50);
		},
		buildTable: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			var data = self.$data;
			var doms = self.$doms;
			var hasMetrics = c.metrics && c.metrics.length;

			var layout = $([
				'<div class="M-HighGridListLayoutLeft '+(hasMetrics?'fl':'')+'">',
					'<div class="M-HighGridListCorner"></div>',
					'<div class="M-HighGridListSidebar"></div>',
				'</div>',
				'<div class="M-HighGridListLayoutRight">',
					'<div class="M-HighGridListHeader"></div>',
					'<div class="M-HighGridListContent"></div>',
				'</div>'
			].join('')).appendTo(doms.gridList);

			doms.layoutLeft = layout.filter('.M-HighGridListLayoutLeft');
			doms.layoutRight = layout.filter('.M-HighGridListLayoutRight');
			doms.corner = layout.find('.M-HighGridListCorner');
			doms.header = layout.find('.M-HighGridListHeader');
			doms.sidebar = layout.find('.M-HighGridListSidebar');
			doms.content = layout.find('.M-HighGridListContent');

			self.buildTableCorner().appendTo(doms.corner);
			self.buildTableHeader().appendTo(doms.header);
			self.buildTableSidebar().appendTo(doms.sidebar);
			self.buildTableContent().appendTo(doms.content);


			// cols列的，垂直
			self.create('scrollerSV', Scroller, {
				'dir': 'V',
				'pad': false,
				'target': doms.sidebar,
				'content':  doms.sidebar.find('table'),
				'watch': 200,
				'addClass': hasMetrics ? 'M-HighGridSidebarScroller' : ''
			});
			// 水平
			self.create('scrollerSH', Scroller, {
				'dir': 'H',
				'pad': false,
				'wheel': 'shift',
				'watch': 200,
				'target': doms.sidebar.css({'min-width': 200, 'min-height': 200}),
				'content':  doms.sidebar.find('table')
			});


			if(util.isMobile()){
				doms.content.css({
					'overflow': 'auto'
				});
			}else{
				// 指标列的，垂直
				self.create('scrollerV', Scroller, {
					'dir': 'V',
					'pad': false, // 取消滚动条间隔，使之浮在内容的上面
					'wheel': 'noshift',
					'watch': 200,
					'target': doms.content,
					'content':  doms.content.find('table')
				});
				// 水平
				self.create('scrollerH', Scroller, {
					'dir': 'H',
					'pad': false,
					'wheel': 'shift',
					'watch': 200,
					'target': doms.content.css({'min-width': 200, 'min-height': 200}),
					'content':  doms.content.find('table')
				});
			}



			// 设置分页
			if(self.$.pager){
				self.$.pager.setup({
					'total': (data && data.total || 0),
					'size': (data && data.size || undefined),
					'page': (data && data.page || undefined)
				})
			}

			// 绑定行hover样式
			self.uiProxy(el, 'tr', 'mouseenter mouseleave', 'eventListRowHover');

			// 绑定点击触发排序事件
			self.uiBind(el.find('.sortable'), 'click', 'eventSort');

			self.uiProxy(el.find('td'), '>.lock', 'click', 'eventFixedLock');
			self.uiProxy(doms.corner, 'td', 'mouseenter mouseleave', 'eventHoverLock');
			self.uiProxy(doms.header, 'td', 'mouseenter mouseleave', 'eventHoverLock');
			self.uiProxy(el.find('td>.expand'), '>div', 'click', 'eventExpandCol');

			// 拖拽初始化
			pubjs.drag(doms.content, self.eventDrag, self);

			// 计算表格宽高
			self.calculate();

            //在完成单元格添加到dom后
			if(self.afterCalculateTable && util.isFunc(self.afterCalculateTable)){
				self.afterCalculateTable(
					{cols:c.cols,trs:doms.sidebar.find('tr')},
					{metrics:c.metrics,trs:doms.content.find('tr')},
					{amount:c.metrics,trs:doms.header.find('tr.M-HighGridListHeaderAmount')});
			}

            // 定时检查移动端是否滚动了
			if(util.isMobile()){
				clearInterval(self.$MobileScrollId);
				self.$MobileScrollId = setInterval(function(){
					doms.sidebar.scrollTop(doms.content.scrollTop());
					doms.header.scrollLeft(doms.content.scrollLeft());
				}, 10);
			}

			// 有记录锁定列，模拟点击
			if(self.$gridName){
				var currentLock = pubjs.storage(self.$gridName+'_currentLock');
				if(currentLock){
					var cols = c.cols;
					var len = cols.length;
					if(cols && len && cols[len-1]){
						if(currentLock != cols[len-1].name){
							self.eventFixedLock(null, doms.corner.find('[data-name="'+currentLock+'"]').find('>.lock'));
						}
					}
				}
			}
		},
		buildTableCorner: function(){
			var self = this;
			var c = self.getConfig()
			var cols = c.cols;

			// 自动根据hasSelect参数插入选择列
			// 如果已有自定义的select，则不会重复添加
			var select = util.find(c.cols, 'select', 'type');
			if(c.hasSelect && !select){
				select = {'type':'select', 'name':'sel'};
				cols.unshift(select);
			}
			if(select && !select.width){
				select.width = 20;
			}

			// 自动根据hasMenu参数插入操作列
			// 如果已有自定义的op，则不会重复添加
			var menu = util.find(c.cols, 'op', 'type');
			if(c.hasMenu && !menu){
				menu = {'type':'op', 'name':'op'}
				cols.unshift(menu);
			}
			if(menu && !menu.width){
				menu.width = 30;
			}

			var dom = $([
				'<table cellspacing="0" cellpadding="0">',
					'<thead>',
						'<tr class="M-HighGridListCornerTitle"></tr>',
						'<tr class="M-HighGridListCornerAmount">',
							(c.hasAmount && c.metrics && c.metrics.length) ? '<td colspan="'+cols.length+'">'+LANG('汇总')+'</td>' : '',
						'</tr>',
					'</thead>',
				'</table>'
			].join(''));

			if(c.hasAmountSubGrid)
			{
				var amountTd = dom.find('td');
				var add = $([
					'<a class="M-HighGridSubgridCtrlAnchor isAmount">',
						'<i class="icon-add isAmount"/>',
					'</a>'
				].join('')).appendTo(amountTd.css({
					'position': 'relative'
				}));

				self.uiBind(add, 'click', 'eventShowSubgrid');
			}

			var td = []; // td组

			util.each(cols, function(item, idx){
				if(item){
					var html;
					var el;
					item = self.addColConfig(item);

					// 选择列
					if(item.type == 'select'){
						html = [
							'<label class="M-HighGridListCustomCheckbox">',
								'<i class="custom-checkbox">',
									'<i class="icon-checkbox-in"/>',
								'</i>',
								'<input type="checkbox" style="vertical-align: 0px;"/>',
							'</label>'
						].join('');
					}

					// 序号列
					if(item.type == 'id'){
						item.text = item.text || LANG('序号');
					}

					el = self.buildTd({
						'text': item.text,
						'html': html,
						'width': item.isRenderWidth ? 'auto' : item.width,
						// 'min-width': item['min-width'],
						'sort': item.sort || false,
						'name': item.field || item.name,
						'alias': item.alias || null,
						'expand': item.expand || false // 扩大列
					}, 'fixLock')
					td.push(el);
				}
			});

			dom.find('.M-HighGridListCornerTitle').append(td);
			// 绑定全选框事件
			self.uiBind(dom.find('input[type="checkbox"]'), 'click', 'eventSelectAll');
			self.uiBind(dom.find('td[data-name="sel"]'), 'click', 'eventSelectAll');
			dom.find('td[data-name="sel"]').addClass('cur_p')
				.find('.cell').addClass('cur_p')
				.find('label').addClass('cur_p');
			return dom;
		},
		buildTableHeader: function(){
			var self = this;
			var c = self.getConfig();
			var metrics = self.updateMetricsOrder(c.metrics);
			var data = self.$data && self.$data.amount || null;

			var html = $([
				'<table cellspacing="0" cellpadding="0">',
					'<tbody>',
						'<tr class="M-HighGridListHeaderTitle"></tr>',
						'<tr class="M-HighGridListHeaderAmount"></tr>',
					'</tbody>',
				'</table>'
			].join(''));

			var title = [];
			var amount = [];

			util.each(metrics, function(metric, idx){
				if(metric){
					var name;
					if(util.isString(metric)){
						// 从 tab 参数中读取配置
						metric = self.getMetricFromTab(metric);
						// 支持从labels.js中读取配置
						if(util.isString(metric)){
							name = metric; // 保存指标名
							metric = labels.get(metric);
							metric.name = name;
							// 只是给字符串的情况，不写sort的，默认是可排序的
							if(!metric.hasOwnProperty('sort')){
								metric.sort = true;
							}
						}
					}
					// 渲染函数
					var render = metric.headerRender;
					var renderedValue;
					if(render){
						if (util.isFunc(render)) {
							renderedValue = render(idx, metric.text, metrics[idx], metric);
						}
						if(util.isString(render)&& util.isFunc(self[render])){
							renderedValue = self[render](idx, metric.text, metrics[idx], data);
						}
					}

					var elTitle = self.buildTd({
						'text': LANG(metric.text) || '-',
						'sort': metric.sort || false,
						'name': metric.name,
						'alias': metric.alias || null,
						'html': renderedValue || '',
						'width': metric.width,
						// 'min-width': metric['min-width'],
						'metricTip': LANG(metric.desc) || '',
						'expand': metric.expand || false // 扩大列
					}, 'fixLock');
					title.push(elTitle);

					// 总计模块
					if(c.hasAmount){
						var value;
						var elAmount;
						// 有数据
						if(data){

							// 格式化数值
							if(util.isString(metric)){

								metric = self.getMetricFromTab(metric);
								// 从tab参数中读取配置
								if( !util.isString(metric)){
									value = data[metric.name];
								}else{
									// 从 labels.js中读取配置
									value = data[metric];
									metric = labels.get(metric);
								}
							}else{
								value = data[metric.name];
							}

							var method;
							if(metric.render && value !== undefined) {
								method = _formatCol.call(self, metric.render);
								value = method.call(self, null, value, data, metric);
							}

							// 格式化函数
							if(metric.format && value !== undefined) {
								method = _formatCol.call(self, metric.format);
								value = method.call(self, value, data, metric);
							}

							elAmount = self.buildTd({
								'text': value || '-',
								'name': metric.name
							});

						}else{
							// 无数据
							elAmount = '<td>-</td>';
						}
						amount.push(elAmount);
					}
				}
			});

			html.find('.M-HighGridListHeaderTitle').append(title);
			html.find('.M-HighGridListHeaderAmount').append(amount);

			self.uiProxy(html, 'i[data-desc]', 'mouseenter mouseleave', 'eventMetricTips');

			return html;
		},
		buildTableSidebar: function(){
			var self = this;
			var c = self.getConfig();
			var data = self.$data && self.$data.items || [];
			var cols = c.cols;

			var dom = $('<table cellspacing="0" cellpadding="0"/>');

			util.each(data, function(item, idx){
				if(item){
					var tr = self.buildTr({
						'dataIndex': idx,
						'dataId': item[c.key],
						'class': (idx%2!==0) ? 'M-HighGridListSidebarName' : 'M-HighGridListSidebarName even',
						'data': item
					});

					util.each(cols, function(col){
						if(col){
							col = self.addColConfig(col);
							var isIndexCol = col.type == 'index';
							var html;
							var className = '';
							var type;
							var title;
							var hasDataType;

							switch(col.type){
								case 'id':			// 序号列
									html = '<span>'+(idx+1)+'</span>';
									className += ' tc';
									hasDataType = true;
									break;
								case 'select':		// 选择列
									html = [
										'<label class="M-HighGridListCustomCheckbox">',
											'<i class="custom-checkbox">',
												'<i class="icon-checkbox-in"/>',
											'</i>',
											'<input type="checkbox" style="vertical-align: 0px;"/>',
										'</label>'
									].join('');
									className += ' tc';
									hasDataType = true;
									break;
								// @todo 换成hasMenu方式
								case 'op':			// 操作列
									className += ' tc';
									hasDataType = true;
									break;

								case 'index':		// 主列
									hasDataType = true;
									break;
								default:
									break;
							}

							var value = item[col.field || col.name];
							var method;
							var width;

							if(col.render){
								method = _formatCol.call(self, col.render);
								value = method.call(self, idx, value, item, col, tr);
							}

							// 格式化函数
							if(col.format) {
								method = _formatCol.call(self, col.format);
								value = method.call(self, value, item, col);
							}

							if(col.width){
								width = col.width;
							}

							if(col.align){
								className += ' '+ col.align;
							}

							// 子表格图标更加subToggle函数判断是否显示，返回true显示，false不构建；
							var subToggleMethod, subToggleValue;
							if(col.subToggle){
								subToggleMethod = _formatCol.call(self, col.subToggle);
								if(subToggleMethod){
									subToggleValue = subToggleMethod.call(self, idx, value, item, col, tr);
								}
							}

							if(isIndexCol){
								width = width || 180;
								className += ' '+ 'text-truncate tl';
								title = item[col.field || col.name];
								type = 'index';
							}

							var td = self.buildTd({
								'html': html || value,
								'type': type,
								'width': width,
								// 'min-width': col['min-width'],
								'title': title,
								'class': className,
								'tdClass': col.tdClass,
								'name': col.name,
								'alias': col.alias || null,
								//'text': value,
								'dataType': hasDataType ? col.type : null,
								'subToggle': String(subToggleValue) === 'undefined' ? true : subToggleValue
							});
							tr.append(td);
						}
					});

					dom.append(tr);
				}
			});

			// 绑定选择框事件
			self.uiProxy(dom, 'input[type="checkbox"]', 'click', 'eventCheckboxClick');
			self.uiProxy(dom, 'td[data-type="select"]', 'click', 'eventCheckboxClick');
			dom.find('td[data-type="select"]').addClass('cur_p')
				.find('.cell').addClass('cur_p')
				.find('label').addClass('cur_p');

			return dom;
		},
		buildTableContent: function(){
			var self = this;
			var data =  self.$data && self.$data.items || [];
			var c = self.getConfig();
			var metrics = self.updateMetricsOrder(c.metrics);
			var doms = self.$doms;

			var html = $('<table  cellspacing="0" cellpadding="0"/>');

			util.each(data, function(item, idx){
				if(item){
					var tr = self.buildTr({
						'dataIndex': idx,
						'dataId': item[c.key],
						'class': (idx===0 )? 'M-HighGridListContentFirstTr even': ((idx%2 === 0)?'even':''),
						'data': item
					});

					util.each(metrics, function(metric){
						var value;
						// 格式化数值
						if(util.isString(metric)){
							metric = self.getMetricFromTab(metric);
							// 从tab参数中读取配置
							if(!util.isString(metric)){
								value = item[metric.field||metric.name];
							}else{
								// 从 labels.js中读取配置
								value = item[metric];
								metric = labels.get(metric);
								// 修正
								if(metric.field && !value){
									value = item[metric.field];
								}
							}
						}else{
							value = item[metric.field||metric.name];
						}

						var method;
						if(metric.render){
							method = _formatCol.call(self, metric.render, 'render');
							if (util.isFunc(method)){
								value = method.call(self, idx, value, item, metric, tr);
							}
						}

						// 格式化函数
						if(metric.format) {
							method = _formatCol.call(self, metric.format);
							value = method.call(self, value, item, metric);
						}

						var td = self.buildTd({
							'html': value || '-',
							'class': metric.align || '',
							'tdClass': metric.tdClass,
							'name': metric.name,
							'alias': metric.alias || null,
							'width': metric.width,
							'min-width': metric['min-width']
						});
						tr.append(td);
					});

					html.append(tr);
				}
			});

			if(!data.length){
				doms.empty = $([
					'<tr class="M-HighGridListEmpty">',
						'<td>' + LANG('没有数据') + '</td>',
					'</tr>'
				].join(''));

				if(!metrics.length){
					doms.empty.appendTo(doms.sidebar.find('table'));
				}else{
					doms.empty.appendTo(html);
				}
			}

			return html;
		},
		buildTd: function(c, fixLock){
			var con, td;
			td = $('<td></td>');
			// 包囊多一层div，用来控制宽度，因为td设置宽度无效
			con = $('<div class="cell"/>').appendTo(td);

			if(c.type == 'index' && !c.html){
				con = $('<div class="fl"></div>').width( (c.width || 150) - 20).appendTo(td);
			}

			if(c['class']){
				con.addClass(c['class']);
			}

			if(c['tdClass']){
				td.addClass(c['tdClass']);
			}

			if(c.format){
				c.text = c.format(c.text);
			}

			if(c.text){
				con.append($('<span/>').text(c.text));
			}

			// 没有宽度的时候，设置默认为100%；
			if(c.width){
				// td.width(c.width);
				con.width(c.width);
			}else{
				con.width('100%');
			}

			if(c['min-width']){
				con.css('min-width', c['min-width']);
			}

			if(c.title){
				con.attr('title', c.title);
			}
			if(c.html){
				if(util.isInt64(c.html)) {
					c.html = String(c.html);
				}

				con.html(c.html);
			}
			if(c.dataType){
				td.attr('data-type', c.dataType);
			}

			if(c.type == 'index' && c.subToggle){
				if(this.getConfig('hasSubGrid')){
					var add = $([
						'<a class="M-HighGridSubgridCtrlAnchor">',
							'<i class="icon-add"/>',
						'</a>'
						].join('')).appendTo(con.css({
							'position': 'relative'
						}));
					this.uiBind(add, 'click', 'eventShowSubgrid');
				}
			}

			if(c.sort){
				td.addClass('cur_p sortable');
				con.append('<em/>').css('position', 'relative');
				var sort = this.$sort;
				// 多个order
				if(sort.search(/,/g) != -1){
					sort = sort.split(',');
					util.each(sort, function(item){
						var match = item.match(/(.+)\|(1|-1)/);
						if(match && c.name == match[1]){
							td.addClass((sort[2] == 1) ? 'asc':'desc');
						}
					});
				}else{
					// 单个order
					sort = sort.match(/(.+)\|(1|-1)/);
					if(sort && c.name == sort[1]){
						td.addClass((sort[2] == 1) ? 'asc':'desc');
					}
				}
			}

			if(c.name){
				td.attr('data-name', c.name);
			}
			if(c.alias){
				td.attr('data-alias', c.alias);
			}

			if(c.dataType == 'op'){
				this.create(Menu, {
					target: con.css('position', 'relative'),
					activeDom: con,
					parentTarget: this.getDOM(),
					anchor: con,
					grid: this
				});
			}
			if(c.metricTip){
				var desc = $([
					'<i  class="metricTip" data-desc="'+ c.metricTip +'"></i>'
				].join(''));
				con.css('position', 'relative').append(desc);

			}
			if(fixLock){
				$('<div class="lock uk-icon-lock"/>').appendTo(td).attr('title', LANG('固定列'));
			}

			if(c.expand){
				$([
					'<div class="expand">',
						'<div class="expand-short" title="'+LANG('缩小列')+'"><i class="triangle-right triangle-sm"/></div>',
						'<div class="expand-long" title="'+LANG('扩大列')+'"><i class="triangle-left triangle-sm"/></div>',
					'</div>'
				].join('')).appendTo(td);
			}

			return td;
		},
		buildTr: function(c){
			var self = this;
			var conf = self.getConfig();
			var tr = $('<tr></tr>');
			if(c.class){
				tr.addClass(c.class);
			}
			if(c.text){
				tr.text(c.text);
			}
			if(c.html){
				tr.html(c.html);
			}
			if(c.dataId !== undefined){
				tr.attr('data-id', c.dataId);
			}
			if(c.dataIndex !== undefined){
				tr.attr('data-index', c.dataIndex);
			}
			// 渲染title属性
			if(conf.hasTrTitle && util.isFunc(conf.renderTrTitle) && c.data){
				var title = conf.renderTrTitle.call(self, c.data, tr);
				if(title){
					tr.attr('title', title);
				}
			}
			return tr;
		},
		// 逐步扩大或缩小列
		eventExpandCol: function(evt, elm){
			// cols可增加配置
			// expand: true, // 是否可扩大
			// expandStep: 100, // 步幅
			// expandDefault: 60 // 最短宽度
			// expandDiff: 40 // 文字与td宽度的差值

			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;
			var cell = $(elm).parent().siblings('.cell');
			var name = cell.parent().attr('data-name');
			var alias = cell.parent().attr('data-alias');

			// 当前列配置
			var conf = util.find(c.cols, name, 'name');

			if(!conf && alias){
				conf = self.addColConfig(alias);
			}

			// 是否扩大
			var isLong = $(elm).hasClass('expand-long');
			var step = conf.expandStep || c.expandStep || 100; // 增值步幅，默认100，可配置
			step = isLong ? step : -step;

			var td = doms.sidebar.find('td[data-name="'+name+'"]');
			if(!td.length){
				td = doms.content.find('td[data-name="'+name+'"]');
			}

			if(td.length){
				var td_w = cell.width() + step;
				var text_w = td.find('.cell .text-truncate').width() + step;

				var min = conf.expandDefault || 60;

				$(elm).siblings().removeClass('is-disabled');


				if(td_w <= min){
					var isIndex = c.subs && c.subs.length && conf.type == 'index';
					td_w = min;
					text_w = td_w - ( conf.expandDiff || (isIndex ? 40 : 10) ); // 有子表格按钮的-40px

					$(elm).addClass('is-disabled');
				}

				// 更新整列宽度
				td.width(td_w).find('.cell').width(td_w).find('.text-truncate').width(text_w);
				cell.width(td_w).parent().width(td_w);

				if(conf){
					// 更改列配置宽度，用于记录宽度，对于用字符串方式配置的列，暂时没有记录功能；
					conf.width = td_w;
				}
			}

			self.calculateWidth();

			return false;
		},
		// 显示锁头事件
		eventHoverLock: function(evt, elm){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();
			var flag = true;
			var el = $(elm);

			// 没有锁的情况
			if(!el.find('>.lock').length){
				flag = false;
			}

			// td后边没有td的情况
			if(el.nextAll().length<1){
				flag = false;
			}

			// 没有右边滚动条的情况
			if(self.$.scrollerH){
				if(!self.$.scrollerH.getScrollMax()){
					flag = false;
				}
			}

			// 没有指标列的情况
			if(!c.metrics.length){
				flag = false;
			}

			// 超过滚动条的情况
			if(el.next().length){
				var next = el.next();
				if(doms.header.is(':visible')){
					if(util.offset(next, doms.header).left > doms.header.width()){
						flag = false;
					}
				}
			}


			if(el.hasClass('currentLock')){
				// 如果是当前锁，就显示解锁的图标
				el.removeClass('hoverLock');
				el.toggleClass('hoverCurrentLock', evt.type == 'mouseenter');
			}else{

				if(util.isMobile()){
					el.toggleClass('hoverLock', evt.type == 'mouseenter' && flag);
				}else{
					clearTimeout(self.$lockTimeout);
					if(evt.type == 'mouseenter' && flag){
						// pc端延时600毫秒才显示锁图标；
						self.$lockTimeout = setTimeout(function(){
							el.addClass('hoverLock');
						}, 600);
					}
					if(evt.type == 'mouseleave'){
						clearTimeout(self.$lockTimeout);
						el.removeClass('hoverLock');
					}
				}
			}

			return false;
		},
		// 固定事件
		eventFixedLock: function(evt, elm){
			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;

			if($(elm).parent().hasClass('currentLock')){
				return false;
			}

			// 移除样式和unlock
			doms.gridList.find('.currentLock').removeClass('currentLock').find('.unlock').remove();
			var td = $(elm).parent().addClass('currentLock');
			// 插入新的unlock和绑定事件
			$('<div class="unlock uk-icon-unlock"/>').appendTo(td).click(function(ev){
				// 清空样式和记录，重新加载列表
				td.removeClass('currentLock hoverCurrentLock');
				pubjs.storage(self.$gridName+'_currentLock', '');
				self.reload();
				return false;
			});

			// 记录锁定的列
			if(self.$gridName){
				pubjs.storage(self.$gridName+'_currentLock', td.attr('data-name'));
			}

			var tds = '';

			var corner = doms.corner;
			var cornerTitle = corner.find('tr:first');
			var cornerAmount = corner.find('tr:last');
			var header = doms.header;
			var headerTitle = header.find('tr:first');
			var headerAmount = header.find('tr:last');

			var sidebarTr = doms.sidebar.find('tr');
			var contentTr = doms.content.find('tr');

			// 如果当前列是最后一列，就不需要锁
			// 点击左边需要锁定的列，它后边的列都要移到右边
			// 点击右边需要锁定的列，它前边的列（包括自己）都要移到左边


			// 需要判断在什么位置；
			if(td.parent('.M-HighGridListHeaderTitle').length){
				// 点击在右边表

				// 加入自身
				tds = td.prevAll().andSelf();
				// 插入到左边title
				tds.appendTo(cornerTitle);

				// 插入对应的内容列
				$.each(tds, function(idx, td){
					var name = $(td).attr('data-name');
					var tmp_td = headerAmount.find('td[data-name='+name+']');
					var align = tmp_td.css('text-align');

					// 如果是空的td就移除，否则就移动
					if(tmp_td.hasClass('empty')){
						tmp_td.remove();
					}else{
						tmp_td.appendTo(cornerAmount).css('text-align', align);
					}

					$.each(contentTr, function(i, item){
						$(item).find('td[data-name='+name+']').appendTo(sidebarTr.eq(i));
					});
				});
			}else{
				// 点击在左边表
				tds = td.nextAll();
				tds.prependTo(headerTitle);

				// 要反向
				$.each(tds.toArray().reverse(), function(idx, td){
					var name = $(td).attr('data-name');
					var isHide = $(td).is(':hidden');
					var tmp_td = cornerAmount.find('td[data-name='+name+']');
					if(tmp_td.length){
						tmp_td.prependTo(headerAmount);
					}else{
						// 有总计模块的时候
						if(c.hasAmount){
							var empty = $('<td data-name='+name+' class="empty" data-hide="'+isHide+'">').prependTo(headerAmount);
							empty[isHide ? 'hide': 'show']();
						}
					}

					for(var i = sidebarTr.length - 1; i > -1; i--){
						sidebarTr.eq(i).find('td[data-name='+name+']').prependTo(contentTr.eq(i));
					}

				});

				headerAmount.find('.empty:last').css('border-right', '1px solid #ECECEC');

			}

			// 有发生过toggleColumn, 重新计算colspan
			if(self.$happenToggleColumn){
				self.updateColspan();
			}

			// 重新计算宽度
			self.calculateWidth();
			self.calculate();

			return false;
		},
		// 固定高度
		eventFixedHeight: function(evt, elm){
			var self = this;
			// var c = self.getConfig();
			var doms = self.$doms;
			$(elm).toggleClass('act');
			if($(elm).hasClass('act')){
				doms.sidebar.height(self.$gridHeight);
				doms.content.height(self.$gridHeight);
				self.updateScroller({
					'w': self.$w_collection,
					'h': self.$h_collection
				});
				self.$isCurrentFixedHeight = true;
			}else{
				doms.sidebar.height('auto');
				doms.content.height('auto');
				self.updateScroller();
				self.$isCurrentFixedHeight = false;
			}
			// 记录锁定的列
			if(self.$gridName){
				pubjs.storage(self.$gridName+'_isCurrentFixedHeight', self.$isCurrentFixedHeight);
			}

			$(elm).attr('title', self.getFixedHeightTips());

			self.calculateWidth();
		},
		// 更新锁定列表高度提示title
		getFixedHeightTips: function(){
			return this.$isCurrentFixedHeight ? LANG('解锁列表高度') : LANG('缩小列表高度');
		},
		// 头部功能键默认自定义点击
		eventHeaderCustomClick: function(evt, elm){
			var self = this;
			var data = evt.data;
			var gridData = self.getData();
			var gridParam = self.getParam(true);
			data.gridData = util.clone(gridData);
			data.gridParam = util.clone(gridParam);
			self.fire(data.fireEvent || 'GridHeaderCustom', data);
			return false;
		},
		// 扩展默认列属性
		addColConfig: function(col){
			if (util.isString(col)){
				col = {'alias': col, 'name': col};
			}
			col = $.extend(
				{
					type: 'col',	// 列类型: col, id, index, select
					name: null,
					field: null,
					text: null,
					align: null,
					width: 0,
					format: null,
					render: null,
					alias: col.alias
				},
				col,
				labels.get(col.alias, 'type_'+col.type)
			);

			if(!col.name){
				col.name = col.type;
			}

			return col;
		},
		// 更新滚动条
		updateScroller: function(collection){
			var mod = this.$ || {};
			if(mod.scrollerV){
				mod.scrollerV.update();
				if(collection){
					mod.scrollerV.updateStep(collection.h);
				}
			}
			if(mod.scrollerH){
				mod.scrollerH.update();
				if(collection){
					mod.scrollerH.updateStep(collection.w);
				}
				var left = mod.scrollerH.getScrollPos();
				this.$doms.layoutLeft.toggleClass('shadow', !!left);
			}
			if (mod.scrollerSV) {
				mod.scrollerSV.update();
				if(collection){
					mod.scrollerSV.updateStep(collection.h);
				}
			}
			if (mod.scrollerSH) {
				mod.scrollerSH.update();
				if(collection){
					mod.scrollerSH.updateStep(collection.w);
				}
			}
		},
		// 设置表格长宽
		calculate: function(isReset, isAnimate){
			var self = this;
			var doms = self.$doms;
			var el = self.getDOM();

			// 没有四个表格的情况，跳出
			if(!doms.corner){
				return;
			}
			// dom隐藏的情况下，跳出
			if(doms.corner.is(':hidden')){
				return;
			}

			var c = self.getConfig(),
				// wrap = c.target || el, // @优化todo
				data = self.$data || [];

			// 长度定义
			var datasLen = data.items && data.items.length || 0,
				metricsLen = c.metrics.length,
				colsLen = c.cols.length;

			// var gridList = doms.gridList;
			// 左边表格
			var layoutLeft = doms.layoutLeft;
			var corner = doms.corner;
			var sidebar = doms.sidebar;
			// 右边表格
			var layoutRight = doms.layoutRight;
			var header = doms.header;
			var content = doms.content;

			var i, max, tdT, tdB, trL, trR;

			// 没有指标列的时候，维度列为100%的宽，隐藏右边
			if(!metricsLen){
				layoutLeft.width('100%');
				layoutRight.hide();
			}
			// 没有维度列的时候，隐藏左边
			if(!colsLen){
				layoutLeft.hide();
			}

			var cornerTds = corner.find('td');
			var sidebarTds = sidebar.find('td');
			var headderTds = header.find('td');
			var contentTds = content.find('td');
			var cornerTrs = corner.find('tr');
			var headerTrs = header.find('tr');
			var sidebarTrs = sidebar.find('tr');
			var contentTrs = content.find('tr');
			var tdTCell;
			var tdBCell;
			var w_collection = self.$w_collection = []; // 宽度集合
			var h_collection = self.$h_collection = []; // 高度集合

			// 同步corner和sidebar的td宽度
			for (i = 0; i < colsLen; i++) {
				tdT = cornerTds.eq(i);
				tdB = sidebarTds.eq(i);
				tdTCell = tdT.find('.cell');
				tdBCell = tdB.find('.cell');
				max = Math.max(tdTCell.width(), tdBCell.width());
				tdT.width(max);
				tdB.width(max);
				tdTCell.width(max);
				tdBCell.width(max);
			}

			// 同步header和content的td宽度
			for (i = 0; i < metricsLen; i++) {
				tdT = headderTds.eq(i);
				tdB = contentTds.eq(i);
				tdTCell = tdT.find('.cell');
				tdBCell = tdB.find('.cell');
				if(tdT.is(':visible') && tdB.is(':visible')){
					max = Math.max(tdTCell.width(), tdBCell.width());
					tdT.width(max);
					tdB.width(max);
					tdTCell.width(max);
					tdBCell.width(max);
					w_collection.push(tdB.outerWidth());
				}
			}

			// 同步corner和header的tr高度
			for(i = 0; i < 2; i++){
				trL = cornerTrs.eq(i);
				trR = headerTrs.eq(i);
				max = Math.max(trL.height(), trR.height());
				trL.height(max);
				trR.height(max);
			}
			var h = 0;
			var disH = $(window).height() - doms.content.offset().top;
			self.$gridHeight = 0;

			// 同步sidebar和content的tr高度
			for (i = 0; i < datasLen; i++) {
				trL = sidebarTrs.eq(i);
				trR = contentTrs.eq(i);
				max = Math.max(trL.height(), trR.height());
				trL.height(max);
				trR.height(max);

				if(h > disH){
					self.$gridHeight = h - max*2;
				}else{
					h += max;
					self.$gridHeight = h;
				}
				h_collection.push(trR.outerHeight());
			}

			// 自动计算表格高度，适用于页面或当前在锁的状态
			if(c.autoCalHeight || self.$isCurrentFixedHeight){
				doms.sidebar.height(self.$gridHeight);
				doms.content.height(self.$gridHeight);
			}

			// 计算宽度
			self.calculateWidth();

			// 计算没有数据的位置
			if(doms.empty){
				var emptyTd =  doms.empty.find('td').prop('colspan', metricsLen || colsLen);
				if(!metricsLen){
					emptyTd.css({
						'padding-left': doms.layoutLeft.width()/2 - 28
					});
				}else{
					// 28是“没有数据”宽的一半
					emptyTd.css({
						'padding-left': el.width()/2 - doms.layoutLeft.width() - 28
					});
				}
			}

			// 重新计算滚动条, 记录集合数据
			self.updateScroller({
				'w': w_collection,
				'h': h_collection
			});
		},
		// 计算宽度
		calculateWidth: function(){
			var self = this;
			var doms = self.$doms;
			var el = self.getDOM();
			if(!doms){
				return;
			}
			if(el.is(':hidden')){
				return;
			}
			var gridList = doms.gridList;

			// 左边表格
			var layoutLeft = doms.layoutLeft;
			// var corner = doms.corner;
			var sidebar = doms.sidebar;
			// 右边表格
			var layoutRight = doms.layoutRight;
			var header = doms.header;
			var content = doms.content;

			if(gridList && layoutLeft){
				// 使用Math.floor保证不是正整数，使左右两边能够融合
				var width = Math.floor(el.width()) - Math.floor(layoutLeft.width()) -2;
				// 如果比例不是100%，直接减1，保证不会崩塌
				if(util.isWindowZoom() != 100){
					width = width - 1;
				}
				layoutRight.width(width);
				if(header){
					header.width(width).find('table').width(width);
				}
				if(content){
					content.width(width).find('table').width(width);
				}

				// 根据高度去设定表格最后一个行要不要底边
				var table = content.find('table');
				table.toggleClass('last-border-bottom-none', content.height()<=table.height());
				table = sidebar.find('table');
				table.toggleClass('last-border-bottom-none', sidebar.height()<=table.height());
			}

			// 重新计算遮罩的长宽
			self.updateScroller();
			return self;
		},
		// 计算高度
		calculateHeight: function(){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();

			if(self.$h_collection && self.$h_collection.length){
				var gridHeight = 0;
				var h = 0;
				var disH = $(window).height() - doms.content.offset().top;
				for(var i=0; i<self.$h_collection.length; i++){
					if(h > disH){
						gridHeight = h - self.$h_collection[i]*2;
					}else{
						h += self.$h_collection[i];
						gridHeight = h;
					}

				}

				if(c.autoCalHeight || self.$isCurrentFixedHeight){

					// 有变化时，更新列表高度
					if(gridHeight != self.$gridHeight){
						doms.sidebar.height(gridHeight);
						doms.content.height(gridHeight);
						self.$gridHeight = gridHeight;
					}

					self.updateScroller({
						'w': self.$w_collection,
						'h': self.$h_collection
					});
				}
			}

			return self;
		},
		enableChild: function(name) {
			if(this.$[name] && this.$[name].enable)
			{
				this.$[name].enable();
			}

			return this;
		},
		disableChild: function(name) {
			if(this.$[name] && this.$[name].disable)
			{
				this.$[name].disable();
			}

			return this;
		},
		/** ---------------- 数据 ---------------- **/
		setData: function(data){
			this.reset();
			this.$data = data;
			this.buildTable();
			this.setStyles();
			// 设置指定列的现隐
			this.initColumnsState();
		},
		getData: function(id){
			var self = this;
			var items = self.$data.items;
			var c = self.getConfig();
			if(id){
				if(util.isArray(id)){
					var result = [];
					util.each(id, function(i){
						var item = util.find(items, i, c.key);
						if(item){
							result.push(item);
						}
					});
					return result;
				}else{
					return util.find(items, id, c.key);
				}
			}
			return self.$data;
		},
		reset: function(){
			this.$gridListWidth = 0;
			this.$data = null;
			// 清除子实例
			var mod = this.$;
			if(mod){
				for(var i in mod){
					if(i.indexOf('child_') === 0){
						mod[i].destroy();
					}
				}

				if(mod.scrollerH){mod.scrollerH.destroy();}
				if(mod.scrollerV){mod.scrollerV.destroy();}
				if(mod.scrollerSV){mod.scrollerSV.destroy();}
				if(mod.scrollerSH){mod.scrollerSH.destroy();}
			}

			this.$el.find('.M-HighGridList').empty();
			this.$panelShowing = false;
			this.$happenToggleColumn = false;
			return this;
		},
		resetFilter: function(){
			if(this.get('filter')){
				this.get('filter').eventClearResult();
			}
			return this;
		},
		/**
		 * 设置选中数据
		 * @param {Object} selects: [], highlights: []
		 */
		setValue: function(value){
			// 更新选中/高亮值
			this.$selects = value && value.selects || [];
			this.$highlights = value && value.highlights || [];

			// 设置选中/高亮状态
			this.setStyles();
		},
		getValue: function(name){
			if(name){
				return this['$'+name] || '';
			}else{
				return {
					selects: this.$selects,
					highlights: this.$highlights
				}
			}
		},
		resetValue: function(){
			this.$selects = [];
			this.$highlights = [];
			this.resetStyles();
		},
		// 更新行样式
		setStyles: function(){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();

			if(!doms) {
				return false;
			}

			self.resetStyles();
			var sidebar = doms.sidebar;
			var content = doms.content;
			var style = c.style;

			util.each(self.$selects, function(item){
				var tr = sidebar.find('tr[data-id="'+item+'"]').addClass(style.selected);
				tr.find('input[type="checkbox"]').prop('checked', true).parent().addClass('change');
				content.find('tr[data-id="'+item+'"]').addClass(style.selected);
			});

			util.each(self.$highlights, function(item){
				sidebar.find('tr[data-id="'+item+'"]').addClass(style.highlight);
				content.find('tr[data-id="'+item+'"]').addClass(style.highlight);
			});

			var metrics = c.metrics;
			var data = self.$data && self.$data.items;
			if(metrics && metrics.length === 0 && data && data.length){

			}
		},
		// 清除行样式
		resetStyles: function(){
			var self = this;
			var c = self.getConfig();
			// 清除样式
			var style = c.style;
			var className = style.selected +' '+style.highlight;
			var doms = self.$doms;

			// 清除勾选
			if(doms.sidebar){
				var trLeft = doms.sidebar.find('tr');
				trLeft.removeClass(className);
				trLeft.find('input[type="checkbox"]').prop('checked', false).parent().removeClass('change');
			}
			if(doms.content){
				var trRight = doms.content.find('tr');
				trRight.removeClass(className);
			}
			if(doms.corner){
				doms.corner.find('tr input[type="checkbox"]').prop('checked', false);
			}
		},
		load: function(){
			// load的时候可计算一次宽度
			this.calculateWidth();
			var c = this.getConfig();
			if (!c.url){ return this; }

			// 若有分页模块，发送分页初始值参数
			if(c.hasPager){
				if(!this.$sysParam.limit){
					var pager = util.extend({
						page:1,
						size:20
					}, c.pager);

					util.extend(this.$sysParam, {
						page: pager.page,
						limit: pager.size
					});
				}
			}

			this.showLoading();

			// @todo, 如果是普通表格，不发指标参数
			// 发送指标参数
			if(!this.$sysParam.metrics && c.isSendMetrics){
				var metrics = this.getConfig('metrics');
				var sendMetrics = [];
				util.each(metrics, function(item){
					// 对象格式的参数值不发到后端
					if(item && !util.isObject(item)){
						sendMetrics.push(item);
					}
				});
				this.$sysParam.metrics = sendMetrics;
			}

			// 假如表格位子表格，有同步时间要求的，首次会同步父表格的时间
			if(c.syncDateParam){
				if(c.hasDateRange){
					if(this.$.dateRange){
						this.$.dateRange.setData({
							'begin': c.syncDateParam.begindate,
							'end': c.syncDateParam.enddate
						});
					}
				}
				util.extend(this.$sysParam, {
					begindate: null,
					enddate: null
				}, c.syncDateParam);
				// 更新为null，下次不再同步时间
				this.setConfig('syncDateParam', null);
			}

			var customParam = this.getParam();
			var param = util.extend({}, this.$sysParam, customParam);

			// 缓存指标的上次滚动位置
			this.$lastScollerHPos = 0;
			if (this.$ && this.$.scrollerH) {
				this.$lastScollerHPos = this.$.scrollerH.getScrollPos();
			}

			if (this.$reqID){
				if(c.reqType == 'ajax'){
					pubjs.data.abort(this.$reqID)
				}else{
					pubjs.mc.abort(this.$reqID, true)
				}
			}

			switch(c.reqType){
				case 'ajax':
					if(c.reqMethod == 'get'){
						this.$reqID = pubjs.data[c.reqMethod](c.url, param, this, 'onBeforeData');
					}else{
						this.$reqID = pubjs.data[c.reqMethod](c.url, customParam, this.$sysParam, this, 'onBeforeData');
					}
				break;
				case 'websocket':
					this.$reqID = pubjs.mc.send(c.url, param, this.onBeforeData.bind(this));
				break;
			}

			// 需要广播参数给子表格的，发广播
			if(c.fireSubgridParam){
				var fireParam = util.clone(param);
				// 过滤掉指标
				delete fireParam.metrics;
				pubjs.setSubgridParam(c.gridName, fireParam);
			}

			return this;
		},
		onBeforeData: function(err, data) {
			// 如果当前模块是隐藏状态，放入队列，等显示时候再执行下文
			var self = this;
			pubjs.checkDisplay(self, 'onData', self.onData, self, err, data);
		},
		onData: function(err, data){
			this.hideLoading();

			// 自动刷新
			var mod = this.get('refresh');
			if (mod){
				mod.$doms.button.prop('disabled', false).find('i').removeClass('refing uk-icon-spin uk-icon-spinner');
				if (mod.getConfig('refreshAuto')){
					mod._toggleRefresh(1);
					// 自动拉取时, 错误不更新不提示错误
					if (err){ return; }
					// mod.$.list.showRefresh();
				}
			}

			if (err){
				pubjs.error('拉取数据错误', err);

				this.setData([]);
				return;
			}

			var c = this.getConfig();

			// 格式化数据
			if(c.formatData && util.isFunc(c.formatData)){
				data = c.formatData(data);
			}

			this.setData(data);

			// 如果记录有上次滚动距离，则滚动到上次位置
			if (this.$lastScollerHPos && this.$ && this.$.scrollerH) {
				this.$.scrollerH.scrollTo(-this.$lastScollerHPos);
				this.$lastScollerHPos = 0;
			}

			if(c.eventDataLoad){
				this.fire("gridDataLoad",data);
			}
			//重置滚动偏移量
			this.$scrollerVLen = 0;

			// 更新已选数目显示；
			this.updateSelectedCount();
		},
		reload: function(param, url, page){
			var c = this.getConfig();
			if (url){
				c.url = url;
			}

			if (param){
				$.extend(this.$customParam, param);
				this.setParam(param);
			}

			util.extend(this.$sysParam, {
				page: page || this.$sysParam.page || 1
			});

			this.load();
		},
		setParam: function(param, replace){
			// var c = this.getConfig();
			var cParam = replace ? param : $.extend(this.$customParam, param);
			// var cParam = replace ? param :util.extend(this.$customParam, param);
			this.setConfig('param', cParam);
			// 更新排序
			if(cParam && cParam.order){
				this.$sort = cParam.order;
			}
			return this;
		},
		getParam: function(all){
			if(all){
				var c = this.getConfig();
				var ud;
				var param = util.extend(
					{},
					c.param,
					this.$sysParam,
					this.$customParam,
					{'page':ud}
				);
				if (c.sub_exname){
					param.subex_name = c.sub_exname;
				}

				return param;
			}else{
				return this.$customParam;
			}
		},
		showLoading: function(){
			this.updateLoading(true);
			return this;
		},
		hideLoading: function(){
			this.updateLoading(false);
			return this;
		},
		updateLoading: function(bool){
			var self = this;
			var el = self.getDOM();
			var gridList = self.$doms.gridList;
			// 因为gridList会清空，所以loading会appendTo到其他地方暂存
			if(bool){
				self.$loading.appendTo(gridList).show();
			}else{
				self.$loading.appendTo(el).hide();
			}
			return self;
		},
		/** ---------------- 交互 ---------------- **/
		// 排序
		eventSort: function(ev, dom){
			var c = this.getConfig();

			dom = $(dom);
			var name = dom.attr('data-name');

			this.$sort = name + (dom.hasClass('desc') ? '|1' : '|-1');

			// 为了兼容"sort"命名: 有的叫"sort",有的叫"order"
			var param = {};
			param[c.sortName] = this.$sort;

			this.reload(param, '', this.$sysParam.page);

			return false;
		},
		// 复选框点击事件
		eventCheckboxClick: function(ev, dom){
			var self = this;
			var c = self.getConfig();
			var checkbox = $(dom).find('input');
			if(!checkbox.length){
				checkbox = $(dom);
			}
			var trLeft = checkbox.parents('tr');
			var id = trLeft.attr('data-id');
			var trRight = self.$doms.content.find('tr[data-id="'+id+'"]');
			checkbox.parent().toggleClass('change');


			// 添加行选中样式
			var className = c.style.selected;
			var beforeToggleStatus = trLeft.hasClass(className); // 原状态
			var toggleClass = beforeToggleStatus ? 'removeClass' : 'addClass';
			trLeft[toggleClass](className);
			trRight[toggleClass](className);

			// 更新选中值
			self.updateSelectedValue(!beforeToggleStatus, id);

			self.calculateWidth();
			// return false; // 会阻止了checkbox的默认勾选事件
		},
		// 全选框点击事件
		eventSelectAll: function(ev, dom){
			var c = this.getConfig();

			var doms = this.$doms;
			var trLeft = doms.sidebar.find('tr');
			var trRight = doms.content.find('tr');

			var checkbox = $(dom).find('input');
			if(!checkbox.length){
				checkbox = $(dom);
			}
			checkbox.toggleClass('checked').parent().toggleClass('change');

			var isSelected = checkbox.hasClass('checked')? true: false;
			var toggleClass = isSelected ? 'addClass' : 'removeClass';

			var className = c.style.selected;
			trLeft[toggleClass](className);
			trRight[toggleClass](className);
			trLeft.find('input[type="checkbox"]').prop('checked', isSelected).parent().toggleClass('change', isSelected);

			// 更新选中值
			this.updateSelectedValue(isSelected);

			this.calculateWidth();

			// return false; // 会阻止了checkbox的默认勾选事件
		},
		// 更新选中值
		updateSelectedValue: function(add, value){
			var c = this.getConfig();
			// var data = value ? [{'id':value}] :(this.$data&&this.$data.items||[]);
			// @优化todo , 'id'变成可配置项
			var obj = {}
			obj[c.key] = value;
			var data = value ? [obj] :(this.$data&& this.$data.items||[]);

			for (var i = 0; i < data.length; i++) {
				var field = util.isInt64(data[i][c.key]) ? '_data':undefined;
				var key = util.isInt64(data[i][c.key])? data[i][c.key]._data : data[i][c.key];
				var index = field ? util.index(this.$selects, key, field) : util.index(this.$selects, key);

				// 增加
				if(add){
					if(index == null){
						this.$selects.push(data[i][c.key]);
					}
				}else{
				// 清除
					if(index != null){
						this.$selects.splice(index, 1);
					}
				}
				if(this.getConfig('eventSelect')){
					this.fire('changeSelect', {
						"column": value
						,"selected": this.$selects.slice()
						,"data": data
					});
				}
			}

			this.updateSelectedCount();
		},
		setRowHighlight: function(id){
			var self = this;
			if (!self.$doms.sidebar || !self.$doms.content)
			{
				return false;
			}
			var c = self.getConfig();
			var className = c.style.highlight;
			var trLeft = self.$doms.sidebar.find('tr[data-id="'+id+'"]');
			var trRight = self.$doms.content.find('tr[data-id="'+id+'"]');
			trLeft.addClass(className);
			trRight.addClass(className);

			if (self.$highlights.indexOf(id) == -1)
			{
				self.$highlights.push(id);
			}

			this.setTimeout('unsetRowHighlight', c.highlight_time, id);
		},
		unsetRowHighlight: function(id){
			var self = this;
			if (!self.$doms.sidebar || !self.$doms.content)
			{
				return false;
			}
			var c = self.getConfig();
			var className = c.style.highlight;
			var trLeft = self.$doms.sidebar.find('tr[data-id="'+id+'"]');
			var trRight = self.$doms.content.find('tr[data-id="'+id+'"]');
			trLeft.removeClass(className);
			trRight.removeClass(className);
			util.remove(this.$highlights, id);
		},
		// 批量操作
		eventBatch: function(ev, dom){
			this.fire('batch', [this.$selects, dom]);
			return false;
		},
		// 销毁子表格模块
		destroySubgrid: function(ev, dom){
			var mod = this.get('subgrid');
			if(mod){
				if(mod.getAnchor()){
					$(mod.getAnchor()).removeClass('M-HighGridSubgridCtrlAnchorAct');
				}
				mod.destroy();
			}
			this.$subgridId = false;

			return false;
		},
		// 激活子表格样式
		eventActiveSubgrid: function(ev, dom){
			var subgrid = this.get('subgrid');
			if(subgrid){
				subgrid.toggleActive((ev.type == 'mouseenter'));
			}
			return false;
		},
		// 行高亮效果
		eventListRowHover: function(ev, dom){
			var el = this.getDOM();
			var c = this.getConfig();
			var id = '';
			var trs = '';
			if(c.listRowHoverKey == 'data-index'){
				id = $(dom).attr('data-index');
				trs = el.find('tr[data-index="'+id+'"]');
			}else{
				id = $(dom).attr('data-id');
				trs = el.find('tr[data-id="'+id+'"]');
			}

			// 添加行hover状态
			trs.toggleClass('M-HighGridListRowHover', ev.type == 'mouseenter');
			return false;
		},
		// 显示新的子表格图标
		eventShowSubgrid: function(ev, dom){
			var c = this.getConfig();
			var id = $(dom).attr('data-id') || $(dom).closest('tr').attr('data-id');
			var isAmount = $(dom).find('.isAmount').length;
			var el = this.getDOM();
			$(dom).addClass('M-HighGridSubgridCtrlAnchorAct');

			var data = this.getData();
			if(!data){return false;}
			// 无数据的话，不创建子表格
			var hasData = data.items ? data.items.length : false;

			var hasSub, subs, param;
			if(isAmount)
			{
				param = {Name: c.amountSubgridName || LANG('汇总')};
				hasSub = c.hasAmountSubGrid;
				subs = c.amountSubs;
			}
			else
			{
				hasSub = c.hasSubGrid;
				subs = c.subs;
			}

			// 子表格
			if(hasSub && subs && hasData){
				//if(this.$subgridId != id){
					// 销毁旧模块
					var mod = this.get('subgrid');
					if(mod){
						mod.destroy();
					}

					// 创建新模块
					var filter = c.subFilter;

					// 过滤掉隐藏的列
					var subTarget = null;
					var doms = el.find('tr[data-id="'+id+'"] a.M-HighGrid-subgrid');
					for(var i = 0; i<doms.length; i++){
						if($(doms[i]).is(':visible')){
							subTarget = doms[i];
						}
					}

					if(!isAmount)
					{
						param = this.getData(id);
					}

					var subgrid = this.create('subgrid', NewSubgrid, {
						subs: subs,
						parentTarget: el,
						childTarget:subTarget,
						data: param,
						target: el.find('.M-HighGridSubgridCtrl'),
						subFilter: (util.isString(filter) && this[filter]) ? this[filter].bind(this): filter,
						offset: this.$scrollerVLen || 0,
						anchor: $(dom)
					}).show();
					// 列表总配置加入子表格的数组配置
					c.subOptions = subgrid.getOptions();
				//}
			}

			return false;
		},
		// 清空全部已选择
		eventEmptySelected: function(ev, dom){
			var self = this;
			var doms = self.$doms;
			self.setSelectRowIds([]);
			self.updateSelectedCount();
			doms.gridList.find('label.change input').prop('checked', false).removeClass('checked').parent().removeClass('change');
			doms.gridList.find('.M-HighGridListRowSelected').removeClass('M-HighGridListRowSelected');

			// self.reload();
		},
		// 更新显示已选多少个
		updateSelectedCount: function(){
			var len = this.getSelectRowIds().length;
			var text = len ? LANG('清空已选') : LANG('已选');
			var doms = this.$doms;
			if(doms.selectedCount){
				doms.selectedCount.text(text + len + LANG('个'));
			}
			return this;
		},
		/**
		 * 显示/隐藏 指定列
		 * @param  {String} name    列名
		 * @param  {Boolean} bool 显示还是隐藏，默认是隐藏
		 * @param  {String} type    主列还是副列，默认是主列
		 */
		toggleColumn: function(name, bool, type){
			var doms = this.$doms;
			if(!doms){
				return;
			}
			// var c = this.getConfig();
			var display = bool ? 'show': 'hide';
			// var isMain = !type || type == 'main';
			// var head = isMain ? doms.corner: doms.header;
			// var body = isMain ? doms.sidebar: doms.content;
			// var headElms = head.find('tr:first td'); // 头部
			var gridList = doms.gridList;

			this.$happenToggleColumn = true;	// 是否发生过toggleColumn，暂时对于锁定列有问题，故加状态跳过

			// 重构_toggleColumn
			function _toggleColumn(name){
				gridList.find('td[data-name="'+name+'"]')[display]();
			}

			// function _toggleColumn(name){
			// 	var elm = head.find('tr td[data-name="'+name+'"]');

			// 	if(elm && elm.length){
			// 		elm[display]();
			// 		var index = headElms.index(elm);

			// 		// 汇总栏隐藏
			// 		if(!isMain && c.hasAmount){
			// 			var amountElm = head.find('tr').eq(1).find('td');
			// 			amountElm.eq(index)[display]();
			// 		}

			// 		var bodyElm = body.find('tr');
			// 		if(bodyElm && bodyElm.length){
			// 			for (var i = 0; i < bodyElm.length; i++) {
			// 				$(bodyElm[i]).find('td').eq(index)[display]();
			// 			}
			// 		}
			// 	}else{
			// 		pubjs.error('参数错误，查找不到名称为'+name+'的列');
			// 		return false;
			// 	}
			// }

			if(!doms){
				pubjs.error('调用错误，HighGrid还未构建完成');
				return false;
			}

			// 字符串
			if(util.isString(name)){
				_toggleColumn(name);
			}
			// 数组
			if(util.isArray(name)){
				for (var i = 0; i < name.length; i++) {
					_toggleColumn(name[i]);
				}
			}

			// 重新计算
			this.calculateWidth();
			return this;
		},
		// 重新计算colspan
		updateColspan: function(){
			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;
			var corner = doms.corner;

			// toggleColumn的情况下，会重新计算colspan
			if(c.hasAmount){
				var colspan = corner.find('tr:first').find('td:visible').length;
				var tds = corner.find('tr:last').find('td');
				tds.filter('[colspan]').prop('colspan', colspan - (tds.length - 1));
			}
			return self;
		},
		// 显隐指标分组指定栏
		toggleTabColumn: function(name, bool){
			var tab = this.$.tab;

			// 字符串
			if(util.isString(name)){
				tab.toggleItem(name, bool);
				return;
			}
			// 数组
			if(util.isArray(name)){
				for (var i = 0; i < name.length; i++) {
					tab.toggleItem(name[i], bool);
				}
				return;
			}
		},
		// 拖拽处理
		eventDrag: function(data, evt) {
			var scrollerH = this.get('scrollerH');
			var scrollerV = this.get('scrollerV');
			var iH = Math.abs(data.cdx) > Math.abs(data.cdy);  // 是否是横向滚动
			if (!scrollerH && !scrollerV) {
				return false;
			}

			if (data.type === 'moveDrag') {
				if (scrollerH && iH) {
					scrollerH.scrollBy(-data.cdx);
				} else if (scrollerV) {
					scrollerV.scrollBy(-data.cdy);
				}
			}
			// 按ctrl的时候，不做拖动处理
			if(!evt.ctrlKey){
				return true;
			}
		},
		// 指标的tip提示
		eventMetricTips: function(ev, dom){
			var el = $(dom);
			var desc = el.attr('data-desc');
			var tip = this.$.metricTip;
			if(!tip){
				tip = this.create("metricTip", Tip, {
					"anchor": el,
					"pos": "tm",
					"width": 255
				});
			}else{
				tip.update({"anchor":el});
			}
			tip.setData(desc);
			if (ev.type === 'mouseenter'){
				tip.show();
			}else {
				tip.hide();
			}
		},
		/** ---------------- 响应 ---------------- **/
		// 滚动条响应事件
		onScroll: function(ev){
			var self = this;
			var doms = self.$doms;

			var left, top;

			var scrollerH = self.$.scrollerH;
			var scrollerV = self.$.scrollerV;
			var scrollerSV = self.$.scrollerSV;
			var scrollerSH = self.$.scrollerSH;

			// 横向滚动
			if (ev.source === scrollerH) {
				left = scrollerH.getScrollPos();
				doms.header.scrollLeft(left);
				doms.layoutLeft.toggleClass('shadow', !!left);

			// 纵向滚动条
			} else if (ev.source === scrollerV) {
				top = scrollerV.getScrollPos();
				if(navigator.userAgent.indexOf('Mac OS X') > 0){
					doms.sidebar.scrollTop(top);
				}else{
					scrollerSV.scrollTo(-top, true);
				}

			// sidebar的纵向滚动条
			} else if (ev.source === scrollerSV) {
				top = scrollerSV.getScrollPos();
				if(navigator.userAgent.indexOf('Mac OS X') > 0){
					doms.content.scrollTop(top);
				}else{
					scrollerV.scrollTo(-top, true);
				}

			// sidebar的横向滚动条
			} else if (ev.source === scrollerSH) {
				left = scrollerSH.getScrollPos();
				doms.corner.scrollLeft(left);
			}

			// 滚动事件触发时，销毁子表格模块
			self.destroySubgrid();
			self.cast('gridScroll');
			self.$scrollerVLen = 0; // 竖滚动条偏移值

			return false;
		},
		// 拖动表格时的响应，有别于滚动条拖动效果
		onScrollFollowStep: function(ev){
			var self = this;
			var doms = self.$doms;
			var scrollerH = self.$.scrollerH;
			var scrollerV = self.$.scrollerV;
			var scrollerSV = self.$.scrollerSV;
			// var scrollerSH = self.$.scrollerSH;

			if (ev.source === scrollerH) {
				doms.header.scrollLeft(ev.param);
				doms.layoutLeft.toggleClass('shadow', !!ev.param);
			}
			if (ev.source === scrollerV) {
				if(navigator.userAgent.indexOf('Mac OS X') > 0){
					doms.sidebar.scrollTop(ev.param);
				}else{
					scrollerSV.scrollTo(-ev.param, true);
				}
			}
		},
		// 分页切换事件
		onChangePage: function(ev){
			if (this.$.pager){
				util.extend(this.$sysParam, {
					page: ev.param.page,
					limit: ev.param.size
				});
				this.load();
			}
			return false;
		},
		// Document宽度变化响应事件
		onDocumentResize: function(ev){
			var self = this;
			self.calculateWidth();
		},
		// 浏览器窗口大小变化响应事件
		onWindowResize: function(ev){
			var self = this;
			self.calculateWidth();
			self.calculateHeight();
		},
		// 主菜单状态变动响应事件
		onMenuToggle: function(ev){
			var self = this;
			self.calculateWidth();
			return false;
		},
		// 右侧工具栏状态变动响应事件
		onToolsToggle: function(ev){
			return false;
		},
		// 子表格弹层show的响应事件
		onPopShow: function(ev){
			// 弹层里面的子表格也重新计算
		},
		// 响应指标组切换事件
		onMetricsTabChange: function(ev){
			var c = this.getConfig();
			var data = ev.param;
			this.setConfig('metrics', data);

			// 发送要显示的指标参数给后端，得到想要的指标，然后创建
			if(c.isSendMetrics){
				// 更新指标参数，加载数据 load()
				this.$sysParam.metrics = data;
				this.load();
			}else{
				// 一开始就已得到全部的指标，根据显示指标来创建指标列，不需要重新拉取数据；
				this.setData(this.$data);
			}
		},
		/*
			发动系统级别的metrics, 只用setParam,没什么用...
		 */
		setMetricsParam: function(data) {
			this.$sysParam.metrics = data || [];
			return this;
		},
		// 响应选项卡事件
		onTabChange: function(ev){
			this.calculateWidth();
			return false;
		},
		// 响应手动刷新事件
		onRefreshManual: function(ev){
			this.load();
			return false;
		},
		// 响应自动刷新事件
		onRefreshAuto: function(ev){
			if (this.getDOM().width() > 0){
				this.toggleRefreshDisable(this.$sysParam);
				// 表格正常显示, 刷新自己
				this.load();
			}else {
				// 表格隐藏, 拦截事件不刷新
				return false;
			}
			// 让子表格刷新，可删？
			this.cast('autoRefresh');
			return false;
		},
		/**
		 * 导出按钮点击事件
		 * @param  {Object} ev 事件变量
		 * @return {Bool}     返回false拦截事件冒泡
		 */
		onExcelExport: function(ev){
			var c = this.getConfig();
			var param = this.getParam(true);

			ev.returnValue = {
				'type': c.exportParam||c.gridName,
				'param': param
			};
			return false;
		},
		// 响应日期条事件
		onDateRangeChange: function(ev){
			var self = this;
			var c = self.getConfig();
			// 设置日期参数
			self.setDateRange(ev.param.nowTimestamp);
			if(self.getDOM().is(':visible')){
				self.load();
				// 检测是否禁用自动刷新按钮；
				self.toggleRefreshDisable(ev.param.nowTimestamp);
			}
			if(c.hasDateRange){
				if(self.get('dateRange')){
					self.get('dateRange').setData(ev.param);
				}
			}
			return false;
		},
		/**
		 * 更新时间段参数
		 * @param {Object} date datebar模块返回的时间段参数
		 * @return {Bool}		返回是否有参数更新
		 */
		setDateRange:function(date){
			var ud;
			var sp = this.$sysParam;
			if(!sp){
				return false;
			}
			this.$sysParam.page = 1;

			util.extend(sp, {
				stastic_all_time: ud,
				begindate: ud,
				enddate: ud
			}, date);

			return this;
		},
		// 是否禁用自动刷新按钮
		toggleRefreshDisable: function(date){
			var c = this.getConfig();
			// 自动刷新
			var mod = this.get('refresh');
			if (mod){
				if(c.refreshCheckToday)
				{
					// 检查日期, 日期不为今天时需要禁用
					var today = util.date('Y-m-d');
					var isToday = today === util.date('Y-m-d', date.begindate) && today === util.date('Y-m-d', date.enddate);
					if (isToday) {
						mod.enable();
					} else {
						mod.disable();
					}
				}
				else
				{
					mod.enable();
				}

				mod._toggleRefresh(0);
				mod.$doms.button.prop('disabled', true).find('i').addClass('refing uk-icon-spin uk-icon-spinner');
			}
		},
		// 响应搜索事件
		onSearch: function(ev){
			// 参数是空格隔开的字符串
			this.$sysParam.word = ev.param && ev.param.value || undefined;
			this.$sysParam.page = 1;
			this.setParam({
				'word': this.$sysParam.word
			}, true);
			this.load();
			// this.cast('wordsSearchResult', ev.param);
			return false;
		},
		// 响应多词搜索事件
		onWordsSearch: function(ev){
			// 参数是数组
			this.$sysParam.words = ev.param && ev.param.value || [];
			this.$sysParam.page = 1;
			this.setParam({
				'words': this.$sysParam.words
			}, true);
			this.load();
			this.cast('wordsSearchResult', ev.param);
			return false;
		},
		onClearFilterResult: function(ev){
			this.$sysParam.words = '';
			this.$sysParam.word = '';
			this.$sysParam.page = 1;

			this.setParam({
				'words': '',
				'word': '',
				'page': 1
			}, true);


			if(this.$.search){
				this.$.search.reset();
			}
			// 没有筛选栏按钮的时候，重新加载
			// 有筛选栏按钮的时候，在列表实例中重新加载
			if(!ev.param){
				this.load();
			}
		},
		// 子表格图标点击事件
		onSubgridIconClick: function(ev){
			var data = ev.param.data;
			var type = ev.param.type;
			var title = ev.param.text;

			this.showSubgrid(data, type, title, 'combination');
		},
		/**
		 * 显示子表格弹层
		 * @param  {Object}  data 单条记录数据
		 * @param  {Boolean} type 子表格类型，即id
		 * @param  {Boolean} title 子表格中文名称
		 * @param  {Boolean} popType popbar类型  compare 对比报表 | combination 组合维度
		 * @return {None}
		 */
		showSubgrid: function(data, type, title, popType){
			var self = this;
			var c = self.getConfig();
			var key = c.subField || c.gridName;
			var gridName = key;

			// @todo 后端要求命名以_id结尾
			var subgridConfig = pubjs.config('subgrid_field');
			if(subgridConfig && subgridConfig[key]){
				key = subgridConfig[key];
			}else{
				key = key +'_id';
			}

			var currentParam = {};
			var grid_field = c.key;
			if(popType == 'compare'){
				currentParam[key] = self.$selects;
			}else{
				currentParam[key] = data[grid_field];
			}

			// 转JSON格式，是为了顾及子表格的导出功能，报表导出接口不是websocket的
			var condition = self.getConfig('param/condition')|| [];
			if(util.isString(condition)){
				condition = JSON.parse(condition);
			}
			condition.push(currentParam);

			/**
			 * config 说明
			 * @property {String}   type            subgrid类型  在config app/subgrid中配置
			 * @property {String}   name     [可选] 模块名称(传入相同名称在多次调用时不会创建新的模块)
			 * @property {Object}   param    [可选] 模块参数
			 * @property {String}   title    [可选] 菜单标题  可在subgrid配置中获取
			 * @property {Object}   config   [可选] 模块配置
			 * @property {Function} callback [可选] 模块回调
			 */
			var title_field = c.subgrid_title_field || 'Name';
			var text = data[title_field];

			var param = {'condition': JSON.stringify(condition)};
			if(self.getConfig('param/ColumnType')){
				param.ColumnType = self.getConfig('param/ColumnType');
			}

			if(c.needSetSubgridParam){
				var p;
				if(c.transSubgridParamCb && c.transSubgridParamCb[type] && util.isFunc(c.transSubgridParamCb[type])){
					p = c.transSubgridParamCb[type](self.getParam());
				}
				else{
					p = self.getParam();
				}

				//util.extend(p, param);
			}

			// 从所有参数中删除metrics配置，子表格不需要同步metrics配置
			var allParam = util.extend(self.getParam(true), {page: self.$sysParam.page});
			var noMetricsParam = util.clone(allParam);
			if(noMetricsParam){
				delete noMetricsParam.metrics;	// 删除指标
				delete noMetricsParam.page;	// 删除分页
				delete noMetricsParam.limit;	// 删除limit
			}
			var dateParam = allParam.begindate ? {'begindate':allParam.begindate,'enddate':allParam.enddate} : null;

			pubjs.showPop({
				'type': type,
				//title: text+ '/' +ev.param.text,
				'title': title,
				'name': [gridName, data[grid_field], type].join('_'),
				'group': {	// 所属组
					text: text,	// 列表真实数据名称
					name: gridName, // 列表模块大名
					id: data[grid_field],	// 列表对应id
				},
				'parentData': data,
				'param': param,
				'popType': popType, //  弹层类型
				// 来源
				'source': {
					'popType': popType,
					'selects': self.$selects, // 已选的
					'gridData': self.getData(), // 列表数据
					'gridName': c.gridName, // 列表名称
					'subName': c.subName, // 列表子表格名，对应子表格配置
					'subs': c.subs, // 列表子表格配置
					'subOptions': c.subOptions, // id和名称数组
					'param': allParam, // 源列表所有参数
					'dateParam': dateParam, // 时间参数
					'noMetricsParam': noMetricsParam, // 需要同步父表格参数的，不用包含指标组参数
					'id': data[grid_field], // id
					'name': text, // 名称
					'url': c.url, // 源url
					'condition': condition,
					'key': c.key,
					'nameKey': c.nameKey,
					'uuid': util.uuid(), // 初始化赋以标记uuid；
					'sup_uuid': c.sup_uuid || self.parent().getConfig('uuid') ||'', // 如果有sup_uuid（父uuid），表明这是子表格状态；
					// 如果有sup_container_name（父容器名），表明这是子表格状态
					// 不断传下去，构成关系链
					'sup_container_name': c.sup_container_name || self.parent().getConfig('sup_container_name') || ''

				}
			});

			self.destroySubgrid();
			return false;
		},
		/** ---------------- 内部函数 ---------------- **/
		// 获取过滤后的要显示的指标集
		getMetrics: function(){
			var c = this.getConfig();
			var tab = c.tab || pubjs.config('defaultGroup');

			// 若无default_metrics 参数，则以 metrics 值作为默认值
			var defMetrics = c.default_metrics;
			var metrics = (defMetrics && defMetrics.length) ? defMetrics: c.metrics;

			var name;
			var arr = [];
			for (var i = 0; i < metrics.length; i++) {
				if(util.isString(metrics[i])){
					// 支持"{组名}"过滤
					var abbr = metrics[i].match(/{(.+)}/);
					if(abbr){
						name = tab[abbr[1]];
						if(util.isObject(name)){
							arr = arr.concat(name.cols);
						}
					}else{
						arr.push(metrics[i]);
					}

				}else{
					// 对象
					arr.push(metrics[i]);
				}
			}
			return arr;
		},
		// 获取tab/cols 参数中的值
		getMetricFromTab: function(name){
			var tab = this.getConfig('tab');
			// 把tab 配置中的cols的合并成一个数组
			var cols = [];
			for (var e in tab) {
				if(tab[e]){
					cols = cols.concat(tab[e].cols);
				}
			}

			for (var i = 0; i < cols.length; i++) {
				if(util.isObject(cols[i])){
					if(cols[i].name == name){
						// 返回对象
						return cols[i];
					}
				}
			}
			// 返回原值
			return name;
		},
		// 调整指标顺序
		updateMetricsOrder: function(metric){
			var order = this.getConfig('metricForward');// 顺序数据
			var data = util.clone(metric);	// 指标
			var buffer = [];

			// 字符串转数组
			if(util.isString(order)){
				order = [order];
			}

			// 数组
			if(util.isArray(order)){
				for (var i = 0; i < order.length; i++) {
					var index = util.index(data, order[i]);
					// 如果存在
					if(index != null){
						// 删除元素
						data.splice(index, 1);
						// 放入新数组
						buffer.push(order[i]);
					}
				}
				return buffer.concat(data);
			}


			return metric;
		},
		// 根据id数组设定表格选中行
		setSelectRowIds: function(ids){
			var self = this;
			if(util.isArray(ids)){
				self.$selects = ids;
			}
			return self;
		},
		// 获取表格选中行id数组
		getSelectRowIds: function(){
			var self = this;
			self.$selects = util.unique(self.$selects);
			return self.$selects || [];
		},
		// 获取两者间的最大值
		_getMax: function(a, b){
			return a>b ? a : b;
		},
		// 显示筛选栏
		showPanel: function(){
			this.get('filter').showPanel();
			return false;
		},
		/**
		 * 隐藏列按钮点击事件
		 * @param  {Object} ev 事件变量
		 * @return {Bool}     返回false拦截事件冒泡
		 */
		onToggleColumns: function(ev){
			var self = this;
			var param = ev.param;
			var c = self.getConfig();
			var columns = c.toggleColumns;
			// 隐藏或显示指定的列
			if (columns.length) {
				self.toggleColumn(columns, param.type);
			}

			return false;
		},
		// 设置列表的初始状态（显示或者隐藏指定列）
		initColumnsState: function(){
			var c = this.getConfig();
			if (c.toggleColumns.length) {
				this.$.toggleColumns.initState();
			}
		}
	});
	exports.base = HighGrid;

	/**
		HighGrid详细参数说明
			@cols						主列（左侧）定义，
			@metrics					副列（右侧），通常是指标列
				@sort					默认是为true
				@render					渲染函数，支持字符串和函数
				@headerRender			标题渲染函数
			@tab						tab 配置，如果没有就使用缺省配置；
				{
					"组名": true,				只传true时，以缺省配置补全
					"组名":{Object 具体配置}
				}
			@操作列
					支持cols中设置，也支持参数hasMenu
					cols{ type: 'op'}}
			@数据参数：$sysParam
				metrics
				page
				limit
				begindate、enddate
				stastic_all_time
			@子表格相关
				subgrid_title_field 指定字段，用于渲染popGrid的左侧标题，缺省使用Name字段
	**/

	// 刷新模块
	var Refresh  = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'target': null,
				'hasAuto': false,
				'refreshTime': 10,		// 刷新间隔
				'refreshAuto': 0,		// 自动刷新中
				'class': 'M-HighGridRefresh fl mr10'
			});

			// 自动刷新Timeout ID
			this.$refreshTimeId = 0;

			// 是否为禁用状态，默认不禁用
			this.$disabled = false;

			// 状态
			this.$mode = false;

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var c = this.getConfig();
			var el = this.getDOM();

			// 读取记录的配置
			c.refresh_id = 'grid_refresh' + this._.uri;
			if (c.refreshAuto){
				c.refreshAuto = (pubjs.storage(c.refresh_id) !== '0');
			}
			if(c.hasAuto){
				this.append('<span data-type="0" class="M-HighGridRefreshAuto" ><i class="uk-icon-square"></i>'+LANG("自动刷新")+'</span>');
			}
			this.append('<button title="'+LANG('刷新报表')+'" class="refNormal"><i class="uk-icon-rotate-right"/></button>');

			var doms = this.$doms = {
				check: el.find('.M-HighGridRefreshAuto'),
				button: el.find('button')
			};
			this.refreshCallBack = this.refreshCallBack.bind(this);
			if (c.refreshAuto)
			{
				doms.check.find('i').addClass('act uk-icon-check-square');
				doms.check.attr('data-type', 1);
				this._toggleRefresh(1);
			}
			this.uiBind(doms.check, 'click', 'eventRefreshMode');
			this.uiBind(doms.button, 'click', 'eventRefreshManual');
		},
		eventRefreshMode: function(evt, elm){
			if (this.$disabled) {
				return;
			}
			this.setConfig('refreshAuto', +$(elm).attr("data-type"));
			this.toggleRefresh();
		},
		eventRefreshManual: function(ev){
			this.$doms.button.find('i').addClass('refing uk-icon-spin uk-icon-spinner');
			this.fire('refreshManual');
			return false;
		},
		toggleRefresh: function(mode){
			var self = this;
			var c = self.getConfig();
			if (mode === undefined){
				mode = !c.refreshAuto;
			}else {
				mode = !!mode;
			}
			c.refreshAuto = mode;
			self._toggleRefresh(mode);
			self.$doms.check
				.attr("data-type",mode?1:0);

			self.$doms.check.find('i').toggleClass("uk-icon-check-square",mode);
			pubjs.storage(c.refresh_id, +mode);
			return self;
		},
		refreshCallBack: function(mode){
			if (this.getDOM().width() > 0){
				this.fire('refreshAuto');
			}else {
				this.$refreshTimeId = 0;
				this._toggleRefresh(1);
			}
		},
		_toggleRefresh: function(mode){
			var self = this;
			self.$mode = mode;
			if (mode){
				if (self.$disabled) {
					return self;
				}
				if (!self.$refreshTimeId){
					self.$refreshTimeId = setTimeout(
						self.refreshCallBack,
						self.getConfig().refreshTime * 1000
					);
				}
			}else {
				if (self.$refreshTimeId){
					clearTimeout(self.$refreshTimeId);
					self.$refreshTimeId = 0;
				}
			}
			return self;
		},
		// 禁用
		disable: function() {
			if (!this.$disabled) {
				this.$disabled = true;
				this.$doms.check.addClass('is-disabled');
				this.$lastMode = this.$mode;
				this.toggleRefresh(0);
			}
			return this;
		},
		// 启用
		enable: function() {
			if (this.$disabled) {
				this.$disabled = false;
				this.$doms.check.removeClass('is-disabled');
				if (this.$lastMode) {
					this.toggleRefresh(1);
				}
			}
			return this;
		}
	});
	exports.refresh = Refresh;

	// 指标组模块
	var Tab = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'tab': null,
				'metrics': [],
				'gridName': '',
				'target': null,
				'default_metrics': [],
				'class': 'M-HighGridTab',
				'customTabMetricsStorageName': '',	// storage记录名称
				'style': {
					'tabItem': 'M-HighGridTabItem',				// 指标分组项目样式
					'tabActive': 'M-HighGridTabActive',			// 指标分组激活样式
					'tabActivePanel': 'M-HighGridTabActivePanel' // panel激活的样式
				}
			});

			// 为了面板组的toggle功能
			this.$tab = config.get('tab');
			this.$current = util.clone(this.$tab);
			this.$panelAnchor = null;
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var c = this.getConfig();

			// 更新tab值
			var data = this.getTabData();
			this.setConfig('tab', data);

			var ul = $('<ul></ul>');
			$('<li data-name="default" class="'+c.style.tabItem+' '+c.style.tabActive+'">'+LANG('默认')+'<i class="uk-icon-angle-down"/></li>').appendTo(ul);
			for (var i in data){
				// 去除为null的情况
				if(data[i]){
					$('<li class="'+c.style.tabItem+'"/>').attr('data-name', i).text(LANG(data[i].text)).appendTo(ul);
				}
			}
			this.append(ul);

			// 绑定指标组事件
			this.uiBind(ul.find('li'), 'click', 'eventClickTab');
			this.uiBind(ul.find('li i'), 'click', 'eventTogglePanel');
		},
		// getIntersection
		getTabData: function(){
			// 优先级覆盖
			var tabGrid = this.getConfig('tab');	// grid本身配置的tab参数
			var tabGlobal = pubjs.config('defaultGroup');// config.js文件中配置的全局tab参数
			var data = tabGrid ? tabGrid : tabGlobal;

			var filter = this.getConfig('metrics'); // 可显示的列
			// 与data取交集
			if(filter){
				var obj = {};
				var cols;
				for (var name in data){
					if(data[name]){
						var group = util.find(filter, '{'+name+'}');
						if(group){
							obj[name] = data[name];
						}else{
							obj[name] = {
								text: data[name].text,
								cols : [],
								hide_in_default: data[name].hide_in_default
							};
							cols = data[name].cols
							for (var i = 0; i < cols.length; i++) {
								// 字符串
								if(util.isString(cols[i])){
									if(util.find(filter, cols[i])){
										obj[name].cols.push(cols[i]);
									}
								}else{
									// 对象
									if(util.find(filter, cols[i].name, 'name')){
										obj[name].cols.push(cols[i]);
									}
								}
							}
							if(!obj[name].cols.length){
								obj[name] = null;
							}
						}
					}
				}
				return obj;
			}else{
				return data;
			}
		},
		// 切换指标组
		eventClickTab: function(ev, elm){
			var c = this.getConfig();

			elm = $(elm);
			var act = c.style.tabActive;

			if(elm.hasClass(act)){
				return false;
			}

			elm.siblings().removeClass(act);
			elm.addClass(act);

			var type = elm.attr('data-name');
			var cols;
			if(type == 'default'){
				var custom = pubjs.storage(c.customTabMetricsStorageName);
				cols = custom ? custom.split(',') : this.getDefaultMetrics();
				// cols = this.getDefaultMetrics();
			}else{
				cols = c.tab[type].cols;
			}

			if(this.get('tabPanel')){
				this.$.tabPanel.destroy();
				this.$panelShowing = false;
			}

			this.fire('metricsTabChange', cols);

			return false;
		},
		// 获取显示的默认值
		getDefaultMetrics: function(){
			// 如果用户没设置default_metrics，则以metrics值作为默认显示值
			var allMetrics = this.getConfig('metrics');
			var defaultMetrics = this.getConfig('default_metrics');
			var metrics = (defaultMetrics && defaultMetrics.length) ? defaultMetrics: allMetrics;

			var tab = this.getConfig('tab');
			var arr = [];
			var name;

			for (var i = 0; i < metrics.length; i++) {
				if(util.isString(metrics[i])){
					var abbr = metrics[i].match(/{(.+)}/)
					if(abbr){
						name = tab[abbr[1]];
						if(util.isObject(name)){
							arr = arr.concat(name.cols);
						}
					}else{
						arr.push(metrics[i]);
					}
				}else{
					arr.push(metrics[i]);
				}
			}

			return arr;
		},
		// 触发自定义指标设置面板
		eventTogglePanel: function(ev, elm){
			var c = this.getConfig();
			this.$panelShowing = !this.$panelShowing;

			$(elm).parent().addClass(c.style.tabActivePanel);

			this.$panelAnchor = $(elm).parent();

			// 若没有配置default_metrics 参数，使用metrics代替
			var metrics = (c.default_metrics && c.default_metrics.length) ? c.default_metrics : c.metrics;

			if(this.$panelShowing){
				// 创建popwin
				this.create('tabPanel', TabPanel, {
					'gridName': c.gridName,
					'gridNameSuffix': c.gridNameSuffix,
					'tab': this.$current,
					'default_metrics': metrics,
					'customTabMetricsStorageName': c.customTabMetricsStorageName,
					'position':{
						'mode': 'bottom, right',
						'element': $(ev.target).parents('.M-HighGridTab'),
						'offset': {
							'left': -2,
							'top': 6
						}
						// 'left': this._getElementLeft(elm[0]), // 右角对齐
						// 'top': this._getElementTop(elm[0])
					}
				});
			}else{
				// 销毁popwin
				if(this.$.tabPanel){ // 防止多次点击的情况
					this.$.tabPanel.destroy();
				}
			}
			return false;
		},
		// 显示隐藏选项卡
		toggleItem: function(name, show){
			var el = this.$el.find('li[data-name='+name+']');
			if(!show ){
				el.addClass('M-HighGridTabHide');
			}else{
				el.removeClass('M-HighGridTabHide');
			}
			this.updateTabConfig(name, show);
		},
		// 更新配置，使得面板模块跟随显隐指定的列
		updateTabConfig: function(name, show){
			var metrics = this.$tab[name];

			if(show){
				this.$current[name] = metrics;
			}else{
				this.$current[name] = null;
			}
		},
		hidePane: function() {
			if(this.$.tabPanel){
				this.$.tabPanel.destroy();
				this.$panelShowing = false;
			}
		},
		// 响应面板隐藏事件
		onPanelHide: function(ev){
			this.hidePane();
			var className = this.getConfig().style.tabActivePanel;
			this.getDOM().find('.'+className).removeClass(className);
			return false;
		},
		// 响应面板保存事件
		onPanelSave: function(ev){
			var value = ev.param;

			var c = this.getConfig();
			var act = c.style.tabActive;
			if(this.$panelAnchor){
				this.$panelAnchor.siblings().removeClass(act);
				this.$panelAnchor.addClass(act);
			}
			this.fire('metricsTabChange', value);
			this.onPanelHide();
			return false;
		}
	});
	exports.tab = Tab;

	// 指标组弹框
	var TabPanel = dialog.base.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'gridName': '',
				'tab': null,
				'default_metrics': [],

				'module': '@base/dialog.base',
				'mask': 0,
				'autoShow': true,
				'showClose': false,
				'showFoot': false,
				'showHead': false,
				'width': 'auto',
				'size': 'm',
				'hasScroll': false,
				'position':null,
				'style':{
					'layoutClass':'M-HighGridTabCustom'
				}
			});

			this.Super('init', arguments);
		},
		afterBuild: function(){
			this.Super('afterBuild', arguments);
			var c = this.getConfig();
			var data = this.getConfig('tab');
			var el = this.getContainer().css('min-height', 0);
			el.parent().css('min-height',0);

			this.$customTabMetricsStorageName = c.customTabMetricsStorageName;

			// 创建弹框
			var popwin = $([
				'<div>',
					'<i class="M-HighGridTabCustomTriangle"/>',
					'<div class="M-HighGridTabCustomTable"><table><tr></tr></table></div>',
					'<div class="M-HighGridTabCustomFooter">',
						'<input type="button" data-type="all" value="'+LANG('全选')+'"  class="btn btn-default"/>',
						'<input type="button" data-type="inverse" value="'+LANG('反选')+'"  class="ml10 btn btn-default"/>',
						'<input type="button" data-type="save" value="'+LANG('确认')+'" class="ml10 fr btn btn-success save"/>',
						'<input type="button" data-type="cancel" value="'+LANG('取消')+'" class="ml20 fr btn btn-default"/>',
						'<span class="ml5 fr reset">'+LANG('恢复默认')+'</span>',
					'</div>',
				'</div>'
			].join(''));

			var td, cols, metric;
			for (var e in data) {
				if(e != 'default' && data[e] && !data[e].hide_in_default){
					td = $('<td data-name="'+e+'"/>').appendTo(popwin.find('table tr'));
					cols = data[e].cols;
					$('<strong>'+ LANG(data[e].text) +'</strong>').appendTo(td);
					for (var i = 0; i < cols.length; i++) {
						metric = cols[i];

						// 支持直接传字符串形式，从lables.js中读取对应配置
						if(util.isString(cols[i])){
							metric = labels.get(cols[i]);
						}

						$([
							'<label>',
								'<i class="custom-checkbox">',
									'<i class="icon-checkbox-in"/>',
								'</i>',
								'<input type="checkbox" data-name="'+(metric.name||cols[i])+'"/>',
								LANG(metric.text),
							'</label>'
						].join('')).appendTo(td);
					}
				}
			}
			popwin.appendTo(el);

			// 绑定鼠标事件
			this.uiBind(this.$el, 'mouseup tap', 'panel', 'eventMouseup');
			this.uiBind(document.body, 'mouseup tap', 'document', 'eventMouseup');

			//input点击改变文字颜色
			this.uiProxy(this.$el, 'input', 'click', 'eventInputClick');

			// 绑定弹框按钮事件
			this.uiBind(popwin.find('.M-HighGridTabCustomFooter input[type="button"]'), 'click', 'eventButtonClick');
			this.uiBind(popwin.find('.M-HighGridTabCustomFooter .reset'), 'click', 'eventButtonResetDefault');

			// 设置弹框勾选值
			this.setValue();
			this.update();

			if(c.position && c.position.element){
				var anchor = c.position.element;
				popwin.find('.M-HighGridTabCustomTriangle').css({
					'top': -14,
					'left': anchor.offset().left - el.offset().left  + anchor.find('li').eq(0).width()
				}).show();
			}
			// this.fire('panelBuildSuccess');
		},
		// 在非面板区域内触发点击事件时要隐藏面板
		eventMouseup: function(ev, elm){
			switch(ev.data){

				case 'panel':		// 响应面板点击事件
					this.$isClickPanel = true;
					break;

				case 'document':	// 响应全局点击事件

					// 若没有点击过面板
					if(!this.$isClickPanel){
						this.hide();
					}

					// 重置参数
					this.$isClickPanel = false;
					break;

				// 注：无默认case
			}

			// 注：不截断事件
		},
		eventInputClick: function(ev, elm){
			$(elm).parent().toggleClass('change');
		},
		eventButtonResetDefault: function(ev, elm){
			this.setValue(this.getDefaultMetrics());
			return false;
		},
		eventButtonClick: function(ev, elm){
			var type = $(elm).attr('data-type');

			var list = this.getDOM().find('table tr');
			var unsels, sels;
			switch(type){
				case 'all':
					unsels = list.find('input:not(:checked)');
					if(unsels.length){
						list.find(':checkbox').prop('checked', true).parent().addClass('change');
					}
				break;
				case 'inverse':
					sels = list.find('input:checked');
					unsels = list.find('input:not(:checked)');
					sels.prop('checked', false).parent().removeClass('change');
					unsels.prop('checked', true).parent().addClass('change');
				break;
				// case 'default':
				// 	this.setValue(this.getDefaultMetrics());
				// break;
				case 'save':
					this.save();
				break;
				case 'cancel':
					this.hide();
				break;
			}
			return false;
		},
		getDefaultMetrics: function(){
			var metrics = this.getConfig('default_metrics');
			var tab = this.getConfig('tab');
			var arr = [];
			var name;

			for (var i = 0; i < metrics.length; i++) {
				// 字符串
				if(util.isString(metrics[i])){
					// 组名匹配
					var abbr = metrics[i].match(/{(.+)}/)

					if(abbr){
						name = tab[abbr[1]];
						if(util.isObject(name)){
							arr = arr.concat(name.cols);
						}
					}else{
						arr.push(metrics[i]);
					}
				}else{
					// 对象
					arr.push(metrics[i]);
				}
			}
			return arr;
		},
		setValue: function(value){
			if(!value){
				var defaults = this.getDefaultMetrics();
				var custom = this.getCustom();
				value = custom?custom.split(','):defaults;
			}

			var inputs = this.getDOM().find('table input');
			var item;
			for (var i = 0; i < inputs.length; i++) {
				item = $(inputs[i]);
				// value 中可能是对象也可能是字符串
				var checked = util.find(value, item.attr('data-name')) || util.find(value, item.attr('data-name'), 'name');
				// var checked = util.find(value, item.attr('data-name'));
				item.prop('checked', Boolean(checked));
				item.parent().toggleClass('change', Boolean(checked));
			}
		},
		getValue: function(){
			var input = this.getDOM().find('table input:checked');
			var data = [];
			for (var i = 0; i < input.length; i++) {
				data.push($(input[i]).attr('data-name'));
			}
			return data;
		},
		hide: function(){
			this.Super('hide', arguments);
			this.fire('panelHide');
		},
		save: function(){
			var value = this.getValue();
			if(!value.length){
				pubjs.alert(LANG('请至少选择一个指标！'));
				return false;
			}
			this.setCustom(value);
			this.fire('panelSave', value);
		},
		getCustom: function(){
			return pubjs.storage(this.$customTabMetricsStorageName);
		},
		setCustom: function(data){
			pubjs.storage(this.$customTabMetricsStorageName, data.join());
			return this;
			// @todo 同时也要保存在远端服务器
		},
		resetCustom: function(){
			pubjs.storage(this.$customTabMetricsStorageName, null);
			return this;
		}
	});
	exports.tabPanel = TabPanel;

	// 新子表格
	var NewSubgrid = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'subs': [],
				'data': [],
				'target': null,
				'subFilter': null,
				'childTarget': null,
				'parentTarget': null,
				'offset': 0,
				'anchor': null,
				'angleOffsetLeft': 0,
				'angleOffsetTop': 0,
				'dropdownOffsetLeft': 0,
				'dropdownOffsetTop': 0,
				'class': 'M-Menu M-MenuDeepColor M-HighGridSubgridCtrlCon'
			});

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM().addClass(c.class);
			var doms = self.$doms = {};

			if(c.subs){
				// 三角
				doms.angle = $('<div class="angle"><i class="uk-icon-caret-left"/></div>').appendTo(el);
				// 下拉
				doms.dropdown = $([
					'<div class="M-MenuCon">',
						'<ul class="M-MenuOptions">',
							//'<li class="uk-nav-header">子表格</li>',
							// '<li class="uk-nav-divider"></li>',
						'</ul>',
					'</div>'
				].join('')).appendTo(el);

				util.each(c.subs, function(sub, idx){
					var lab = '';

					if (util.isString(sub)){
						// 命名兼容：highgrid_ 和 grid_
						var nameAsHighgrid = 'highgrid_' + sub;
						var nameAsGrid = 'grid_' + sub;

						if(labels.has(nameAsHighgrid)){
							lab = labels.get(nameAsHighgrid);
						}else if( labels.has(nameAsGrid) ){
							lab = labels.get(nameAsGrid);
						}

						lab =  util.extend(lab, pubjs.config('app/subgrid/'+sub));
						if(!lab || util.isEmptyObject(lab)){
							pubjs.error('没有找到Subgrid配置项 - ' + sub);
						}
						sub = util.extend({'type':sub}, lab);
					}else {
						pubjs.error('没有找到Subgrid配置项 - ', sub);
					}
					c.subs[idx] = sub;
					sub.iconBtn = $([
						'<li data-index="'+idx+'" data-type="'+sub.type+'" class="option">',
							'<a href="#">',
								//'<i class="'+sub.icon+'"/>',
								LANG('%1', sub.text || ''),
							'</a>',
						'</li>'
					].join('')).appendTo(doms.dropdown.find('ul'));

				});
			}

			// 执行自定义过滤函数
			if(c.subFilter && util.isFunc(c.subFilter)){
				c.subFilter(c.subs, c.data, el);
			}

			self.uiBind(el,'mouseup tap', function(ev){
				self.$timeStamp = ev.timeStamp;
			});

			self.uiBind(document, 'mouseup tap', function(ev){
				if(ev.timeStamp !== self.$timeStamp){
					self.fire('destroyNewSubgrid', function(){
						$(c.anchor).removeClass('M-HighGridSubgridCtrlAnchorAct');
						self.destroy();
					});
				}
			});

			self.uiBind(doms.dropdown.find('li'), 'click', 'eventSubItemClick');
		},
		eventSubItemClick: function(evt, elm){
			var data = this.getConfig('data');

			this.fire('subgridIconClick', {
				type: $(elm).attr('data-type'),
				text: $(elm).text(),
				data: data
			});
			this.destroy();
			return false;
		},
		// 获取可见的子表格item选项
		getOptions: function(){
			var el = this.getDOM();
			var options = [];
			var lis = el.find('li:visible');
			$.each(lis, function(idx, item){
				if(item){
					var id = $(item).attr('data-type');
					var name = $(item).find('a').text();
					options.push({
						'id': id,
						'name': name
					});
				}
			});

			return options;
		},
		show: function(){
			this.Super('show', arguments);
			var doms = this.$doms;
			var el = this.getDOM();
			var c = this.getConfig();
			var anchor = c.anchor;
			var offset = util.offset(anchor, c.parentTarget);
			var height = doms.dropdown.outerHeight(true); // dropdown高度
			var angleTop = 0; // 三角形top
			var top = offset.top;
			var left = offset.left + anchor.width();

			// 超出列表底部, 50是一个附加量
			if(c.parentTarget.outerHeight(true) - top < height - 20){
				top = top - height + 50;
			}else{
				// 超出列表顶部
				if(top <= 30){
					top = 20;
				}else{
					// 只有一条选项的时候，修正一下；
					if(height < 40){
						top = top - 5;
					}else{
						// 正常情况
						top = top - anchor.height()/2 - 15;
					}
				}
			}

			// 锚点位置
			angleTop = offset.top - top + c.angleOffsetTop;

			// 修正移动页面显示错位问题
			var scrollTop = anchor.closest('.M-HighGridListSidebar').scrollTop() || 0;
			if(util.isMobile()){
				if(scrollTop > 0){
					el.find('.M-MenuCon').css('top', -15);
				}
			}

			// 设置下拉dropdown位置
			el.css({
				top: top - scrollTop,
				left: left + 20 + c.dropdownOffsetLeft
			})
			doms.angle.css('top', angleTop);
			doms.dropdown.show();
			return this;
		},
		hide: function(){
			this.Super('hide', arguments);
		},
		onWindowResize: function(){
			this.show();
		},
		getAnchor: function(){
			// 获取锚点
			return this.getConfig().anchor;
		}
	});
	exports.newSubgrid = NewSubgrid;

	// 批量操作
	var Batch = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'grid': null,
				'text': LANG('批量操作'),
				'class': 'M-HighGridBatch mr10 fl'
			});
			this.Super('init', arguments);
		},
		afterBuild: function(){
			this.append($('<i class="ml5 uk-icon-angle-down"/>'));
			this.uiBind(this.getDOM(), 'click', 'eventButtonClick');
		},
		eventButtonClick: function(ev, dom){
			this.getDOM().toggleClass('M-HighGridBatchAct');
			if(!this.get('menu')){
				var ids = this.getConfig('grid').getValue('selects');
				this.fire('batchShow', ids,'afterFire');


				// return false;
			}else{
				this.hide();
			}
			return false;
		},
		hide: function(){
			if(this.$.menu)
			{
				this.$.menu.destroy();
			}

			return this;
		},
		enable: function() {
			this.getDOM().removeClass('is-disabled')
		},
		disable: function() {
			this.getDOM().addClass('is-disabled')
		},
		afterFire: function(evt){
			var data = evt.returnValue;

			var el = this.getDOM();

			// 创建下拉弹框
			this.create('menu', menu.base, {
				// width: 84,
				'height': null,
				'trigger': el,
				'options': data,
				'relate_elm': el,
				'class': 'M-Menu M-MenuDeepColor M-HighGridBatchMenu',
				'algin': 'left-bottom'
			});
		},
		// 响应菜单选中事件
		onMenuSelected: function(ev){
			var len = ev.param.length;
			var data = ev.param[len -1];
			var ids = this.getConfig('grid').getValue('selects');
			// 勾选的，整条数据
			var contents = [];
			if(ids){
				for(var i=0; i<ids.length; i++){
					var item = this.getConfig('grid').getData(ids[i]);
					contents.push(item);
				}
			}

			this.fire('batchSelect', [data, ids, contents]);
			this.hide();
			this.getDOM().removeClass('M-HighGridBatchAct');
			return false;
		},
		onMenuDestroy: function(){
			this.getDOM().removeClass('M-HighGridBatchAct');
		}
	});
	exports.batch = Batch;

	// 操作菜单
	var Menu = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'grid': null,
				'activeDom': null, //绑定的目标dom.
				'class': 'M-HighGridListSidebarMenu icon-setting',
				'parentTarget': null, // 表格
				'anchor': null // 定位锚点
			});
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var activeDom = this.getConfig('activeDom');
			if(activeDom) {
				activeDom.addClass('cur_p');
			}
			// 全td可以点击
			// if(util.isMobile()){
				this.uiBind(activeDom.parent().addClass('cur_p') || this.getDOM(), 'click', 'eventButtonClick');
			// }else{
			// 	this.uiBind(this.getDOM(), 'click', 'eventButtonClick');
			// }
		},
		eventButtonClick: function(ev, dom){
			if(!this.get('menu')){
				var id = this.getDOM().parents('tr').attr('data-id');
				var value = this.$data = this.getConfig('grid').getData(id);
				this.fire('operateMenuShow', value, 'afterFire');
				// return false;
			}else{
				this.hide();
			}
			return false;
		},
		hide: function(){
			if(this.get('menu')){
				this.get('menu').destroy();
			}
		},
		afterFire: function(evt){
			var c = this.getConfig();
			var anchor = c.anchor.find('.M-HighGridListSidebarMenu');
			var target = c.grid.getDOM().find('.M-HighGridSubgridCtrl');

			// 创建下拉弹框
			this.create('menu', MenuList, {
				parentTarget: c.grid.getDOM(),
				subs: evt.returnValue,
				target: target,
				data: this.$data,
				anchor: anchor
			}).show();
		},
		// 响应菜单选中事件
		onMenuSelected: function(ev){
			var op = ev.param[0];
			var id = this.getDOM().parents('tr').attr('data-id');
			var value = this.getConfig('grid').getData(id);
			this.fire('operateMenuSelect', [op, value]);
			this.hide();
			return false;
		},
		onGridScroll: function(ev){
			this.hide();
		}
	});
	exports.menu = Menu;

	// 操作menu列
	var MenuList = NewSubgrid.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				// 'angleOffsetTop': 0,
				'dropdownOffsetLeft': -4,
				'class': 'M-Menu M-MenuDeepColor M-HighGridSubgridCtrlCon menuCtrlCon'
			});

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM().addClass(c.class);
			var doms = self.$doms = {};

			if(c.subs){
				// 三角
				doms.angle = $('<div class="angle"><i class="uk-icon-caret-left"/></div>').appendTo(el);
				// 下拉
				doms.dropdown = $([
					'<div class="M-MenuCon">',
						'<ul class="M-MenuOptions">',
							//'<li class="uk-nav-header">子表格</li>',
							// '<li class="uk-nav-divider"></li>',
						'</ul>',
					'</div>'
				].join('')).appendTo(el);

				util.each(c.subs, function(sub, idx){
					sub.iconBtn = $([
						'<li data-index="'+idx+'" data-type="'+sub.id+'" class="option">',
							'<a href="#">',
								//'<i class="'+sub.icon+'"/>',
								LANG('%1', sub.name || ''),
							'</a>',
						'</li>'
					].join('')).appendTo(doms.dropdown.find('ul'));
				});
			}

			self.uiBind(el,'mouseup tap', function(ev){
				self.$timeStamp = ev.timeStamp;
			});

			self.uiBind(document, 'mouseup tap', function(ev){
				if(ev.timeStamp !== self.$timeStamp){
					self.fire('destroyMenuList', function(){
						self.destroy();
					});
				}
			});

			self.uiBind(doms.dropdown.find('li'), 'click', 'eventSubItemClick');
		},
		eventSubItemClick: function(evt, elm){
			var data = this.getConfig('data');

			this.fire('operateMenuSelect', [{
				key: $(elm).attr('data-type'),
				name: $(elm).text(),
				elm: $(elm),
				data: {
					id: $(elm).attr('data-type'),
					name: $(elm).text()
				}
			}, data]);
			this.destroy();
			return false;
		}
	});

	// 报表导出
	var ExcelExport = common.excelExport.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'data': null,
				'reqType': 'ajax',
				'title': LANG('导出报表'),
				"url": '/api/dsp/export/',
				'class': 'M-HighGridExport fl mr10'
			});
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var el = this.getDOM();
			this.append($('<em title="'+this.getConfig('title')+'"/>'));
			this.uiBind(el, 'click', 'eventButtonClick');
		},
		eventButtonClick: function(ev){
			this.fire('excelExport',this.getConfig('data'),'afterFire');
			return false;
		},
		afterFire: function(ev){
			var data = ev.returnValue;
			var c = this.getConfig();

			if (ev.count > 0 && data){
				var url = this.getConfig('url')+data.type;
				if(c.reqType == 'websocket')
				{
					pubjs.loading.show();
					pubjs.mc.send(c.url, data, function(err)
					{
						pubjs.loading.hide();
						if(err)
						{
							return pubjs.alert(err && err.message);
						}

						pubjs.alert(LANG('已经添加到下载列表, 请到下载列表里查看'));
					});
				}
				else
				{
					window.location.href = pubjs.data.resolve(url, data.param);
				}
			}
		}
	});
	exports.excelExport = ExcelExport;

	// 报表指定列隐藏显示
	var ToggleColumns = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'titleA': LANG('隐藏指定列'),
				'titleB': LANG('显示指定列'),
				'defaultState': 'hide',// hide：默认隐藏指定列，show：默认显示指定列
				'class': 'M-HighGridToggleColumns mr10 fl'
			});
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var c = this.getConfig();
			var iconClass = '';
			var title = c.titleA;

			if (c.defaultState === 'hide') {
				iconClass = 'uk-icon-chevron-right';
				title = c.titleB;
			}
			if (c.defaultState === 'show') {
				iconClass = 'uk-icon-chevron-left';
				title = c.titleA;
			}

			this.append($('<span title="' + title + '"><i class="'+ iconClass +'"/></span>'));
			this.uiBind(this.getDOM(), 'click', 'eventButtonClick');
		},
		eventButtonClick: function(ev){
			var c = this.getConfig();
			var dom = this.getDOM().find('i');
			var className = dom.attr('class');
			var type = true;

			if (className.indexOf('uk-icon-chevron-left') !== -1) {
				dom.removeClass('uk-icon-chevron-left').addClass('uk-icon-chevron-right');
				dom.attr('title', c.titleB);
				type = false;
			}
			else {
				dom.removeClass('uk-icon-chevron-right').addClass('uk-icon-chevron-left');
				dom.attr('title', c.titleA);
				type = true;
			}

			this.fire('toggleColumns', {'type': type});
			return false;
		},
		initState: function(){
			var dom = this.getDOM().find('i');
			var className = dom.attr('class');
			var type = false;

			if (className.indexOf('uk-icon-chevron-left') !== -1) {
				type = true;
			}
			else {
				type = false;
			}

			this.fire('toggleColumns', {'type': type});
			return false;
		}
	});
	exports.toggleColumns = ToggleColumns;

	// 搜索模块
	var Search  = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'target': null,
				'class': 'M-HighGridSearch fl mr10'
			});

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var el = self.getDOM();
			var c = self.getConfig();
			self.create('search', common.search, {
				'target': el,
				'width': 200,
				'height': 30,
				'hasWordsSearch': c.hasWordsSearch,
				'showResult': true
			});
		},
		reset: function(){
			if(this.$.search){
				this.$.search.reset();
			}
			return this;
		}
	});
	exports.search = Search;

	// 子维度对比
	var Compare = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'grid': null,	// 父highGrid模块
				'target': null,
				'class': 'M-HighGridCompare fl mr10',
				'classAct': 'M-HighGridCompareAct',
				'title': LANG('子维度对比')
			});

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var el = self.getDOM();
			var c = self.getConfig();
			var grid = c.grid;
			var gridConfig = grid.getConfig();

			$([
				'<span>' + c.title + '</span>',
				'<i class="ml5 uk-icon-angle-down"/>',
				'<em/>'
			].join('')).appendTo(el);

			el.attr('title', c.title);

			// 设置子表格弹层的面包屑options
			grid.setConfig('subOptions', gridConfig.compareOptions);

			// 构建panel
			self.createAsync('comparePanel', '@base/common/drop.panel', {
				'addClass': 'deep',
				'options': gridConfig.compareOptions,
				'hasSearch': false,
				'anchor': el,
				'target': grid.getDOM().find('.M-HighGridSubgridCtrl'),
				'width': 100,
				'showResult': false,
				'appendTo': 'popup',
				'hasFireHide': true
			}, function(mod){
				self.uiBind(el, 'click', 'eventSwitch');
			});

		},
		eventSwitch: function(evt, elm){
			var c = this.getConfig();
			var grid = c.grid;
			var gridConfig = grid.getConfig();

			grid.setConfig('subOptions', gridConfig.compareOptions);

			$(elm).toggleClass(c.classAct);
			var comparePanel = this.get('comparePanel');
			if(comparePanel){
				comparePanel.show();
			}
			return false;
		},
		onOptionChange: function(ev){
			var self = this;
			var el = self.getDOM();
			var c = self.getConfig();
			var grid = c.grid;

			if(ev.name == 'comparePanel'){
				el.removeClass(c.classAct);
				if(grid.$selects && grid.$selects.length > 5 || !grid.$selects.length){
					pubjs.alert(LANG('请选择不多于5个选项!'));
					return;
				}
				grid.showSubgrid({
					'data': {},
					'type': ev.param.id,
					'text': ev.param.name
				}, ev.param.id, LANG('对比报表'), 'compare');
			}
			return false;
		},
		onDropPanelHide: function(ev){
			var self = this;
			var c = self.getConfig();
			self.getDOM().removeClass(c.classAct);
			return false;
		},
		reset: function(){
			return this;
		}
	});
	exports.compare = Compare;

	// 筛选栏
	var Filter = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'target': null,
				'class': 'M-HighGridFilter fl mr10',
				'hasFilterButton': true,
				'hasFilterResult': true,	// 是否有筛选栏结果
				'hasFilterSidebar': false,	// 是否有自带sidebar
				'target_filterSidebar': null, // sidebar容器
				'target_result': null,
				'parentTarget': null // 整个列表容器
			});

			this.$flag = 'filter_sidebar_' + util.guid();
			this.$currentSidebar = null; // 当前sidebar
			this.$currentResults = {}; // 当前结果集

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM().attr('data-filter-id', self.$flag);
			var doms = self.$doms = {};

			// 默认构建filter，只是按需隐藏按钮
			if(!c.hasFilterButton){
				el.hide();
			}

			$([
				'<div data-flag="filter">'+LANG('筛选栏')+'<i class="ml5 uk-icon-angle-down"/></div>'
			].join('')).appendTo(el);

			self.uiBind(el, 'click', 'eventButtonClick');

			// 构建result
			if(c.hasFilterResult && c.target_result){
				var resultCon = $([
					'<div class="M-HighGridFilterResultCon">',
						'<a class="clearText">'+LANG('清除')+'</a>',
						'<div class="result"/>',
						'<i class="icon-close clearIcon"></i>',
					'</div>'
				].join('')).hide().appendTo(c.target_result);

				doms.resultCon = resultCon;
				doms.clearIcon = resultCon.find('.clearIcon');
				doms.result = resultCon.find('.result');
				doms.clearText = resultCon.find('.clearText').hide();
				self.uiBind(doms.clearText, 'click', 'eventClearResult');
				self.uiBind(doms.clearIcon, 'click', 'eventClearResult');
				self.uiBind(doms.result, 'click', 'eventClearResult');
			}

			// 构建sidebar控件
			if(c.hasFilterSidebar){
				self.createAsync('filterSidebar', '@layout/v1/sidebar.base', util.extend({
					'target': c.target_filterSidebar
				}, c.sidebar_config), function(mod) {
					if(c.filterAutoFire)
					{
						mod.save();
					}
				});
			}
		},
		eventButtonClick: function(evt, elm){
			this.showPanel();
		},
		showPanel: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM().toggleClass('M-HighGridFilterAct');
			var sidebar;
			var offset = el.parent().offset(); // .M-HighGridHeaderLeft的offset
			var popOffset = util.popOffset();

			// 自带sidebar情况
			if(c.hasFilterSidebar){
				sidebar = c.target_filterSidebar;
				offset = util.offset(el, c.parentTarget);
				if(sidebar){
					// 假如筛选栏显示状态，点击则隐藏
					if(sidebar.is(':visible')){
						sidebar.hide();
						el.removeClass('M-HighGridFilterAct');
						return;
					}

					// 加入标记
					sidebar.attr('data-filter-id', self.$flag);

					sidebar.css({
						'top': offset.top + el.parent().outerHeight() + 7,
						'left': 2
					});
					sidebar.find('.M-sidebarAngle')
							.addClass('M-HighGridTabCustomTriangle')
							.css('left', util.offset(el, c.isOldGrid ? el.parent().parent().parent() : el.parent()).left+el.width()/2);
					sidebar.toggle();
					// 打开聚焦渠道搜索框；
					sidebar.find('.M-sidebarDropCon .result').select();
					self.$currentSidebar = sidebar;
				}
			}else{
				// 使用G-frameBodySidebar的情况，定位筛选栏的位置
				sidebar = el.closest('.M-containerSidebar').find('.G-frameBodySidebar');
				if(sidebar.length){

					// 假如筛选栏显示状态，点击则隐藏
					if(sidebar.is(':visible')){
						sidebar.hide();
						el.removeClass('M-HighGridFilterAct');
						return;
					}

					// 加入标记
					sidebar.attr('data-filter-id', self.$flag);

					sidebar.css({
						'top': offset.top + el.parent().outerHeight() + 7 + popOffset.top,
						'left': offset.left - 2 + popOffset.left
					});

					sidebar.find('.M-sidebarAngle')
							.addClass('M-HighGridTabCustomTriangle')
							.css('left', util.offset(el, el.parent()).left+el.width()/2);

					// 遇到tabSidebar的情况
					if(sidebar.children(':not(.M-sidebar)').length >= 1){
						var tabName = el.closest('div[data-tab]').attr('data-tab');
						self.$currentSidebar = sidebar.children().hide().filter('[data-tab="'+tabName+'"]').toggle();
					}else{
						self.$currentSidebar = sidebar;
					}
					sidebar.toggle();

					// 打开聚焦渠道搜索框；
					sidebar.find('.M-sidebarDropCon .result').select();

				}
			}
		},
		// 响应document回车
		onDocumentEnter: function(ev){
			this.imitateSave();
		},
		// 响应document空格键
		onSidebarSpace: function(ev){
			this.imitateSave();
		},
		// 响应shift+A可快速打开筛选栏
		onDocumentOpenFilter: function(ev){
			var self = this;
			var el = self.getDOM();
			if(el.is(':visible')){
				el.click();
			}
		},
		// 模拟点击确认
		imitateSave: function(){
			var self = this;
			var sidebar = self.$currentSidebar;
			if(sidebar && sidebar.is(':visible')){
				sidebar.find('input[data-type="save"]').click();
			}
		},
		// 清除结果
		eventClearResult: function(evt, elm){
			var self = this;
			// var c = self.getConfig();
			self.$doms.result.empty();
			self.$doms.resultCon.hide();
			self.$currentResults = {};

			self.fire('clearFilterResult', self.$currentSidebar);
			if(self.$currentSidebar){
				self.$currentSidebar.find('.M-sidebarFoot > .reset').click();
				self.$currentSidebar.find('.M-sidebarFoot > .save').click();
			}

			return self;
		},
		// 接收从view模块广播的消息，因为同级不能通讯
		onSidebarFilterResult: function(ev){
			var self = this;
			var el = self.getDOM();

			if(el.is(':hidden')){
				return false;
			}

			if(ev && ev.param){
				util.each(ev.param, function(item, idx){
					self.$currentResults[idx] = item;
				});
			}
			self.updateResult();
			return false;
		},
		// 接收单词或多词搜索的结果反馈
		onWordsSearchResult: function(ev){
			var self = this;
			if(ev && ev.param && ev.param.type){
				self.$currentResults[ev.param.type] = ev.param;
			}
			self.updateResult();
			return false;
		},
		// 更新结果dom
		updateResult: function(){
			var self = this;
			var c = self.getConfig();
			var result = self.$doms.result;
			if(!result){
				return false;
			}
			if(c.parentTarget && c.parentTarget.is(':hidden')){
				return false;
			}
			var html = [];
			util.each(self.$currentResults, function(item){
				if(item && item.desc){
					html.push(item.desc);
				}
			});
			result.html(html).parent()[html.length ? 'show' : 'hide']();

			// 加入黑线
			if(html.length){
				var line = $('<div class="line"/>').appendTo(result);
				// 修正删除线的长度
				line.width(line.width() - 30);
			}
		},
		destroy: function(){

		}
	});
	exports.filter = Filter;

	// 列表特殊处理滚动条
	var Scroller = common.scroller.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {

			});

			this.Super('init', arguments);
		},
		// 输入控制scorller位置
		scrollBy:function(offset, silent){
			var self = this;
			self.scrollTo(self.$info.pos - offset);
			return self;
		},
		// 滚动到指定位置
		scrollTo: function(pos, silent, animate){
			var css = {};
			var self = this;
			var txtPos, txtMargin, i = self.$info, c = self.$config.get();
			if (c.dir == 'H'){
				txtPos='left'; txtMargin='marginLeft';
			}else {
				txtPos='top'; txtMargin='marginTop';
			}
			pos = Math.min(0, Math.max(i.max, pos));
			if (pos == i.pos) {return;} // 位置没有变化, 不触发事件


			i.pos = pos;
			i.bPos = Math.floor(i.bMax * pos / i.max);
			// 重新校正bPos
			i.bPos = self.calculateStep();

			self.$ctr.css(txtPos, i.bPos);
			pos = Math.floor(i.max * i.bPos / i.bMax);

			if (c.type !== 'manual'){
				css[txtMargin] = pos + i.init;
				if (animate > 0) {
					c.content.animate(css, animate);
				} else {
					c.content.css(css);
				}
			}
			if (!silent) {
				// self.fire('scroll', i);
				self.fire('scrollFollowStep', -pos);
			}
			return self;
		},
		// 鼠标滚轮回调处理事件
		eventWheel: function(evt){
			var self = this;

			// mac暂时不能滚动列表左边
			if(navigator.userAgent.indexOf('Mac OS X') > 0){
				if(self.getDOM().is(':hidden')){
					return false;
				}
			}

			var dir = ('wheelDelta' in evt ? (evt.wheelDelta<0) : (evt.detail>0));
			var txtPos, txtMargin, i = self.$info, c = self.$config.get();
			if (c.dir == 'H'){
				txtPos='left'; txtMargin='marginLeft';
			}else {
				txtPos='top'; txtMargin='marginTop';
			}
			var pos;
			if(navigator.userAgent.indexOf('Mac OS X') > 0){
				pos = i.pos + evt.wheelDelta;	// 修正苹果电脑滚动快速问题
			}else{
				var step = self.calculateWheelStep(dir);
				// 控制步速
				pos = (+i.pos||0) + (dir ? -step : step);
				// pos = i.pos + (dir ? -c.step : c.step);
			}
			pos = Math.min(0, Math.max(i.max, pos));
			if (pos == i.pos) {return;} // 位置没有变化, 不触发事件


			i.pos = pos;
			i.bPos = Math.floor(i.bMax * pos / i.max);

			self.$ctr.css(txtPos, i.bPos);
			if (c.type !== 'manual'){
				c.content.css(txtMargin, pos + i.init);
			}

			// self.fire('scrollFollowStep', -pos);
			self.fire('scroll', i);
		},
		eventMouseMove: function(evt){
			var self = this;
			var i = self.$info;
			var m = self.$mouse;
			var c = self.$config.get();
			var txtPage, txtPos, txtMargin;

			if (evt.type == 'touchmove'){
				var touch = util.find(evt.touches, m.identifier, 'identifier');
				if (!touch){
					return;
				}
				evt.screenX = touch.screenX;
				evt.screenY = touch.screenY;
			}

			if (c.dir == 'H'){
				txtPage='screenX'; txtPos='left'; txtMargin='marginLeft';
			}else {
				txtPage='screenY'; txtPos='top'; txtMargin='marginTop';
			}
			i.bPos = Math.max(0, Math.min(i.bMax, m.pos + evt[txtPage] - m[txtPage]));
			// 重新校正bPos
			i.bPos = self.calculateStep();

			self.$ctr.css(txtPos, i.bPos);
			var pos = Math.floor(i.max * i.bPos / i.bMax);
			if (pos == i.pos){ return; }

			i.pos = pos;
			if (c.type !== 'manual'){
				// pos是一个负数
				c.content.css(txtMargin, pos + i.init);
			}
			self.fire('scroll', i);
		},
		// 更新步幅
		updateStep: function(steps){
			var stepArr = util.clone(steps); // 克隆
			var self = this;
			var info = self.$info; // 滚动信息对象
			var originStepArr = self.$originStepArr = stepArr; // 记录原始步幅数据
			var VstepArr = self.$VstepArr = []; // 纵向用转换后的步幅集合
			var HstepArr = self.$HstepArr = []; // 横向用转换后的步幅集合
			self.$isSameHeight = true; // 高度是否都一样

			if(stepArr && stepArr.length){
				stepArr.unshift(0);
				var total;
				util.each(stepArr, function(item, idx){
					if(!total){
						total = item;
					}else{
						total += item;
					}
					HstepArr.push(-total * info.bMax / info.max);
					VstepArr.push(total);
				});
			}

			for(var i=1; i<originStepArr.length-1; i++){
				if(originStepArr[i] != originStepArr[i+1]){
					self.$isSameHeight = false;
					break;
				}
			}

			return self;
		},
		// 计算滑轮滚动的步幅
		calculateWheelStep: function(dir){
			var self = this;
			var info = self.$info;
			var arr = self.$originStepArr;
			var arr2 = self.$VstepArr;

			if(!self.$isSameHeight){
				if(arr && arr.length){
					var val = 0;
					for(var i=0; i<arr.length; i++){
						if(!info.pos){
							val = arr[i+1];
							break;
						}

						if(dir){
							// 先转换一下pos，让pos符合比例
							if(Math.abs(info.pos) < arr2[1]){
								info.pos = -arr2[1];
							}
							if(Math.abs(info.pos) > arr2[i+1] && Math.abs(info.pos) < arr2[i+2]){
								info.pos = -arr2[i+2];
							}
							if(Math.abs(info.pos) >= arr2[i+1] && Math.abs(info.pos) < arr2[i+2]){
								val = arr[i+2];
								break;
							}
						}else {
							// 先转换一下pos，让pos符合比例
							if(Math.abs(info.pos) > arr2[i+1] && Math.abs(info.pos) < arr2[i+2]){
								info.pos = -arr2[i+2];
							}

							if(Math.abs(info.pos) >= arr2[i+1] && Math.abs(info.pos) < arr2[i+2]){
								val = arr[i+1];
								break;
							}else{
								val = arr[1];
							}
						}
					}
					return val;
				}else{
					return 0;
				}
			}else{
				// 列表单元格高度都一样的时候
				for(var j=0; j<arr2.length; j++){
					if(Math.abs(info.pos) > arr2[j+1] && Math.abs(info.pos) < arr2[j+2]){
						// 更新pos点
						info.pos = -arr2[j+2];
						break;
					}
				}
				// 返回随便一个高度
				return arr[1];
			}
		},
		// 计算步幅
		calculateStep: function(){
			var self = this;
			var info = self.$info;
			var arr = self.$HstepArr;
			if(arr && arr.length){
				var val;
				for(var i=0; i<arr.length; i++){
					if(info.bPos > arr[i] && info.bPos < arr[i+1]){
						val = arr[i+1];
						if(val > info.bMax){
							val = info.bMax;
						}
						break;
					}else{
						val = info.bPos||0;
					}
				}
				return val;
			}else{
				return info.bPos||0;
			}
		},
		getDOM: function(){
			return this.$bar;
		}
	});
	exports.scroller = Scroller;

	// 渲染函数
	function _formatCol(method) {
		// 函数
		var format;
		if(util.isFunc(method)){
			format = method;
		}
		// 字符串
		else if(util.isString(method)){
			// 自定义函数
			if(util.isFunc(this[method])){
				format = this[method];
			}
			// 从label.js文件中获取渲染函数
			else{
				format = labels[method]
			}
		}

		return format;
	}

});