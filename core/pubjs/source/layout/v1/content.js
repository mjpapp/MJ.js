define(function(require,exports) {
	var $ = require('jquery');
	var pubjs = require('pubjs');
	var util = require('util');
	var view = require('@base/view');

	// 侧边栏布局
	var Sidebar = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'class': 'M-containerSidebar',
				'addClass': '',
				'hasSidebar': true		// 是否有侧栏
			});

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM().addClass(c.class).addClass(c.addClass);

			self.$container = $('<div class="G-frameBodyContainer"/>').appendTo(el);
			self.$sidebar = $('<div class="G-frameBodySidebar"/>').appendTo(el);

			if(!c.hasSidebar){
				self.$sidebar.hide();
			}

			this.updateContainer();
		},
		// 创建业务模块
		createBusiness: function(name, uri, param, callback){
			if(util.isFunc(param)){
				callback = param;
				param = null;
			}

			var mod = this.get(name);
			if(!mod){
				var config = $.extend({}, {
					target: this.$container,
					targetSidebar: this.$sidebar
				}, param);

				this.createAsync(name, uri, config, function(mod){
					if(util.isFunc(callback)){
						callback(mod, false);
					}
				});
			}else{
				if(util.isFunc(callback)){
					callback(mod, true);
				}
			}
		},
		onWindowResize: function(ev){
			this.updateContainer();
		},
		// 更新内容区高度
		updateContainer: function(){
			var self = this;
			// var c = self.getConfig();
			// if(c.hasSidebar){
			// 	// 浏览器高度
			// 	var frame = $(window).height();
			// 	// 头部高度
			// 	var header = $('.G-frameHead').height();
			// 	self.$container.outerHeight(frame - header - 50);
			// }
			return self;
		}
	});
	exports.sidebar = Sidebar;

	// 原始滚动布局
	var Scroll = Sidebar.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'hasSidebar': false
			});

			this.Super('init', arguments);
		}
	});
	exports.base = exports.scroll = Scroll;

	// tab侧边栏布局
	var TabSidebar = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'class': 'M-containerSidebar',
				'addClass': '',
				'hasSidebar': true
			});

			this.$options_element = {};
			this.$current_tab = ''; // 当前tab

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM().addClass(c.class).addClass(c.addClass);


			self.$container = $('<div class="G-frameBodyContainer"/>').appendTo(el);
			self.$sidebar = $('<div class="G-frameBodySidebar"/>').appendTo(el).hide();
			// info层
			self.$info = $('<ul class="G-frameBodyInfo"/>').appendTo(self.$container);
			// tab层
			self.$tab = $('<ul class="G-frameBodyTab tab mb15"/>').appendTo(self.$container);

			if(!c.hasSidebar){
				self.$sidebar.hide();
			}

			this.updateContainer();

			this.uiProxy(self.$tab, 'li', 'click', 'eventSwitchTab');
		},
		// 创建业务模块
		createBusiness: function(name, uri, param, callback){
			if(util.isFunc(param)){
				callback = param;
				param = null;
			}
			var self = this;

			if(param.contentType == 'info'){
				// 构建普通子元素
				var mod = self.get(name);
				if(!mod){
					var config = $.extend({}, {
						target: self.$info
					}, param);
					self.createAsync(name, uri, config, function(mod){
						if(util.isFunc(callback)){
							callback(mod, false);
						}
					});
				}else{
					if(util.isFunc(callback)){
						callback(mod, true);
					}
				}
			}else{
				// 构建tab的子元素；
				var conGroup = self.buildTabItem(name, param);

				// 已构建过模块，执行回调
				if(self.get(name) && self.$current_tab == name){
					var conf = self.$options_element[name];

					conf.callback = callback;
					conf.param = util.extend(conf.param, param);

					if(util.isFunc(conf.callback)){
						conf.callback(self.get(name), true);
					}
				}

				if(!conGroup){
					return false;
				}

				// 先更新数据
				self.$options_element[name] = {
					'name': name,
					'uri': uri,
					'param': $.extend({}, {
						'tab': conGroup['tab'],
						'target': conGroup['container'],
						'targetSidebar': conGroup['sidebar']
					}, param),
					'callback': callback
				}

				// 初始化状态, 默认显示第一个
				self.eventSwitchTab(null, self.$tab.find('li:first'));
			}
		},
		buildTabItem: function(name, param){
			var self = this;

			if(self.$tab.find('[data-tab="'+name+'"]').length){
				return false;
			}

			// 构建tab的item
			var tab = $([
				'<li>',
					'<a>' + (param && param.tabText || '') + '</a>',
				'</li>'
			].join('')).attr({
				'data-tab': name || ''
			}).appendTo(self.$tab);

			// 构建对应的container容器
			var container = $('<div/>').attr({
				'data-tab': name || ''
			}).appendTo(self.$container);

			// 构建对应的sidebar容器
			var sidebar = $('<div/>').attr({
				'data-tab': name || ''
			}).appendTo(self.$sidebar).height('100%');

			// 返回con组合对象
			return {
				tab: tab,
				container: container,
				sidebar: sidebar
			};
		},
		eventSwitchTab: function(evt, elm){
			var self = this;
			var c = self.getConfig();
			var el = $(elm);

			if(!el.hasClass('active')){
				el.siblings('li').removeClass('active');
				el.addClass('active');

				// 模块名称
				var name = el.attr('data-tab');

				self.$container.children('div').hide().filter('div[data-tab="'+name+'"]').show();
				self.$sidebar[c.hasSidebar ? 'hide' : 'hide']().children('div').hide()
					.filter('[data-tab="'+name+'"]').show();

				var mod = self.get(name);
				var conf = self.$options_element[name];

				// 点击的时候才构建模块
				if(!mod){
					self.createAsync(name, conf.uri, conf.param, function(mod){
						if(util.isFunc(conf.callback)){
							conf.callback(mod, false);
						}
					});
				}else{
					if(util.isFunc(conf.callback)){
						conf.callback(mod, true);
					}
				}

				self.$current_tab = name;

				self.cast('tabChange');
				self.fire('tabChange');
			}

			return false;
		},
		onWindowResize: function(ev){
			this.updateContainer();
		},
		// 更新内容区高度
		updateContainer: function(){
			var self = this;
			// var c = self.getConfig();
			// if(c.hasSidebar){
			// 	// 浏览器高度
			// 	var frame = $(window).height();
			// 	// 头部高度
			// 	var header = $('.G-frameHead').height();
			// 	self.$container.outerHeight(frame - header - 50);
			// }
			return self;
		}
	});
	exports.tabSidebar = TabSidebar;

});