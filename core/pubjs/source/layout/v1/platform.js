define(function(require,exports){
	var	DOC = document;
	var pubjs = require("pubjs");
	var util = require('util');
	var $ = require("jquery");
	var view = require('@base/view');
	var content = require('@layout/v1/content');
	require('nicescroll');
	require('@layout/v1/css/main.css');

	var Platform = pubjs.Module.extend({
		init: function(config){
			var self = this;
			self.$config = pubjs.conf(config, {
				'target': 'body',
				'modules': []	// 加载模块
			});

			self.$activeScenes = null;
			self.$delayUpdate = false;
			self.$containers = {};
			self.$menuShow = JSON.parse(pubjs.storage('menuShow')); // 是否隐藏菜单
			self.$headHeight = 50; // 页面头部header高度
			self.$timeoutId = null;
			self.$isOpenBtnDrag = false;	// 子表格层按钮是否拖动状态；
			self.$documentWidth = 0;	// document宽度

			this.build();
		},
		build: function(){
			var self = this;
			var c = self.getConfig();
			var body = self.$target = $(c.target);

			// 构建框架模块
			$([
				'<div id="SCENES_MAIN" class="G-frameScenes">',
					'<div class="G-frameWrapper">',
						'<div class="G-frameHead">',
							'<div class="G-frameHeadTitle">',
								'<div class="nav-menu-collapse">',
									'<i class="icon-collapse-on on"/>',
									'<i class="icon-collapse-off off"/>',
								'</div>',
								'<div class="nav-menu-title"></div>',
							'</div>',
						'</div>',
						'<div class="G-frameBody">',
							'<div class="G-frameBodyMenu" id="G-frameBodyMenu">',
								'<div class="nav-menu-logo">',
								'</div>',
								'<div class="nav-menu">',
									'<div class="nav-menu-list"/>',
								'</div>',
								'<div class="nav-menu-switch"/>',
								'<div class="nav-menu-footer"/>',
							'</div>',
							'<div class="G-frameBodyContent" />',
						'</div>',
					'</div>',
				'</div>',
				'<div id="SCENES_POPGRID" class="G-frameScenes" />',
				'<div id="SCENES_POP" class="G-frameScenes" />',
				'<div id="SCENES_POPUP" class="G-frameScenes" />',
				'<div id="SCENES_LOGIN" class="G-frameScenes" />',
				'<div id="SCENES_PRELOADER"><b/><a/><em/><i/></div>'
			].join('')).appendTo(body);

			var doms = self.$doms = {
				'wrapper': body.find('.G-frameWrapper'),
				'head': body.find('.G-frameHead'),
				'body': body.find('.G-frameBody'),
				'menu': body.find('.G-frameBodyMenu'),
				'logo': body.find('.nav-menu-logo'),
				'menuFlex': body.find('.nav-menu-collapse'),
				'menuTitle': body.find('.nav-menu-title'),
				'menuListWrapper': body.find('.nav-menu'),
				'menuList': body.find('.nav-menu-list'),
				'footer': body.find('.nav-menu-footer'),
				'switch': body.find('.nav-menu-switch'),
				'container': body.find('.G-frameBodyContent'),
				'login_container': body.find('#SCENES_LOGIN'),
				'SCENES_MAIN': body.find('#SCENES_MAIN'),
				'SCENES_POPGRID': body.find('#SCENES_POPGRID'),
				'SCENES_POPUP': body.find('#SCENES_POPUP'),
				'SCENES_POP': body.find('#SCENES_POP'),
				'SCENES_LOGIN': body.find('#SCENES_LOGIN')
			};


			// popgrid弹出按钮
			doms.popGridOpenBtn = $([
				'<div class="G-framePopGridOpenBtn">',
					'<i class="uk-icon-th-large"/>',
				'</div>'
				].join('')).appendTo(c.target).hide();
			self.uiBind(document, 'keyup.popGrid', 'eventPopGridOpen');
			self.uiBind(document, 'keydown', 'eventDocumentSpace');

			// 移动端加入打开按钮可拖拽
			if(util.isMobile()){
				doms.body.addClass('body-mobile-state');

				setInterval(function(){
					var height = doms.body.outerHeight() + doms.head.outerHeight();
					if(doms.menu.height() != height){
						doms.menu.height(height);
					}
				}, 200);
				self.eventOpenBtnDrag();
				self.uiBind(doms.popGridOpenBtn, 'tap', 'eventPopGridOpen');
			}else{
				self.uiBind(doms.popGridOpenBtn, 'click', 'eventPopGridOpen');
				pubjs.dragSimple(doms.popGridOpenBtn, function(ev){
					if(ev.data){
						var data = ev.data;
						var disX = Math.abs(ev.clientX - data.sourceX);
						var disY = Math.abs(ev.clientY - data.sourceY);
						self.$isOpenBtnDrag = disX > 5 || disY > 5;
					}

				});
			}

			// 依次创建子模块
			var mods = c.modules;
			var mod;
			for (var i = 0; i < mods.length; i++) {
				mod = mods[i];
				mod.config = util.extend({}, mod.config, { target: self.getDOM(mod.target)});
				self.createAsync(mod.name, mod.uri, mod.config);
			}

			doms.footer.html(pubjs.config('app_footer'));

			self.uiBind(doms.menuFlex.find('>i'), 'click', 'eventToggleMenu');

			self.uiBind(window, 'resize.platform', 'eventResizeSyncHeight');

			self.uiBind(window, 'scroll', 'eventScrollWindow');

			// 预加载图标文件, 2秒后删除
			setTimeout(function(){
				$('#SCENES_PRELOADER', body).remove();
			}, 2000);

			// 初始化左边导航显隐状态
			self.updateMenuStatus(self.$menuShow === null || self.$menuShow && !util.isMobile());



			self.syncHeight();

			// 定时监测宽度变化
			self.$WidthWatchId = setInterval(function(){
				// 监测document宽度变化
				var w = $(document).width();
				if(self.$documentWidth != w){
					// 广播事件
					pubjs.core.cast('documentResize', w);
					// 更新宽度值
					self.$documentWidth = w;
				}
			}, 200);

		},
		getConfig: function(name){
			return this.$config.get(name);
		},
		// 同步菜单与内容区域高度
		syncHeight: function(){
			return this;
		},
		// 更新模块状态
		update: function(mod, act){
			var self = this;
			self.$delayUpdate = (self.$activeScenes !== 'MAIN');
			if (!self.$delayUpdate){
				// 广播变更事件
				this.cast('platformUpdate', mod);
			}else {
				self.$delayUpdate = [mod, act];
			}
			return self;
		},
		// 切换场景
		switchScenes: function(name){
			var self = this;
			var body = self.$target;

			name = name.toUpperCase();
			body.removeClass('appScenesLogin appScenesMain appScenesPopGrid appScenesPop');
			switch (name){
				case 'MAIN':
					body.addClass('appScenesMain');
					break;
				case 'LOGIN':
					body.addClass('appScenesLogin');
					break;
				case 'POPGRID':
					body.addClass('appScenesPopGrid');
					break;
				case 'POP':
					body.addClass('appScenesPop');
					break;
				default:
					return self;
			}

			self.$activeScenes = name;
			if (name === 'MAIN' && self.$delayUpdate){
				self.update.apply(self, self.$delayUpdate);
			}

			return self;
		},
		// 设置窗口标题
		setTitle: function(title){
			DOC.title = title + ' - ' + pubjs.config('app_title');
			// 清空页面标题
			this.$doms.menuTitle.text('');
			return this;
		},
		// 设置平台显示状态与标题文字
		setPlatform: function(title, isEdit){
			// 重新设置页面标题
			this.$doms.menuTitle.text(title || '');
			return this;
		},
		// 设置副链接批量入口
		setBatch: function(url, text){
			var batch = $('<a/>').attr({
								'href': url,
								'target': '_blank'
							}).text(text || '');
			this.$doms.menuTitle.append(batch);
			return this;
		},
		// 获取容器DOM对象
		getDOM: function(name){
			if (name === 'popup'){
				name = 'SCENES_POPUP';
			}
			if (!name || !this.$doms[name]){
				name = 'container';
			}
			return this.$doms[name];
		},
		getContainer: function(name, scenes, no_create, type, content_config){
			if (!name){ name = 'container'; }

			var self = this;
			var list = self.$containers;
			var cont = list[name];
			if (!cont){
				if (no_create){
					return null;
				}

				var uri = '';
				// 只有main场景才调用content中的模块
				if (scenes == 'main') {
					switch(type){
						case 'scroll':
							uri = content.scroll;
						break;
						case 'sidebar':
							uri = content.sidebar;
						break;
						case 'tabSidebar':
							uri = content.tabSidebar;
						break;
						default:
							uri = content.base;
						break;
					}
				} else {
					uri = view.container;
				}

				cont = list[name] = self.create(uri, util.extend({
					target: self.getDOM(scenes + '_container'),
					attr: {'container-name': name}
				}, content_config));

			}else {
				if (scenes){
					cont.appendTo(self.getDOM(scenes + '_container'));
				}
			}
			return cont;
		},
		onSysUserLogin: function(){
			// 登录成功后，得到了用户权限信息，才能创建完整的菜单列表
			if(this.$.menu){
				this.$.menu.buildMenu();
			}
		},
		// 原生移动端拖动
		eventOpenBtnDrag: function(data, ev){
			var self = this;
			var doms = self.$doms;
			doms.popGridOpenBtn.css({
				'position': 'fixed',
				'top': 400,
				'right': 300,
				'width': 70,
				'height': 70,
				'line-height': '70px',
				'font-size': '40px'
			});

			// 手机拖动绑定
			pubjs.dragMobile(doms.popGridOpenBtn);
		},
		// window滚动事件响应
		eventScrollWindow: function(evt, elm){
			var self = this;
			if(!self.$doms){
				return;
			}
			// 滚动的时候隐藏logo旁边的白色三角;
			var angle = self.$doms.menu.find('.M-logo .angle');
			angle[$(document).scrollTop() > 50 ? 'hide' : 'show']();
		},
		// 窗口大小改变更新高度
		eventResizeSyncHeight: function(evt, elm){
			var self = this;

			// clearTimeout(self.$timeoutId);
			// self.$timeoutId = setTimeout(function(){
				// 更新高度
				self.syncHeight();
				// 改变窗体大小，发送消息
				pubjs.core.cast('windowResize', evt);
				pubjs.core.cast('sYSResize');
			// }, 100);

			return false;
		},
		onWindowResize: function(ev){
			// 窗口改变时隐藏部分popup
			if(!util.isMobile()){
				pubjs.DEFAULT_POPUP_CONTAINER.find('.M-tooltip').hide();
			}
			pubjs.DEFAULT_POPUP_CONTAINER.find('.M-tableCustomColumn').hide();
		},
		// 切换左侧两侧栏
		eventToggleMenu: function(evt, elm){
			// 更新状态
			this.updateMenuStatus(!this.$menuShow);
			return false;
		},
		updateMenuStatus: function(status){
			var self = this;
			var doms = self.$doms;

			doms.head.toggleClass('head-menu-expanded', status)
					.toggleClass('head-menu-collapsed', !status);

			doms.body.toggleClass('body-menu-expanded', status)
					.toggleClass('body-menu-collapsed', !status);

			pubjs.storage('menuShow', status);
			pubjs.core.cast('menuToggle', status);

			self.$menuShow = status;

			return this;
		},
		// popGrid打开按钮点击事件和其他页面按钮事件汇总
		eventPopGridOpen: function(evt, elm){
			var self = this;

			// 是圆形按钮拖动的时候不触发点击事件
			if(self.$isOpenBtnDrag){
				self.$isOpenBtnDrag = false;
				return false;
			}

			if(evt.type == 'keyup'){

				// 广播页面回车事件
				if(evt.keyCode == 13){
					self.cast('documentEnter');
				}

				// shift+A快速打开当前筛选栏
				if(evt.keyCode == 65 && evt.shiftKey && evt.target.nodeName == 'BODY'){
					self.cast('documentOpenFilter');
				}

				// 如果不是esc键，禁止esc作用
				if(evt.keyCode != 27){
					return false;
				}

				// 如果快捷圆按钮隐藏，禁止esc作用
				if(self.$doms.popGridOpenBtn.is(":hidden")){
					return false;
				}

				// 如果处在input输入形式的时候，禁止esc作用
				if(evt.target.type == 'text' || evt.target.type == 'textarea'){
					return false;
				}
			}

			// 旧
			// if(self.$activeScenes !== 'POPGRID'){
			// 	self.openPopGrid();
			// } else {
			// 	self.onPopGridHide();
			// }

			// 新
			if(self.$activeScenes !== 'POP'){
				self.openPop();
			} else {
				self.onPopHide();
			}

			evt.preventDefault();
		},
		// document的keydown事件
		eventDocumentSpace: function(evt, elm){
			var self = this;
			if(evt.type == 'keydown'){
				if(evt.keyCode == 32){
					// 有筛选栏出没的时候，
					// 广播页面space空格点击；阻止空格默认滚动；
					if($('.G-frameBodySidebar:visible').length){
						self.cast('SidebarSpace');
						return false;
					}
				}
			}
		},
		// 开关dialog-open样式
		toggleOpenClass: function(bool){
			var self = this;
			var scrollBarWidth = bool ? util.getScrollBarWidth() : 0; // 滚动条宽度
			$('html').toggleClass('dialog-open', bool);
			// 修改padding，防止列表崩塌
			$('.G-frameBodyContent').css({
				'padding-right': scrollBarWidth + 28
			});
			return self;
		},
		onSwitchPage: function(ev){
			var scrollBarWidth = 28; // 滚动条宽度
			$('.G-frameBodyContent').css({
				'padding-right': scrollBarWidth
			});
		},
		// 新形式
		// ---------------------------------------------------------------
		togglePopBtn: function(bool){
			var self = this;
			self.$doms.popGridOpenBtn[bool ? 'show' : 'hide']();
			// self.$doms.popGridOpenBtn.toggle(self.$.pop.count() > 0);
			return self;
		},
		openPop: function(config){
			var self = this;
			if (self.$activeScenes !== 'POP') {
				self.$originScenes = self.$activeScenes;
			}

			self.toggleOpenClass(true);
			self.switchScenes('POP');
			if(self.$.pop){
				self.$.pop.show();
				if(config){
					self.$.pop.addItem(config);
					self.togglePopBtn(true);
				}
			}
		},
		onPopShow: function(ev){
			var self = this;
			var doms = self.$doms;
			//  pop显示的时候，将SCENES_POPUP移到pop层里面
			doms.SCENES_POPUP.appendTo($('.G-framePopBoard'));
		},
		// 弹出表格隐藏消息处理
		onPopHide: function(ev) {
			var self = this;
			var doms = self.$doms;
			self.switchScenes(self.$originScenes);
			// self.togglePopBtn();
			self.toggleOpenClass(false);
			if(self.$.pop){
				self.$.pop.toggleShowClass(false);
			}
			// pop隐藏的时候，将SCENES_POPUP移回原来的位置
			doms.SCENES_POPUP.insertAfter(doms.SCENES_POP);
			return false;
		},
		// 下面是旧形式
		//------------------------------------------------------------
		// 根据subgrid的个数判定是否显示popGrid打开按钮
		togglePopGridBtnDisplay: function(){
			var self = this;
			self.$doms.popGridOpenBtn.toggle(self.$.pop_grid.count() > 0);
			return self;
		},
		// 打开popGrid窗口
		openPopGrid: function() {
			var self = this;
			if (self.$activeScenes !== 'POPGRID') {
				self.$originScenes = self.$activeScenes;
			}
			self.switchScenes('POPGRID');
			if(this.$.pop_grid){
				this.$.pop_grid.show();
			}

			self.toggleOpenClass(true);
		},
		// 新增一项弹出表格
		popGridPush: function(config) {
			var self = this;
			self.openPopGrid();
			self.setTimeout(self.togglePopGridBtnDisplay, 100);
			return self.$.pop_grid.addItem(config);
		},
		setSubGridParam: function(name, param) {
			if(this.$.pop_grid){
				this.$.pop_grid.cast('subgridParam', {
					name: name
					,data: param
				});
			}
			if(this.$.pop){
				this.$.pop.cast('subgridParam', {
					name: name
					,data: param
				});
			}
		},
		// 弹出表格隐藏消息处理
		onPopGridHide: function(ev) {
			var self = this;
			self.switchScenes(self.$originScenes);
			self.togglePopGridBtnDisplay();
			self.toggleOpenClass(false);
			return false;
		}
	});
	exports.base = Platform;

});