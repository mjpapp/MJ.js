define(function(require,exports) {
	var pubjs = require('pubjs');
	var $ = require('jquery');
	var util = require('util');
	var view = require('@base/view');
	var common = require('@base/common/base');

	// 侧边栏
	var Sidebar = view.container.extend({
		init:function(config){
			config = pubjs.conf(config, {
				'class': 'M-sidebar',
				/**
				 * 子模块:
				 *	1、数组形式
				 *		[{name: '', uri:'', config:{}}];
				 *	2、对象形式
				 *		{name: uri}
				 */
				'items': [],
				'watch': 200,
				'height': 420 // 侧栏高度
			});

			this.$sidebarShow = true; // 是否显示侧栏

			this.$filterResult = {}; // 过滤结果集合

			this.Super('init', arguments);
		},
		afterBuild:function(){
			var self = this;
			var el = self.getDOM();
			var c= self.getConfig();

			$([
				'<div class="M-sidebarAngle">',
				'</div>',
				'<div class="M-sidebarWrap">',
					'<div class="M-sidebarContent"/>',
				'</div>',
				'<div class="M-sidebarPopwin"/>',
				'<div class="sidebar-collapse angle">',
					'<b class="sidebar-collapse-angleTop"/>',
					'<a class="sidebar-collapse-toggle">',
						'<i class="left uk-icon-angle-left"/>',
						'<i class="right uk-icon-angle-right"/>',
					'</a>',
					'<b class="sidebar-collapse-angleBottom"/>',
				'</div>',
				'<div class="M-sidebarFoot">',
					'<span class="help">'+LANG('“单选项可双击快速查看”')+'</span>',
					'<span class="reset">'+LANG('恢复默认')+'</span>',
					'<input type="button" data-type="cancel" value="'+LANG('取消')+'" class="ml20 btn btn-default cancel"/>',
					'<input type="button" data-type="save" value="'+LANG('确认')+'" class="ml10 btn btn-success save"/>',
				'</div>'
			].join('')).appendTo(el);

			var doms = self.$doms = {
				body: el.closest('.M-containerSidebar'),
				body_name: el.closest('.M-containerSidebar').attr('container-name'),
				wrap: el.find('.M-sidebarWrap'),
				content: el.find('.M-sidebarContent'),
				popwin: el.find('.M-sidebarPopwin'),
				sidebarFlex: el.find('.sidebar-collapse'),
				foot: el.find('.M-sidebarFoot')
			};

			if(c.height){
				doms.wrap.height(c.height);
			}

			var items = c.items;

			// 若是对象，转成数组
			if(util.isObject(items) && !util.isArray(items)){
				var trans = [];
				util.each(items, function(item, idx){
					if(item){
						trans.push({name: idx, uri: item});
					}
				});
				items = trans;
			}
			self.$items = items;

			// 按序创建子项目
			if(util.isArray(items)){
				util.each(items, function(mod, idx){
					if(mod){
						var html =  $('<div data-child="' + mod.name + '" class="M-sidebarLayout"/>').appendTo(doms.content);
						mod.$el = html;
						if(mod.uri){
							self.createDelay(mod.name, mod.uri,
								util.extend(
									{},
									mod.config,
									{'target': html, 'popTarget': doms.popwin}
								)
							);
						}
					}
				});

				self.createDelay(true, function(){
					// el.find('.M-sidebarLayout').addClass();
				});
			}else{
				pubjs.error(LANG('数据格式不正确'));
			}

			self.uiBind(doms.sidebarFlex, 'click', 'eventToggleSidebar');

			self.uiBind(doms.foot.find('.reset'), 'click', 'eventReset');
			self.uiBind(doms.foot.find('input[data-type]'), 'click', 'eventInputClick');


			// 初始化右边导航显隐状态
			var status = JSON.parse(pubjs.storage(doms.body_name + '_sidebarShow'));
			self.updateSidebarStatus(status === null || status);

			if(util.isMobile()){
				//构建滚动条
				doms.wrap.css('overflow-y', 'auto');
			}else{
				self.create('scroller', common.scroller, {
					'target': doms.wrap,
					'content': doms.content,
					'watch': 200,
					// 'offset': 15,
					'dir': 'V'

				});
			}

			self.uiBind(el, 'mouseup tap', function(ev){
				self.$timeStamp = ev.timeStamp;
				// return false;
			});

			self.uiBind(document, 'mouseup tap', function(ev, elm){
				// 跳过筛选按钮
				if($(ev.target).attr('data-flag') == 'filter'){
					return;
				}
				if($(ev.target).parents('.M-sidebar').length){
					return;
				}
				if(ev.timeStamp !== self.$timeStamp){
					self.realHide();
				}
			});

			// 单选radio可双击确认
			self.uiProxy(el, 'div[class="M-sidebarRadio"] .content>label', 'dblclick', function(ev){
				self.save();
			});
		},
		eventToggleSidebar: function(evt, elm){
			// this.updateSidebarStatus(!this.$sidebarShow);
			return false;
		},
		// 恢复默认
		eventReset: function(evt, elm){
			var self = this;
			util.each(self.$items, function(mod){
				if(mod){
					if(self.$[mod.name]){
						self.$[mod.name].reset();
					}
				}
			});

			return false;
		},
		eventInputClick: function(evt, elm){
			var type = $(elm).attr('data-type');
			switch (type){
				case 'save':
					this.save();
					break;
				case 'cancel':
					this.realHide();
					break;
			}
		},
		// 更新侧栏状态
		updateSidebarStatus: function(status){
			// var self = this;
			// var doms = self.$doms;

			// doms.body.toggleClass('body-sidebar-expanded', status)
			// 		.toggleClass('body-sidebar-collapsed', !status);

			// pubjs.storage(doms.body_name + '_sidebarShow', status);
			// pubjs.core.cast('toolsToggle', status);
			// self.cast('toolsToggle', status);
			// self.$sidebarShow = status;
			// return self;
		},
		onWindowResize: function(ev){
			if(this.$.scroller){
				this.$.scroller.update();
			}
		},
		// 隐藏
		realHide: function(){
			var el = this.getDOM();
			el.parent().hide();
			// 找到最近的sidebar容器
			var parent = el.closest('.G-frameBodySidebar');
			var flag = parent.attr('data-filter-id') || el.parent().attr('data-filter-id');
			// 根据标记找到highgrid中对应的筛选栏按钮
			if(flag){
				var filter = $('.M-HighGridFilter[data-filter-id='+flag+']');
				// 移除高亮
				filter.removeClass('M-HighGridFilterAct');
			}
			parent.hide();
			return this;
		},
		// 显示子项
		showItem: function(name) {
			var item = util.find(this.$items, name, 'name');

			if (item) {
				item.$el.show();
			}

			return this;
		},
		// 隐藏子项
		hideItem: function(name) {
			var item = util.find(this.$items, name, 'name');

			if (item) {
				item.$el.hide();
			}

			return this;
		},
		// 接受所有的筛选变化
		onSidebarFilterGroup: function(ev){
			// 记录在结果中
			this.$filterResult[ev.name] = ev.param;

			// 其他父模块可继续接收变化onSidebarFilterGroup事件
			// return false;
		},
		// 响应点击确定
		onSidebarEnter: function(ev){
			this.save();
			return false;
		},
		// 确定
		save: function(){
			var self = this;

			// 给子模块发送保存的同步消息
			util.each(this.$, function(mod, name) {
				self.send(mod, 'sidebarSave');
			});

			// 广播到具体页面进行参数重构；
			self.fire('sidebarFilter', self.$filterResult);
			self.fire('sidebarFilterResult', self.$filterResult);
			self.realHide();
			return self;
		}
	});
	exports.base = Sidebar;

});