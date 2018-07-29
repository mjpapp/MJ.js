define(function(require,exports){
	var pubjs = require("pubjs");
	var util = require('util');
	var $ = require("jquery");
	var view = require('@base/view');
	var content = require('@layout/v1/content');
	var drop = require('@base/common/drop');

	// POP弹层
	var Base = view.container.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				'class': 'G-framePop',
				// 面包屑配置, 根据不同产品，可作为实例引用
				'crumb': {
					'modName': 'crumb',
					'uri': '@layout/v1/pop.crumb',
					'config': {}
				}
			});

			this.$containers = [];
			this.$builded = false; // 延迟构建状态, 避免阻塞页面加载

			this.Super('init', arguments);
		},
		// 使用时才构建弹层主体
		delayBuild: function() {
			var self = this;
			var el = self.getDOM();
			var c = self.getConfig();

			// 更改延迟状态
			self.$builded = true;

			$([
				'<div class="G-framePopHead">',
					'<div class="G-framePopHeadTitle">',
					'</div>',
					'<div class="G-framePopHeadExit">',
						'<span>'+LANG('可使用快捷键 "ESC"')+'</span>',
						'<i class="icon-close"/>',
					'</div>',
				'</div>',
				'<div class="G-framePopBody">',
					'<div class="G-framePopBodyCrumb"></div>',
					'<div class="G-framePopBodyContent"></div>',
				'</div>'
			].join('')).appendTo(el);

			var doms = self.$doms = {
				head: el.find('.G-framePopHead'),
				headTitle: el.find('.G-framePopHeadTitle'),
				headExit: el.find('.G-framePopHeadExit'),
				body: el.find('.G-framePopBody'),
				crumb: el.find('.G-framePopBodyCrumb'),
				content: el.find('.G-framePopBodyContent')
			};

			// 根据配置构建面包屑
			if(c.crumb){
				var crumb = c.crumb;
				self.createAsync(crumb.modName || 'crumb', crumb.uri, util.extend({
					target: doms.crumb
				}, crumb.config));
			}

			// 绑定关闭按钮事件
			self.uiBind(doms.headExit.find('i'), 'click', 'eventHide');

		},
		// 增加一项
		addItem: function(opts) {
			if (util.isString(opts)) {
				opts = {type: opts };
			}

			if(opts.source.condition && opts.source.condition.length > 5){
				pubjs.notify(LANG('已超过最大显示级别！'), '', 'danger');
				return;
			}
			if(opts.source.condition && opts.source.condition.length == 1){
				this.removeAll();
			}

			var target;
			var container;
			var constructor;
			var self = this;
			var doms = self.$doms;
			var list = self.$containers;
			var type = opts.type;
			var title = opts.title;
			var name = 'POP_GRID_CONTAINER' + util.guid();
			var subgridConfig = pubjs.config('app/subgrid/' + type) || {};
			var modulesConfig = subgridConfig.modules;
			var businessType = subgridConfig.type;
			var cont = self.getItem(name);
			var subSource = {};

			self.updateTitle();
			self.hideCrumbSubTitle();

			if(util.isFunc(subgridConfig.title)){
				title = subgridConfig.title.call(null, opts, subgridConfig);
			}else{
				title = title || subgridConfig.title;
			}

			if (!util.isArray(modulesConfig)) {
				modulesConfig = [modulesConfig];
			}

			self.$isHidden = false;

			if (!cont){
				switch(businessType){
					case 'scroll':
						constructor = content.scroll;
					break;
					case 'sidebar':
						constructor = content.sidebar;
					break;
					case 'tabSidebar':
						constructor = content.tabSidebar;
					break;
					case 'base':
						constructor = content.base;
						break;
					default:
						constructor = content.scroll;
					break;
				}

				// var t = opts.group.text + (opts.group.id ? ('|' + opts.group.id) : '');
				target = $([
					'<div class="G-framePopGridSingle">',
						'<div class="M-formHead">',
							'<span class="M-formHeadTitle">',
								// t,
							'</span>',
						'</div>',
					'</div>'
				].join('')).appendTo(doms.content); //HACK: 解决container下模块定位错误的问题

				container = self.create(constructor, {target: target});

				cont = {
					name: name,
					type: type,
					businessType: businessType,
					param: opts.param,
					title: title || '---',
					wrap: target,
					modules: [],
					fixed: false,
					container: container
				};
				list.push(cont);

				util.each(modulesConfig, function(modconf) {
					if (util.isString(modconf)) {
						modconf = {uri: modconf};
					}

					var sync = modconf.config && modconf.config.syncParentGridParam;
					var parentGridParam = opts.source.noMetricsParam;

					container.createBusiness(
						'POP_GRID_MODULE' + util.guid(),
						modconf.uri,
						util.extend(
							opts.config,
							modconf.config,
							{param: modconf.param},
							{param: opts.param},
							(sync ? {param: parentGridParam} : {}),
							{
								'sup_uuid': opts.source.uuid, // 子表格参数中传入父的uuid
								'sup_container_name': name, // 子表格参数中传入父表容器名
								'is_sub_grid': true
							}
						),
						function(mod) {
							cont.modules.push(mod);
							if(util.isFunc(opts.callback)) {
								opts.callback.apply(null, [true, cont, opts].slice(arguments));
							}


							// 获取模块的配置
							subSource = util.clone(mod.getConfig());
							// 获取上层的subOptions配置
							subSource.subOptions = opts.source.subOptions;
							// source的下级subSource
							opts.source.subSource = subSource;
							// 更新层级
							self.updateCrumbLevel(opts.source);
						}
					);
				});

			} else if (cont.modules && util.isFunc(opts.callback)) {
				opts.callback.call(null, false, cont, opts);
			}

			self.showItem(name);

			while(list.length > this.getConfig('max')) {
				self.shiftItem();
			}


			return container;
		},
		// 移除最老的一项
		shiftItem: function(i) {
			var self = this;
			var list = self.$containers;
			var cont = list[i];
			if (!cont) {
				pubjs.alert(LANG('超出最大数量且无法移除'));
				return;
			}
			if (cont.fixed) {
				self.shiftItem(++i);
			} else if (cont.name) {
				self.removeItem(cont.name);
			}
		},
		// 移除某一项
		removeItem: function(name) {
			var self = this;
			var list = self.$containers;
			var cont = self.getItem(name);

			if (cont) {
				if (cont.container) {
					cont.container.destroy();
				}
				if (cont.wrap) {
					cont.wrap.remove();
				}
				util.remove(list, name, 'name');
			}

			if (!list.length) {
				this.hideSelf();
			} else {
				this.showItem(list[list.length - 1].name);
			}
		},
		removeAll: function(){
			var self = this;
			var list = self.$containers;
			var len = list.length;
			for(var i=0; i<len; i++){
				list[i].wrap.remove();
			}
			self.$containers = [];
		},
		// 激活某一项
		showItem: function(name) {
			var self = this;
			var list = self.$containers;
			util.each(list, function(cont) {
				var wrap = cont.wrap;
				if (!wrap) {
					return;
				}
				if (cont.name === name) {
					wrap.show();
				} else {
					wrap.hide();
				}
			});
			// 发送show广播通知
			self.cast('popShow');

		},
		getItem: function(name) {
			var self = this;
			var list = self.$containers;
			return util.find(list, name, 'name');
		},
		hideSelf: function() {
			var self = this;
			self.fire('popHide', function(){

			});
		},
		updateTitle: function(title){
			var self = this;
			var doms = self.$doms;
			doms.headTitle.html(title || LANG('组合维度'));
			return self;
		},
		eventHide: function(evt, elm){
			this.hideSelf();
		},
		reset: function() {
			var self = this;
			// 容器栈
			self.$containers = [];
			return self;
		},
		count: function(){
			return this.$containers.length;
		},
		show: function(){
			var self = this;
			if (!self.$builded)
			{
				self.delayBuild();
			}
			var el = self.getDOM();
			el.css({
				top: $(document).scrollTop(),
				left: 0
			});

			// 发送show广播通知
			self.cast('popShow');

			self.Super('show', arguments);

			return self;
		},
		//-----------------------有关crumb模块方法
		// 更新面包屑层级
		updateCrumbLevel: function(opt){
			var self = this;
			if(self.get('crumb') && opt){
				self.get('crumb').updateLevel(opt);
			}
			return self;
		},
		// 隐藏面包屑对应页面小标题，目标的是更新时先隐藏，再显示
		hideCrumbSubTitle: function(){
			var self = this;
			if(self.get('crumb')){
				self.get('crumb').hideSubTitle();
			}
			return self;
		},
		// 接收层级删除事件广播
		onCrumbCancelLevel: function(ev){
			var self = this;
			self.showItem(ev.param);
			if(self.get('crumb')){
				self.get('crumb').updateSubTitle();
			}
		}
	});
	exports.base = Base;

	var Crumb = view.container.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				'class': 'G-framePopCrumb',
				'baseOptions': pubjs.config('subgrid_options') || [],
				'periodOptions': [
					{id: 'hour', name: LANG('小时')},
					{id: 'date', name: LANG('天')},
					{id: 'week', name: LANG('周')},
					{id: 'month', name: LANG('月')}
				]
			});

			this.$level = {};  // level组件组合
			this.$levelData = [] // level数据数组
			this.$currentLevel = 1;

			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			// var c = self.getConfig();
			var el = self.getDOM();

			$([
				'<div class="G-framePopCrumbCon clear"/>',
				'<div class="G-framePopCrumbTitle clear"/>',
				'<div class="G-framePopCrumbSubTitle clear"/>'
			].join('')).appendTo(el);

			var doms = self.$doms = {
				con: el.find('.G-framePopCrumbCon'),
				title: el.find('.G-framePopCrumbTitle'),
				subTitle: el.find('.G-framePopCrumbSubTitle')
			}

			for(var j=0; j<7; j++){
				$([
					'<div class="levelCon" data-con="'+(j+1)+'">',
						'<div class="arrowCon"/>',
						'<div class="dropCon"/>',
						'<div class="cancelCon"/>',
					'</div>'
				].join('')).appendTo(doms.con);
			}


			// 先构建六个，再update
			for(var i=0; i<7; i++){
				self.addLevel(i+1, {});
			}
		},
		// 增加层级
		addLevel: function(level, config){
			var self = this;
			self.buildLevel(level, config);
			return self;
		},
		// 更新层级
		updateLevel: function(config, isSubSource){
			if(!config){
				return;
			}
			var self = this;
			var c = self.getConfig();
			var level; // 层级
			var levelModule; // 层级包含的所有组件

			// 根据condition参数判断是什么层级，然后设置不同的层级的drop
			if(config.condition){
				level = self.$currentLevel = config.condition.length;
			}else{
				level = self.$currentLevel + 1;
			}

			levelModule = self.$level[level];

			if(levelModule){
				var levelCon = levelModule['levelCon'];
				var left = levelModule['left'];
				var right = levelModule['right'];
				var rightPeriod = levelModule['rightPeriod'];
				var options;

				if(config && left && right && rightPeriod){
					if(level > 1){
						options = config.subOptions || [];
					}else{
						options = c.baseOptions;
					}

					// 记录数据到levelData;
					self.$levelData.push(config);

					// 是subSource的时候，绑定删除层级x事件
					if(isSubSource){
						// 先移除
						self.uiUnbind(levelModule['cancel'], 'click', 'eventCancelLevel');
						// 再绑定
						self.uiBind(levelModule['cancel'], 'click', config, 'eventCancelLevel');
					}


					// 设置新的options，清除标记
					left.setData(options).setFlag('').removeClass('blue');


					if(isSubSource){
						left.setFlag('end'); // 是subSource时设置结束标记，给标题使用
					}

					// 设值，入口层通常没有subName，所以用gridName，二级后都需要默认配置有subName
					left.setValue(config.subName || config.gridName || '');


					// 特殊处理客户列表
					if(config.gridName == 'user' || config.subName == 'admin_direct' || config.gridName == 'customerReport'){
						right.getPanel().setConfig('key', 'UserId');
					}else{
						right.getPanel().setConfig('key', '_id');
					}


					// 这里要根据表格处理right的options，如时段分析比较特殊；
					if(config.subName == 'period' || config.subName == 'frequency' || config.subName == 'amount_period'){

						rightPeriod.setFlag(config.subName).setValue('hour').removeClass('dn');
						right.addClass('dn');
					}else{

						// 客户列表不能通过ids查询，所以还是查找全部
						var ids = {'ids':String(config.id)};
						if(config.gridName == 'user'){
							ids = {};
						}

						if(!isSubSource){
							right.setData(config.gridData);
						}

						rightPeriod.addClass('dn');
						right.reset()
							.setParam(util.extend(config.param, ids))
							.setConfig('url', config.url)
							.setConfig('value', config.id)
							// .load()
							.setFlag(config.subName)
							.setValue(config.id)
							.removeClass('dn');

						// if(!isSubSource){
						// 	right.load();
						// }
					}


					// 显示和隐藏levelCon
					levelCon.show().nextAll().hide();

					if(isSubSource){

						// 最后一级，暂时设置全部
						right.setValue(-10000);
						rightPeriod.setValue(-10000);

						// 最后一个删除按钮变颜色, 前面的移除颜色;
						levelCon.find('>.cancelCon').addClass('cancelEnd').show();
						levelCon.prev().find('>.cancelCon').removeClass('cancelEnd');

					}else{

					}
				}
			}

			// 如果有subSource，继续执行一次
			if(config.subSource){
				self.updateLevel(config.subSource, 'isSubSource');
			}

			return self;
		},
		// 更新子标题
		updateSubTitle: function(name){
			var self = this;
			var doms = self.$doms;
			var el = self.getDOM();
			// 利用特别的方法，更改subTitle的位置，暂时这样做吧
			var PopBody = el.parent().next('.G-framePopBodyContent');
			var flag = PopBody.find('.M-HighGridDateRange:visible');
			var flag2 = PopBody.find('.M-tab:visible');
			var flag3 = PopBody.find('.M-chartAdv:visible');

			doms.subTitle.toggleClass('align', (flag.length > 0) && (flag2.length <= 0) || (flag3.length > 0));
			if(name){
				doms.subTitle.html(name).show();
			}
			doms.subTitle.show();
			return self;
		},
		// 隐藏子标题
		hideSubTitle: function(){
			var self = this;
			var doms = self.$doms;
			doms.subTitle.hide();
			return self;
		},
		// 构建层级
		buildLevel: function(level, config){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();

			if(!self.$level[level]){

				var data = self.$level[level] = {};
				var levelCon = data['levelCon'] = doms.con.find('div[data-con="'+level+'"]');

				// 灰色左边
				if(!data['left']){
					data['left'] = self.create('level_left_'+level, drop.drop, {
						'addClass': 'gray',
						'target': levelCon.find('.dropCon'),
						'hasSearch': false,
						'width': 80,
						'height': 40,
						'hasTitle': true,
						'hasEvent': false,
						'panel_config': {
							'hasArrow': true,
							'appendTo': 'popup'
						}
					});
				}

				// 白色右边
				if(!data['right']){
					data['right'] = self.create('level_right_'+level, drop.drop, {
						'addClass': 'pure level_right',
						'target': levelCon.find('.dropCon'),
						'width': 170,
						'height': 40,
						'name': 'Name',
						'key': '_id',
						'result_line_height': '15px',
						'result_render': self.renderResult,
						'hasEvent': false,
						'all': {'Name': LANG('全部'), '_id': -10000},
						'panel_config': {
							'appendTo': 'popup',
							'hasSearch': false,
							'hasArrow': true,
							'width': 310,
							'height': 300,
							'option_height': 50,
							'option_line_height': 18,
							'option_render': self.renderOption,
							'option_class': 'spacing'
						}
					});
				}

				// 白色右边时段分析
				if(!data['rightPeriod']){
					data['rightPeriod'] = self.create('level_rightPeriod_'+level, drop.drop, {
						'addClass': 'pure level_rightPeriod dn',
						'target': levelCon.find('.dropCon'),
						'hasSearch': false,
						'options': c.periodOptions,
						'all': {'name': LANG('全部'), 'id': -10000},
						'width': 60,
						'height': 40,
						'hasEvent': false,
						'panel_config': {
							'hasArrow': true,
							'appendTo': 'popup'
						}
					});
				}

				// 前置箭头
				if(!data['arrow']){
					data['arrow'] = $([
						'<div class="levelArrow">',
							'<span/>',
							'<i class="triangle-left"/>',
						'</div>'
					].join('')).appendTo(levelCon.find('>.arrowCon'));
				}

				// 删除按钮
				if(!data['cancel']){
					data['cancel'] = $([
						'<div class="levelCancel">',
							'<i class="icon-close"/>',
						'</div>'
					].join('')).appendTo(levelCon.find('.cancelCon'));

					self.uiBind(levelCon.find('.cancelCon'), 'mouseover mouseout', 'eventCancelMouse');
				}

			}

			return self;
		},
		// drop结果渲染
		renderResult: function(id, opt, dom){
			var ID = '';
			// 处理全部
			if(opt.id != -10000){
				ID = '<div>'+'ID：'+opt.id+'</div>';
			}
			var html = $([
				'<div title="'+opt.name+'">',
					ID,
					'<div class="text-truncate">'+opt.name+'</div>',
				'</div>'
			].join(''));

			if(opt.id == -10000){
				html.css('line-height', '26px');
			}

			return html;
		},
		// drop选项渲染
		renderOption: function(id, opt, dom){
			var ID = '';
			var name = opt.Name || opt.name;
			if(opt._id){
				// 兼容客户列表
				if(opt.UserId && opt.UserName){
					ID = '<div>'+'ID：'+opt.UserId+'</div>';
				}else{
					ID = '<div>'+'ID：'+opt._id+'</div>';
				}
			}
			var html = $([
				'<div class="pt5 pb5" title="'+name+'">',
					ID,
					'<div>'+name+'</div>',
				'</div>'
			].join(''));
			return html;
		},
		// 删除层级事件
		eventCancelLevel: function(evt, elm){
			if(evt && evt.data){
				var self = this;
				var sup_uuid = evt.data.sup_uuid;
				// 通过sup_uuid一级一级向上找
				var data = util.find(self.$levelData, sup_uuid, 'uuid');
				if(data){
					var sup_data = util.find(self.$levelData, data.sup_uuid, 'uuid');
					if(sup_data){
						var not_grid_data = '';
						// 遇到子表格是tab的情况
						if(!sup_data.condition){
							not_grid_data = util.find(self.$levelData, sup_data.sup_uuid, 'uuid');
							self.updateLevel(not_grid_data);
						}else{
							self.updateLevel(sup_data);
						}
					}

					self.fire('crumbCancelLevel', data.sup_container_name);
				}
			}

			return false;
		},
		// 鼠标移动删除按钮事件
		eventCancelMouse: function(evt, elm){
			var self = this;
			var el = self.getDOM();
			switch (evt.type){
				case 'mouseover':
					$(elm).parents('.levelCon').addClass('lighten').nextAll('.levelCon').addClass('lighten');
					break;
				case 'mouseout':
					el.find('.levelCon').removeClass('lighten');
					break;

			}
			return false;
		},
		// drop改变事件汇总
		onDropChange: function(ev){
			// console.log(ev);
			var self = this;
			if(ev && ev.param){
				if(ev.param.flag == 'end'){
					var name = ev.param.name;
					self.updateSubTitle(name);
					ev.source.addClass('blue');
				}
			}
		}
	});
	exports.crumb = Crumb;

});