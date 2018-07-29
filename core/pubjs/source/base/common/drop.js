define(function( require, exports ){
	var $ = require('jquery');
	var pubjs = require('pubjs');
	var util  = require('util');
	var view  = require('@base/view');
	var common = require('@base/common/base');

	// 新下拉面板控件
	var Panel = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'class': 'M-dropPanel',
				'addClass': '',
				'width': null,
				'height': null,
				'min-height': null,
				'options': null, // 选项对象<数组>
				'value': null, // 初始化默认选中值id，多选暂不支持默认值
				'all': null, // 默认全选项对象{}

				'option_render': null, // 选项内容渲染函数

				'name': 'name', // 显示字段名
				'key': 'id', // 显示字段id
				'skey': 'subs', // 子层级对象

				'searchField': [], // 增加可搜索的字段，默认是name和key

				'default_hide': true, // 默认隐藏
				'hasFireHide': false, // 是否发送隐藏广播

				'offsetTop': 3,	// Top偏移量(用于调整位置)
				'offsetLeft': 0, // Left偏移量
				'option_height': 30, // 单个选项高度和行高
				'option_line_height': 0,
				'option_class': '', // 选项样式

				'sub_height': 300,	// 子层高度

				'hasSearch': true, // 是否有搜索框
				'showResult': true, // 显示选中项
				'searchHolder': LANG('请输入搜索内容'),

				'hasArrow': false, // 是否有三角箭头
				'arrowOffsetTop': 0, // arrow Top偏移量
				'arrowOffsetLeft': 0, // arrow Left偏移量

				'anchor': null, // 定位锚点
				'z-index': 1,
				'appendTo': '', // 插入位置, null或absolute默认为父容器| relative | popup

				'toolbar': {}, // 自定义工具栏

				'hasMulti': false, // 是否支持多选

				'canSelectParent': false // 多级情况下了选择父级
			});

			var c = config.get();
			this.$options = c.options || []; // 记录数据数组

			// 加入默认全选项
			this.addAll(c.all);

			this.$data = null; // 记录选中的选项

			this.$hasMatch = true; // 记录搜索是否有匹配项；

			// 方向键操作序号
			this.$index = -1;

			this.$lastSearchVal = ''; // 记录上一次的search值

			this.$flag = ''; // 模块标记

			this.$currentValue = c.value;	// 当前value

			this.$subs_opts = {};	// 子数据记录
			this.$subs_id = 1;	// sid递增
			this.$subs_level = 0;	// 层级
			this.$subs_sels = [];	// 选择的id值
			this.$subs_hide = {};	// 存放定时器
			this.$subs_show_queue = [];	// 显示的子dom队列
			this.$subs_data = [];	// getData的值

			// 处理可搜索字段，默认加入name和key的配置
			if(!util.isArray(c.searchField)){
				c.searchField = [];
			}
			c.searchField.unshift(c.name, c.key);

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			var doms = self.$doms = {};

			// 设置默认隐藏
			if(c.default_hide){
				el.hide();
			}

			// 设置样式
			if(c.addClass){
				el.addClass(c.addClass);
			}

			if(c.width){
				el.outerWidth(c.width);
			}
			if(c.height){
				el.outerHeight(c.height);
			}
			if(c['z-index']){
				el.css('z-index', c['z-index']);
			}

			// 设置arrow
			if(c.hasArrow){
				doms.arrow = $([
					'<div class="arrowCon">',
						'<i class="arrow"/>',
					'</div>'
				].join('')).appendTo(el);
			}

			// 构建search的容器
			doms.searchCon = $('<div class="searchCon"/>').appendTo(el);

			// 构建list的容器
			doms.listCon = $([
				'<div class="listCon">',
					'<ul/>',
				'</div>'
			].join('')).appendTo(el);
			doms.con = doms.listCon.find('>ul');

			// 多级设置
			doms.subListCon = $('<div class="subListCon"/>').appendTo(el);

			// 自定义工具栏
			doms.toolbarCon = $('<div class="toolbarCon"/>').appendTo(el);

			if(c.toolbar && c.toolbar.uri){
				var tool = c.toolbar;
				self.createAsync(tool.modName || 'toolbar', tool.uri, util.extend({
					target: doms.toolbarCon
				}, tool.config));
			}

			// 构建搜索框
			self.buildSearch();

			// 构建提示
			self.buildTips();

			// 如果默认有options，构建list
			if(self.$options && self.$options.length){
				self.buildList();
			}

			self.create('scroller', common.scroller, {
				'target': doms.listCon,
				'content': doms.con,
				'watch': 200,
				'dir': 'V'
			});

			if(util.isMobile()){
				doms.listCon.css('overflow-y', 'auto');
			}

			// 绑定panel隐藏事件
			self.uiBind(el, 'mouseup tap', function(ev){
				self.$timeStamp = ev.timeStamp;
			});

			self.uiBind(document, 'mouseup tap', function(ev){
				if(ev.timeStamp !== self.$timeStamp){
					self.hide();
					self.fire('destroyPanel');
				}
			});

			self.uiProxy(el, '.option > a', 'click', self.eventClickSelect);

			self.uiProxy(el, '.option > a', 'mouseenter mouseleave', self.eventOptionMouse);

			// 设置默认选项
			self.setValue(c.value);
		},
		// 构建search
		buildSearch: function(){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();
			// var li = $('<li class="search"/>').appendTo(doms.con)[c.hasSearch ? 'show' : 'hide']();

			var box = $([
				'<div class="searchBox">',
					'<input type="text" class="input" placeholder="'+ c.searchHolder +'">',
					'<i class="undo"/>',
					'<i class="do"/>',
				'</div>'
			].join('')).appendTo(doms.searchCon)[c.hasSearch ? 'show' : 'hide']();

			doms.searchCon = box;
			doms.search = box.find('.input');
			doms.btnSearch = box.find('.do');
			doms.btnCancel = box.find('.undo');

			// 绑定事件
			self.uiBind(doms.search, 'keyup', 'eventSearchInput');
			self.uiBind(box.find('.undo'), 'click', 'eventSearchInput');
			self.uiBind(box.find('.undo'), 'click', 'cancel',  'eventSearchInput');

			// 处理移动端ios中文输入的问题
			// if(util.isMobile()){
				self.$watchMobileInput = setInterval(function(){
					if(self.$lastSearchVal != doms.search.val()){
						self.eventSearchInput({});
					}
				}, 300);
			// }
		},
		// 构建搜索不匹配提示和没有数据提示
		buildTips: function(){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();
			var el = self.getDOM();

			// 搜索不匹配提示
			doms.matchTips = $([
				'<li class="tips matchTips">',
					'<a href="#" class="text-truncate">'+LANG('没有匹配')+'</a>',
				'</li>'
			].join('')).appendTo(doms.con);

			// 没有数据提示
			doms.noDataTips = $([
				'<li class="tips noDataTips">',
					'<a href="#" class="text-truncate">'+LANG('没有数据')+'</a>',
				'</li>'
			].join('')).appendTo(doms.con);

			if(c.option_height){
				el.find('.tips').outerHeight(c.option_height).css({
					'line-height': c.option_height + 'px'
				});
			}
		},
		// 构建list
		buildList: function(){
			var self = this;

			// 循环构建
			util.each(self.$options, function(item, idx){
				self.buildOption(item, idx);
			});

			// 更新doms.list
			self.updateList();
		},
		// 更新doms.list;
		updateList: function(){
			var self = this;
			var el = self.getDOM();
			var doms = self.$doms;
			doms.list = el.find('.option');
			doms.noDataTips.toggle(self.$options && !self.$options.length);
			return self;
		},
		// 单独构建option
		buildOption: function(opt, id, sid){
			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;
			var name = LANG(opt[c.name]);
			opt.flag = self.$flag;

			var li = $('<li class="option"/>').attr({
				'title': name
			});
			var dom = $('<a href="#" class="text-truncate"/>').attr({
				'data-id': opt[c.key] || opt._id || opt.id,
				'data-text': name,
				'href': opt.href || '#',
				'target': opt.href && opt.target ? opt.target : ''
			}).appendTo(li).addClass(opt.disabled ? 'is-disabled' : '');

			// 构建子项
			var subData = opt[c.skey];
			var subCon = '';
			if(subData && util.isArray(subData) && subData.length){
				var subs_id = self.$subs_id++;
				var subs_level = self.$subs_level++;
				$('<i class="uk-icon-angle-right subIcon"/>').appendTo(li);
				li.addClass('hasSub');
				dom.attr('data-subs', subs_id);
				subCon = $([
					'<div class="subs">',
						'<div class="subsCon">',
							'<ul/>',
						'</div>',
					'</div>'
				].join('')).attr({
					'data-sid': subs_id,
					'data-level': subs_level
				}).appendTo(doms.subListCon);

				// 准备子列表选项配置
				var subs_opts = self.$subs_opts[subs_id] = {
					'id': dom.attr('data-id'),
					'anchor': dom,
					'options': subData,
					'data': opt,
					'panel': subCon,
					'level': subs_level,
					'list': subCon.find('ul'),
					'con': subCon.find('.subsCon'),
					'arrow': $('<div class="subArrow"/>').appendTo(subCon)
				}

				self.buildSub(subData, subs_id);

				// 构建子层滚动条
				if(c.sub_height && subData.length*c.option_height > c.sub_height){
					subs_opts.con.height(c.sub_height);

					if(util.isMobile()){
						subs_opts.con.css('overflow-y', 'auto');
					}else{
						var scrollName = 'scroller' + subs_id;
						if(self.get(scrollName)){
							self.get(scrollName).destroy();
						}
						self.create(scrollName, common.scroller, {
							'target': subs_opts.con,
							'content': subs_opts.list,
							'watch': 200,
							'dir': 'V'
						});
					}
				}
			}

			if(c.hasMulti){
				$('<em class="icon-checkbox-in multiIcon font-primary"/>').appendTo(li);
			}

			// 如果是分组标题，加入分组标题样式；
			if(opt.group){
				dom.addClass('groupTitle is-disabled');
			}

			// 如果有渲染，渲染option
			if(c.option_render){
				var html = c.option_render(id, opt, dom);
				if(html){
					dom.html(html);
				}
			}else{
				dom.text(name);
			}

			if(c.option_height){
				li.outerHeight(c.option_height).css({
					'line-height': c.option_line_height ? c.option_line_height + 'px': c.option_height + 'px'
				});
			}

			if(c.option_class){
				li.addClass(c.option_class);
			}

			// 判断是否子层
			if(!sid){
				li.appendTo(doms.con);
			}else{
				li.appendTo(doms.subListCon.find('div[data-sid="'+sid+'"]').find('ul'));
			}

			return self;
		},
		buildSub: function(opt, sid){
			var self = this;
			// var c = self.getConfig();

			util.each(opt, function(item, idx){
				self.buildOption(item, idx, sid);
			});
			self.$subs_level--;

			return self;
		},
		showSubOption: function(sid){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			var sub, anchor;

			// 取消延迟隐藏
			self.hideSubOption(false);

			// 查找子面板和锚点
			var opts = self.$subs_opts[sid];
			if(opts){
				sub = opts.panel;
				anchor = opts.anchor;

				// 清除已显示的
				while (self.$subs_show_queue.length > opts.level){
					self.$subs_show_queue.pop().hide();
				}

				// 计算位置
				if(!anchor.length || !el.length){
					return;
				}
				var offset = util.offset(anchor, el);
				var w = anchor.outerWidth();

				// 获取滚动条宽度
				var scroll = anchor.parents('ul').next('.M-commonScroller');
				var scrollWidth = 0;
				if(scroll.is(':visible')){
					scrollWidth = scroll.width();
				}

				var diff = 0;
				if(opts.options.length > 1){
					diff = sub.height()/2 - c.option_height/2;
				}

				// 移动端位差, 原生offsetTop取值不同所致
				var mobile_diff = 0;
				if(util.isMobile()){
					var ul = anchor.parents('ul');
					mobile_diff = ul.parent().offset().top - ul.offset().top;
				}

				if(sub && sub.length && sub.is(':hidden')){
					// 定位显示子面板
					sub.css({
						'left': offset.left + w + scrollWidth,
						'top': offset.top - mobile_diff - diff
					}).show();

					// 放入显示队列中
					self.$subs_show_queue[opts.level] = sub;
				}
			}
		},
		hideSubOption: function(mode) {
			var self = this;
			var doms = self.$doms;
			var c = self.$subs_hide;

			if(mode === true){
				// 隐藏已经显示的
				while (self.$subs_show_queue.length >0){
					self.$subs_show_queue.pop().hide();
				}

			}else if(mode === false){
				// 取消隐藏
				if (c.tid){ clearTimeout(c.tid); }
			}else if(mode === 'all'){
				// 全部隐藏
				doms.subListCon.children().hide();
			}else{
				// 延迟隐藏
				c.sid = mode;
				if (c.tid){ clearTimeout(c.tid); }
				c.tid = self.setTimeout('hideSubOption', 500, true);
				return;
			}
			return self;
		},
		// 显隐子层事件
		eventOptionMouse: function(evt, elm){
			var self = this;
			// 子菜单选项处理
			var a = $(elm);
			var id = a.attr('data-id');
			var sid = +a.attr('data-subs');

			// 子层状态下的子sid
			var data_sid = a.parents('div.subs').attr('data-sid');
			var data_level = a.parents('div.subs').attr('data-level');

			// 鼠标进入子层
			if(data_sid){
				self.hideSubOption(false);
				self.$subs_sels[+data_level+1] = id;
			}

			// 在第一层
			if(!data_sid){
				self.$subs_sels = [];
				if(sid){
					self.$subs_sels[0] = id;
				}
			}

			// 在中间层
			if(sid && data_sid){}

			// 在最后一层
			if(!sid && data_sid){
				while (self.$subs_show_queue.length-1 > a.parents('div.subs').attr('data-level')){
					self.$subs_show_queue.pop().hide();
				}

				self.$subs_sels.pop();
			}

			if(sid){
				switch (evt.type){
					case 'mouseenter':
					if(a.is(':visible')){
						self.showSubOption(sid);
					}
					break;
					case 'mouseleave':
						self.hideSubOption(sid);
					break;
				}
			}
		},
		// 输入搜索事件
		eventSearchInput: function(evt, elm){
			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;
			var options = self.$options;
			var searchField = c.searchField;
			var val = ''; // 输入值
			var matchs = []; // 有匹配数组

			// 没有list的时候，不搜索
			if(!doms.list){
				return;
			}

			var visible_list = doms.list.filter(':visible').removeClass('highlight'); // 可见的list组
			var max = visible_list.length; // 最大数量

			if(evt.data == 'cancel'){
				doms.search.val('');
			}else{
				val = util.trim(doms.search.val());
				self.$lastSearchVal = val;
			}

			switch(evt.keyCode){
				case 37:							// 向左方向键

					break;
				case 39:							// 向右方向键

					break;
				case 38:							// 向上方向键
					self.$index--;
					// 向上已到顶部
					if(self.$index < 0){
						self.$index = max -1;
					}
					self.move(visible_list);
					break;
				case 40:							// 向下方向键
					self.$index++;

					// 向下已到底部
					if(self.$index >= max){
						self.$index = 0;
					}

					self.move(visible_list);
					break;
				case 13:							// 回车键
					if(self.$index == -1){
						self.$index = 0;
					}
					// 模拟点击
					self.eventClickSelect(null, visible_list.eq(this.$index).find('>a'));
					break;
				default:							// 其他输入

					// 在没有搜索框的情况下，一输入的时候就把$data设置为null；
					if(!c.hasSearch){
						// self.$data = null;
					}

					// ESC键的时候先清除
					if(evt.keyCode == 27){
						doms.search.val('');
						val = '';
					}

					self.toggleSeatchIcon(val === '');

					// 重置变量
					self.$index = -1;

					// 输入的时候，先清除act
					if(!c.hasMulti){
						// doms.list.removeClass('act');
						if(c.type == 'text' && val === ''){
							doms.list.removeClass('act');
						}
					}

					util.each(options, function(item, idx){
						var dom = doms.list.eq(idx);
						var condition = false; // 搜索条件

						util.each(searchField, function(field){
							var result = LANG(String(item[field] || '').toLowerCase());
							// 如果存在合乎搜索条件的，记录为true
							if(result.indexOf(val.toLowerCase()) >= 0){
								condition = true;
								matchs.push(1);
							}
						});
						dom.toggle(condition);
					});

					// 没有数据的时候，不显示匹配提示
					if(options.length){
						doms.matchTips.toggle(!matchs.length);
					}else{
						doms.matchTips.hide();
					}

					break;
			}
		},
		// 点击item事件
		eventClickSelect: function(evt, elm){
			// 取消默认行为
			// evt.preventDefault();
			// evt.stopPropagation();

			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;
			// var el = self.getDOM();
			var lastData = self.getValue(true);

			if(!c.canSelectParent && $(elm).attr('data-subs')){
				if(evt){
					// 子选项, 显示选项, 不能选中
					evt.type = 'mouseenter';
					self.eventOptionMouse(evt, elm);
					return false;
				}
			}

			// 显示结果的时候添加act样式
			if(c.showResult){

				if(c.hasMulti){
					$(elm).parent().addClass('act_multi');
				}else{
					doms.list.removeClass('act');
				}
				$(elm).parent().addClass('act');
				util.each(self.$subs_sels, function(item){
					doms.list.find('a[data-id="'+item+'"]').parent().addClass('act');
				});
			}

			// 查找结果
			var id = $(elm).attr('data-id');
			var opt = util.find(self.$options, id, c.key);
			if(!opt){
				// 查找多级
				var sid = $(elm).parents('div.subs').attr('data-sid');
				if(sid && self.$subs_opts[sid]){
					opt = util.find(self.$subs_opts[sid].options, id, c.key);
				}

			}
			opt = opt || c.all || {};

			var name = opt[c.name] || opt.name || opt.Name;

			// 记录数据对象
			self.$data = util.clone(opt);
			self.$data.id = id;
			self.$data.name = name;


			// 广播事件
			self.fire('optionChange', {
				'id': id,
				'name': name,
				'option': opt,
				'isTrigger': evt && !!evt.isTrigger,
				'last': lastData
			});

			// 记录选择的情况
			self.$subs_data = util.clone(self.$subs_sels);
			self.$subs_data.push(id);
			// 做一次去重
			self.$subs_data = util.unique(self.$subs_data);

			// 隐藏本体
			if(!c.hasMulti){
				self.hide();
			}

			// 有href的时候，不阻止默认行为
			if(!opt.href){
				return false;
			}
		},
		// 显示或者隐藏搜索按钮
		toggleSeatchIcon: function(state){
			var self = this;
			var doms = self.$doms;
			var search = doms.btnSearch;
			var cancel = doms.btnCancel;
			if(state){
				search.show();
				cancel.hide();
			}else{
				search.hide();
				cancel.show();
			}
		},
		// 上下键移动函数
		move: function(dom){
			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;

			// 搜索框高度
			var search_height = 0;
			// 解析整个个option list高度
			var height = parseInt(c.height, 10);
			// 解析单个option高度
			var option_height = parseInt(c.option_height, 10);

			if(c.hasSearch){
				search_height = doms.searchCon && doms.searchCon.outerHeight() || 0;
			}

			// 系数
			var index = Math.floor((height - search_height)/option_height)  || 2;

			// 滚动条跟随移动
			self.$.scroller.scrollTo( -(self.$index -(index - 1)) * option_height);
			// 按键选中状态
			dom.eq(self.$index).addClass('highlight');
		},
		// 接受广播
		onDropBlur: function(ev){
			// 组件失焦时，检查输入的值是否匹配，匹配的话自动选中
			// this.setValue(ev.param);
			return false;
		},
		setData: function(data, noAll){
			var self = this;
			var c = self.getConfig();
			if(data){
				self.$options = util.clone(data);
				// 是否不加入all
				if(!noAll){
					// 加入默认全选项
					self.addAll(c.all);
				}
				self.resetList();
				self.buildList();
				if(c.type != 'multi'){
					self.setValue(self.$currentValue);
				}

			}
			return this;
		},
		getData: function(){
			return this.$options;
		},
		setValue: function(value){
			var self = this;
			// var doms = self.$doms;
			var c = self.getConfig();
			var el = self.getDOM();
			var val;

			// 值是数组的时候，代表多级
			if(util.isArray(value)){
				self.$subs_sels = util.clone(value);
				val = self.$subs_sels.pop();
			}else{
				val = value;
			}

			var dom = el.find('.option > a[data-id="'+val+'"]');
			if(!dom.length){
				dom = el.find('.option > a[data-text="'+val+'"]');
			}

			if(dom.length){
				// dom.click();
				dom.trigger('click','auto');
			}else{
				self.$data = null;
			}

			if(c.type != 'multi'){
				// 设置当前值
				this.$currentValue = value;
			}

			return self;
		},
		getValue: function(type){
			var self = this;
			var c = self.getConfig();
			var subs_data = self.$subs_data;

			// 多级情况
			if(self.$subs_opts[1] && subs_data){
				if(!subs_data.length){
					if(type === true){
						return [];
					}else{
						return null;
					}
				}
				// 详细
				if(type === true){
					var result = [];
					var opt, sub_opts;
					for(var i=0; i<subs_data.length-1; i++){
						if(i > 0){
							// 第二层后从子$subs_opts找
							sub_opts = util.find(self.$subs_opts, subs_data[i], 'id');
							if(sub_opts){
								opt = sub_opts.data;
							}
						}else{
							// 第一层从$options找
							opt = util.find(self.$options, subs_data[i], c.key);
						}
						if(opt){
							result.push(opt);
						}
					}
					// 加入最后一层
					result.push(self.$data);
					return result;

				}else{
					return subs_data;
				}
			}else{
				// 单级情况
				var data = self.$data || {};
				// 可通过参数类型，获取不同的值
				switch (type){
					case 'id':	// 获取id
						return data.id || null;
					case 'name': // 获取name
						return data.name || null;
					case 'all': // 获取对象
					case true:
						return data;
					default: // 默认返回数据对象或者null
						return self.$data;
				}
			}
		},
		// 设置模块标记
		setFlag: function(flag){
			this.$flag = flag;
			return this;
		},
		getFlag: function(){
			return this.$flag;
		},
		// 加入all选项
		addAll: function(all){
			var self = this;
			// 加入默认全选项
			if(all && util.isObject(all)){
				self.$options.unshift(all);
			}
			return self;
		},
		// 增加option
		addItem: function(data){
			var self = this;
			var c = self.getConfig();
			var options = self.$options;
			var err = false;
			if(data){
				util.each(options, function(item, idx){
					if(item){
						if(item[c.key] == data[c.key]){
							err = true;
						}
					}
				});
				if(err){
					pubjs.alert(LANG('下拉模块不能添加相同id的选项！'));
					return self;
				}
				options.push(data);
				self.buildOption(data, options.length-1);
				self.updateList();
			}
			return self;
		},
		removeItem: function(){
			return this;
		},
		showItem: function(){
			return this;
		},
		hideItem: function(){
			return this;
		},
		// 禁用
		disableItem: function(id){
			var self = this;
			var el = self.getDOM();
			if(id && util.isArray(id)){
				util.each(id, function(item, idx){
					el.find('.option > a[data-id='+item+']').addClass('is-disabled');
				})
			}else{
				el.find('.option > a[data-id='+id+']').addClass('is-disabled');
			}
			return self;
		},
		// 启用
		enableItem: function(id){
			var self = this;
			var el = self.getDOM();
			if(id && util.isArray(id)){
				util.each(id, function(item, idx){
					el.find('.option > a[data-id='+item+']').removeClass('is-disabled');
				})
			}else{
				el.find('.option > a[data-id='+id+']').removeClass('is-disabled');
			}
			return self;
		},
		toggleToolbar: function(bool){
			this.$doms.toolbarCon.toggle(bool);
			return this;
		},
		removeMultiItemClass: function(id){
			var self = this;
			var el = self.getDOM();
			var dom = el.find('.option > a[data-id="'+id+'"]');
			if(!dom.length){
				dom = el.find('.option > a[data-text="'+id+'"]');
			}

			if(dom.length){
				dom.parent().removeClass('act_multi act');
			}

			return self;
		},
		getContainer: function(name){
			if(this.$doms){
				return this.$doms[name || 'listCon'];
			}
			return null;
		},
		show: function(){
			var self = this;
			self.Super('show', arguments);
			var c = self.getConfig();
			var el = self.getDOM();
			var doms = self.$doms;
			var offset = c.anchor && c.anchor.offset();

			// 如果有设定容器高度，更新listCon高度
			if(c.height){
				var toolbarHeight = doms.toolbarCon.children(':visible').length ? doms.toolbarCon.outerHeight(true) : 0;
				var searchHeight = c.hasSearch ? doms.searchCon.outerHeight(true) : 0;
				doms.listCon.outerHeight(el.outerHeight(true) - toolbarHeight - searchHeight - 2);
			}

			if(c.hasSearch){
				doms.search.select();
			}

			switch (c.appendTo){
				// 放在popup层
				case 'popup':
					var popOffset = util.popOffset();
					el.appendTo($('#SCENES_POPUP')).css({
						'top': offset.top + c.anchor.outerHeight() + c.offsetTop + popOffset.top,
						'left': offset.left + c.offsetLeft + popOffset.left,
						'z-index': 1001
					}).outerWidth(c.width || c.target.outerWidth());

					break;
				// 进入布局流
				case 'relative':
					el.css('position', 'relative');
					el.outerWidth(c.width || '100%');
					break;
				// 绝对定位
				case 'absolute':
					el.outerWidth(c.width || '100%');
					break;
				// 默认放在父元素下
				default:
					el.outerWidth(c.width || '100%');
			}

			// 将overflow的auto重新设置为可见visible，防止影响页面滚动条
			el.css('overflow', 'visible');

			// 更新arrow位置
			if(c.hasArrow){
				doms.arrow.css({
					'left': el.outerWidth()/2 - doms.arrow.width()/2 + c.arrowOffsetLeft,
					'top': -doms.arrow.height() + 1 + c.arrowOffsetTop
				})
			}

			if(self.$.scroller){
				self.$.scroller.update();
			}

			return self;
		},
		hide: function(){
			var self = this;
			self.Super('hide', arguments);
			var el = self.getDOM();
			var c = self.getConfig();
			el.appendTo(c.target).css({
				'top': 0 + c.offsetTop,
				'left': 0 + c.offsetLeft,
				'z-index': c['z-index']
			});
			if(c.hasFireHide){
				self.fire('dropPanelHide', self);
			}
			return self;
		},
		// 同步搜索框的值
		syncSearchVal: function(val){
			this.$doms.search.val(val);
			return this;
		},
		resetList: function(){
			this.getDOM().find('li.option').remove();
			return this;
		},
		reset: function(){
			var self = this;
			var el = self.getDOM();
			var c = self.getConfig();
			self.$subs_sels = [];
			self.$subs_hide = {};
			self.$subs_show_queue = [];
			self.$subs_data = [];
			self.$flag = '';
			self.$hasMatch = true;
			el.find('li.option').removeClass('act act_multi');
			el.find('.subListCon .subs').hide();
			self.setValue(c.value);
			// 情况搜索框
			if(self.$doms && self.$doms.search){
				self.$doms.search.val('');
			}
			return self;
		}
	});
	exports.panel = Panel;

	// 新下拉控件
	var Drop = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'class': 'M-drop',
				'addClass': '',
				'type': 'button', // 类型: button | text | multi
				'setTreeText': false,
				'height': 30,
				'width': 200,
				'placeholder': '',
				'def': '', // 默认显示的文字

				'url': '', //
				'reqType': 'websocket', // ajax | websocket
				'param': null,
				'autoLoad': true,
				'autoFire': true, // 构建后是否自动触发fire
				'showMultiInput': false, // 是否显示多选输入

				//------panel继承的参数
				'showResult': true, // 默认显示选中项
				'name': 'name',
				'key': 'id',
				'skey': 'subs',
				'value': null, // 初始化默认选中值
				'options': null, // 选项对象<数组>
				'all': null, // 默认全选项对象
				'hasSearch': true, //默认有搜索
				'keyupShowPanel': false, // 键盘输入是否显示panel；
				'result_render': null, // 结果内容渲染函数
				'result_line_height': 0, // 结果显示line-height
				'hasTitle': false, // 鼠标移上去的title
				'hasEvent': true, // 是否有点击事件
				'hasCancelBtn': false, // 输入模式时，是否有删除按钮
				'panel_config': {

				}, // panel参数
				'eventDataLoad': false // 是否冒泡数据已加载完成事件
			});

			this.$panel = null; // panel模块
			this.$sysParam = {}; // 自定义参数
			this.$lastSearchVal = ''; // 记录上一次的search值
			this.$flag = ''; // 模块标记
			this.$multiData = []; // 多选数据
			this.$multiMap = {}; // 多选数据对象

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			var result = '';
			var icon = '';

			// 根据类型设定下拉的样式
			switch (c.type){
				case 'button':
					result = '<div class="form-element result text-truncate"/>';
					break;
				case 'text':
					result = '<input class="form-element result"/>';
					if(c.hasCancelBtn){
						icon = [
							'<div class="iconCon">',
								'<i class="uk-icon-search do" />',
								'<i class="icon-close cancel"/>',
							'</div>'
						].join('');
					}
					break;
				case 'multi':
					result = [
						'<div class="form-element result text-truncate multiCon">',
							'<input class="form-element" type="text"/>',
						'</div>'
					].join('');
					break;
			}

			$([
				'<div class="form-element-group">',
					result,
					icon,
					'<span class="form-element-extra arrow">',
						'<i class="triangle-top"/>',
						'<em class="uk-icon-spinner anim-spin valign-m"/>',
					'</span>',
				'</div>',
				'<div class="panelCon"/>'
			].join('')).appendTo(el);


			var doms = self.$doms = {
				result: el.find('.result'),
				arrow: el.find('.arrow'),
				iconCon: el.find('.iconCon'),
				panelCon: el.find('.panelCon')
			};

			doms.arrow.find('em').hide();

			// 设置默认值
			if(c.type != 'multi'){
				doms.result.attr({
					'id': c.id,
					'data-id': c.id,
					'placeholder': LANG(c.placeholder) || ''
				}).text(LANG(c.def));
			}else{
				el.addClass('multi');
				if(!c.showMultiInput){
					doms.result.find('input').hide();
				}
			}

			if(c.addClass){
				el.addClass(c.addClass);
			}

			if(c.height){
				doms.result.css({
					'height': c.height,
					'line-height': (c.height - 15) + 'px'
				});
				doms.arrow.css({
					'height': c.height,
					'line-height': (c.height - 15) + 'px'
				});
			}

			if(c.width){
				el.outerWidth(c.width);
				doms.panelCon.outerWidth(c.width);
			}

			// 构建panel
			self.buildPanel();

			// 是否自动加载
			if(c.autoLoad){
				self.load();
			}

			if(!c.hasEvent){
				el.css('cursor', 'default');
			}

			switch (c.type){
				case 'button':
					self.uiBind(el, 'click', 'eventShowPanel');
					break;
				case 'text':
					self.uiBind(el, 'click', 'eventShowPanel');
					self.uiBind(doms.result, 'keyup', 'eventSearchResult');
					self.uiBind(doms.result, 'blur', 'eventBlurResult');
					if(c.hasCancelBtn){
						self.uiBind(doms.iconCon.find('.cancel'), 'click', 'eventCancel');
					}
					// 处理移动端ios中文输入的问题
					// if(util.isMobile()){
						self.$watchMobileInput = setInterval(function(){
							if(self.$lastSearchVal != doms.result.val()){
								self.eventSearchResult({});
							}
						}, 300);
					// }
					break;
				case 'multi':
					self.uiBind(el, 'click', 'eventShowPanel');
					self.uiBind(doms.result.find('input'), 'keyup', 'eventSearchResult');
					self.uiBind(doms.result.find('input'), 'blur', 'eventBlurResult');
					self.uiProxy(doms.result, '>div', 'click', 'eventRemoveMultiItem');
					break;
			}
		},
		load: function(){
			var self = this;
			var c = self.getConfig();

			if(c.url){
				self.$doms.arrow.find('i').hide().next().show();
				// self.$panel.showLoading();
				pubjs.sync();
				switch(c.reqType){
					case 'ajax':
						pubjs.data.get(
							c.url
							,$.extend({}, c.param, self.$sysParam)
							,self
							,'afterLoad'
						);
					break;
					case 'websocket':
						pubjs.mc.send(c.url, $.extend({}, c.param, self.$sysParam), self.afterLoad.bind(self));
					break;
				}
			}

			return self;
		},
		afterLoad: function(err, data){
			var self = this;
			// var c = self.getConfig();
			self.$doms.arrow.find('em').hide().prev().show();
			// this.$panel.hideLoading();

			if(err) {
				pubjs.error(err);
				pubjs.alert(err.message);
				return false;
			}

			self.setData(data);
			pubjs.sync(true);
			if(this.getConfig('eventDataLoad'))
			{
				this.fire("dropDataLoad",data);
			}
		},
		setParam: function(param){
			if(param){
				this.$sysParam = param;
			}
			return this;
		},
		// 显示panel事件
		eventShowPanel: function(evt, elm){
			var self = this;
			var c = self.getConfig();
			if(!c.hasEvent){
				return false;
			}
			this.$panel.show();
			if(c.type == 'multi'){
				self.$doms.result.find('input').focus();
			}
			if(c.type == 'text'){
				self.$doms.result.focus();
			}
			return false;
		},
		// 输入结果搜索事件
		eventSearchResult: function(evt, elm){
			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;
			var val = '';
			var multiInput = doms.result.find('input');

			// esc键时情况结果
			if(evt.keyCode == 27){
				doms.result.val('');
				if(multiInput.length){
					multiInput.val('').width(20);
				}
			}

			// 处理keyup显示panel
			if(c.keyupShowPanel && self.$panel && evt.keyCode!=16 && evt.keyCode){
				self.$panel.show();
			}

			val = doms.result.val();

			if(multiInput.length){
				val = multiInput.val();
				if(evt){
					multiInput.width(val.length * 16);
				}
			}

			if(c.hasCancelBtn){
				doms.iconCon.find('.do').toggle(!val);
				doms.iconCon.find('.cancel').toggle(!!val);
			}

			self.$lastSearchVal = val;
			self.$panel.syncSearchVal(val);
			self.$panel.eventSearchInput(evt, elm);
			return false;
		},
		// 输入结果失焦事件
		eventBlurResult: function(evt, elm){
			var val = $(elm).val();
			this.cast('dropBlur', val);
			this.fire('dropBlur', val);
			return false;
		},
		eventCancel: function(evt, elm){
			var self = this;
			self.$doms.result.val('');
			return false;
		},
		eventRemoveMultiItem: function(evt, elm){
			var id = $(elm).attr('data-id');
			this.removeMultiItem(id, true);
		},
		buildPanel: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			var panel_config = util.extend({}, {
				'target': self.$doms.panelCon,
				'anchor': el,
				'name': c.name,
				'key': c.key,
				'skey': c.skey,
				'showResult': c.showResult,
				'value': c.value,
				'options': c.options,
				'all': c.all,
				'hasSearch': c.hasSearch,
				'hasMulti': c.hasMulti,
				'type': c.type
			}, c.panel_config);

			// 是输入形式的时候，默认不要搜索框，避免干扰数据
			if(c.type == 'text' || c.type == 'multi'){
				panel_config.hasSearch = false;
			}

			// 多选形式，默认多选
			if(c.type == 'multi'){
				panel_config.hasMulti = true;
			}

			self.$panel = self.create('panel', Panel, panel_config);
		},
		setData: function(data, noAll){
			if(data){
				if(util.isArray(data)){
					this.$panel.setData(data, noAll);
				}
				if(data.items && util.isArray(data.items)){
					this.$panel.setData(data.items, noAll);
				}
			}
			return this;
		},
		getData: function(){
			return this.$panel.getData();
		},
		setValue: function(value){
			var self = this;
			var c = self.getConfig();
			if(c.type == 'multi'){
				if(util.isArray(value) && value.length){
					self.reset();
					util.each(value, function(item){
						self.$panel.setValue(item);
					});
				}
			}else{
				self.$panel.setValue(value);
			}

			return self;
		},
		getValue: function(type){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();
			var val = self.$panel.getValue(type);
			var result = self.$doms.result.val();

			if(c.type == 'text'){
				// 处理直接输入，没有匹配结果的情况
				if(val && result){
					// 假如与已选的值name字段不等，以新输入为准
					if(val.name !== result){
						val = {'name': util.trim(result)};
					}
				}else{
					// 输入为空时，返回空name
					if(result === ''){
						val = {'name': ''};
					}
				}
			}


			if(c.type == 'multi'){
				var multi = [];
				util.each(self.$multiData, function(item){
					if(item){
						multi.push(item.id);
					}
				});
				var text = doms.result.find('input').val();
				if(text){
					text = text.replace(/(,)+|(，)/g, ',').split(',');
					util.each(text, function(item){
						if(util.trim(item)){
							multi.push(util.trim(item));
						}
					});
				}
				if(type == 'all'){
					return util.clone(self.$multiData);
				}else{
					return multi;
				}
			}else{
				return val;
			}
		},
		// 单纯设置值，有别于setValue设置id
		setTextValue: function(val){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();
			// text模式，可设置值
			if(c.type == 'text'){
				if(doms && doms.result){
					doms.result.val(val);
				}
			}
			if(c.type == 'button' &&  c.setTreeText){
				if(doms && doms.result){
					doms.result.text(val);
				}
			}

			return self;
		},
		// 设置模块标记
		setFlag: function(flag){
			this.$flag = flag;
			if(this.$panel){
				this.$panel.setFlag(flag);
			}
			return this;
		},
		getFlag: function(){
			return this.$flag;
		},
		// 获取panel
		getPanel: function(){
			return this.$panel || this;
		},
		disable: function(){
			this.getDOM().addClass('is-disabled');
			return this;
		},
		enable: function(){
			this.getDOM().removeClass('is-disabled');
			return this;
		},
		addItem: function(data){
			this.$panel.addItem(data);
			return this;
		},
		// 未做
		removeItem: function(id){
			this.$panel.removeItem(id);
			return this;
		},
		// 未做
		showItem: function(id){
			this.$panel.showItem(id);
			return this;
		},
		// 未做
		hideItem: function(id){
			this.$panel.hideItem(id);
			return this;
		},
		disableItem: function(id){
			this.$panel.disableItem(id);
			return this;
		},
		enableItem: function(id){
			this.$panel.enableItem(id);
			return this;
		},
		// 是否开启事件点击
		toggleEvent: function(bool){
			var self = this;
			self.setConfig('hasEvent', bool);
			self.getDOM().css('cursor', bool ? 'pointer' : 'default');
			return self;
		},
		toggleToolbar: function(bool){
			var self = this;
			if(self.$panel){
				self.$panel.toggleToolbar(bool);
			}
			return self;
		},
		// 更新默认文字
		setDef: function(def, showResult){
			var self = this;
			var c = self.getConfig();
			self.setConfig('def', def);
			self.setConfig('showResult', !!showResult);
			if(self.$panel){
				self.$panel.setConfig('showResult', !!showResult);
			}
			self.$doms.result.text(LANG(c.def)).css('line-height', (c.height - 15) + 'px');
			return self;
		},
		// 移除多选item
		removeMultiItem: function(id, isDeleteOp){
			var self = this;
			var doms = self.$doms;
			var index = util.index(self.$multiData, id, 'id');
			self.$multiMap[id] = false;
			var data = self.$multiData.splice(index, 1);
			doms.result.find('div[data-id="'+id+'"]').remove();
			self.$panel.removeMultiItemClass(id);
			doms.result.find('input').focus();

			// 多选情况下，如果是input框的删除操作，也发送变更广播
			if(isDeleteOp){
				self.fire('dropChange', data);
			}

			return self;
		},
		onOptionChange: function(ev){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			var doms = self.$doms;
			var data = ev.param || {};
			data.flag = self.$flag;
			var html = '';
			if(c.showResult){
				// 根据类型显示结果
				switch (c.type){
					case 'button':
						doms.result.text(LANG(data.name) || '');
						if(c.result_render){
							html = c.result_render(ev.param.id, ev.param, doms.result);
							if(html){
								doms.result.html(html);
							}
							if(c.result_line_height){
								doms.result.css({
									'line-height': c.result_line_height
								});
							}
						}
						break;
					case 'text':
						doms.result.val(LANG(data.name) || '');
						break;
					case 'multi':
						// 避免重复添加
						if(!self.$multiMap[data.id] && data.id !== undefined){
							self.$multiMap[data.id] = true;
							self.$multiData.push(data);
							if(c.result_render){
								html = c.result_render(data.id, data, doms.result);
							}
							$([
								'<div data-id="'+data.id+'">',
									(html || data.name),
								'</div>'
							].join('')).insertBefore(doms.result.find('input'));


							doms.result.find('input').val('').select();
							self.eventSearchResult({});
						}else{
							self.removeMultiItem(data.id);
						}
						break;
				}
				// 有删除按钮的时候，设置最大宽度不同
				if(c.hasCancelBtn){
					doms.result.css({
						'max-width': el.outerWidth()
					});
				}else{
					doms.result.css({
						'max-width': el.outerWidth() - doms.arrow.outerWidth()
					});
				}


				// 设置title属性
				if(c.hasTitle && !c.result_render){
					doms.result.attr('title', doms.result.val() || doms.result.html());
				}

			}

			// 首次判断是否触发广播
			if(c.autoFire){
				// 广播变化事件
				self.fire('dropChange', data);
			}
			// 尔后都触发广播
			self.setConfig('autoFire', true);

			return false;
		},
		reset: function(){
			var self = this;
			var c = self.getConfig();
			self.$sysParam = null;
			self.$panel.reset();
			if(!self.getValue()){
				self.$doms.result.text(LANG(c.def));
			}
			self.$doms.result.val('');
			self.$flag = '';
			self.$multiData = [];
			self.$multiMap = {};
			if(c.type == 'multi'){
				self.$doms.result.find('div').remove();
				self.$doms.result.find('input').val('');
				self.eventSearchResult({});
			}

			return self;
		}
	});
	exports.drop = Drop;

	// 新建按钮+
	var Add = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'class': 'M-dropAdd',
				'addClass': '',
				'buttonClass': 'btn btn-danger',
				'type': 'button', // 类型: button | text
				'height': null,
				'width': null,
				'placeholder': '',
				'def': LANG('新建'), // 默认显示的文字
				'color': '#D62436', // 基础颜色，默认
				'icon': '',		//icon样式
				'href': null, // 跳转地址
				'href_target': '_blank', // 跳转形式
				'useIcon': true, // 是否使用“+”，还是“新建”
				'useCallback': false, // 是否使用事件广播回调响应

				//------panel继承的参数
				'showResult': false, // 默认显示选中项
				'name': 'name',
				'key': 'id',
				'skey': 'subs',
				'value': null, // 初始化默认选中值
				'options': null, // 选项对象<数组>
				'all': null, // 默认全选项对象
				'hasSearch': false, //默认有搜索

				'panel_config': {
					'appendTo': 'popup'
				} // panel参数
			});

			this.$panel = null; // panel模块

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();

			var iconClass = c.useIcon ? 'uk-icon-plus' : '';
			var text = c.useIcon ? '' : LANG(c.def);

			// 构建模式
			$([
				'<div class="icon">',
					'<i class="'+iconClass+'">',
						text,
					'</i>',
				'</div>',
				'<div class="links"/>',
				'<span class="title"/>',
				'<div class="panelCon"/>'
			].join('')).appendTo(el);


			var doms = self.$doms = {
				icon: el.find('.icon'),
				title: el.find('.title'),
				panelCon: el.find('.panelCon'),
				links: el.find('.links')
			};

			doms.title.attr({}).text(LANG(c.def));

			if(c.color){
				doms.icon[c.useIcon ? 'hide': 'show']().css({'background': c.color});
				doms.title.css({'color': c.color});
			}


			if(c.addClass){
				el.addClass(c.addClass);
			}

			if(c.height){
				doms.icon.css({
					'height': c.height,
					'line-height': (c.height - 15) + 'px'
				});
				doms.title.css({
					'height': c.height,
					'line-height': (c.height - 15) + 'px'
				});
			}

			if(c.width){
				el.outerWidth(c.width);
			}

			// 构建panel
			self.buildPanel();

			if(c.useIcon){
				if(c.options && c.options.length && !c.href){
					util.each(c.options, function(item, idx){
						var a = $('<a/>').attr({
							'href': item.href || '',
							'target': item.target || item.href_target || '_blank',
							'class': 'M-dropAddLink ' + c.buttonClass
						}).text(LANG(item.name) || LANG(item.def) || '').appendTo(doms.links);
						if(item.icon){
							$('<i class="'+item.icon+'"/>').prependTo(a);
						}
					});
				}else{
					var a = $('<a/>').attr({
						'target': c.href_target || '_blank',
						'class': 'M-dropAddLink ' + c.buttonClass
					}).text(LANG(c.def) || '').appendTo(doms.links);
					if(c.icon){
						$('<i class="'+c.icon+'"/>').prependTo(a);
					}

					// 如果有href，添加href；
					if(c.href){
						a.attr('href', c.href);
					}
					// 没有href的情况，可以使用广播回调
					if(c.useCallback){
						self.uiBind(a, 'click', 'eventOpenWindow');
					}

				}
			} else {

				if(c.options && c.options.length && !c.href){
					self.uiBind(el, 'click', 'eventShowPanel');
				}else{
					self.uiBind(el, 'click', 'eventOpenWindow');
				}
			}
		},
		// 显示panel事件
		eventShowPanel: function(evt, elm){
			this.$panel.show();
			return false;
		},
		// 打开新页面事件
		eventOpenWindow: function(evt, elm){
			var c = this.getConfig();

			if(c.href){
				var href = c.href;
				// 判断是否新窗口打开
				if(c.href_target == '_blank'){
					window.open(href);
				}else{
					if(href.indexOf('#') != -1){
						var arr = href.split('#');
						href = arr[arr.length - 1];
					}
					pubjs.controller.navigate(href);
				}
			}else{
				this.fire('InputClick', util.clone(c));
			}

			return false;
		},
		buildPanel: function(){
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();
			var panel_config = util.extend({}, {
				'target': self.$doms.panelCon,
				'anchor': el,
				'name': c.name,
				'key': c.key,
				'skey': c.skey,
				'showResult': c.showResult,
				'value': c.value,
				'options': c.options,
				'all': c.all,
				'hasSearch': c.hasSearch
			}, c.panel_config);

			// 是输入形式的时候，默认不要搜索框，避免干扰数据
			if(c.type == 'text'){
				panel_config.hasSearch = false;
			}

			self.$panel = self.create('panel', Panel, panel_config);
		},
		setValue: function(value){
			this.$panel.setValue(value);
			return this;
		},
		getValue: function(type){
			return null;
		},
		disable: function(){
			this.getDOM().addClass('is-disabled');
			return this;
		},
		enable: function(){
			this.getDOM().removeClass('is-disabled');
			return this;
		},
		addItem: function(data){
			this.$panel.addItem(data);
			return this;
		},
		disableItem: function(id){
			this.$panel.disableItem(id);
			return this;
		},
		enableItem: function(id){
			this.$panel.enableItem(id);
			return this;
		},
		onOptionChange: function(ev){
			var self = this;
			var data = ev.param || {};

			// 广播变化事件
			self.fire('dropChange', data);

			return false;
		},
		// 更新超链接
		updateUrl: function(ev){
			// 用于hash的search改变，引起的一系列变更
			var self = this;
			if(ev){
				// var c = self.getConfig();
				var doms = self.$doms;
				var search = ev.param.search;
				var a = doms.links.find('a');
				// 循环更新
				$.each(a, function(idx, item){
					var el = $(item);
					var href = el.attr('href');
					if(href){
						href = href.split('?')[0];
						if(href){
							search = search ? '?'+search : '';
							el.attr('href', href + search);
						}
					}
				});
			}
			return self;
		},
		reset: function(){
			this.$panel.reset();
		}
	});
	exports.add = Add;

});