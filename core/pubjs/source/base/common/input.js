define(function(require, exports){
	var $ = require('jquery');
	var pubjs = require('../../core/pub');
	var util  = require('../../core/util');
	var view  = require('../view');
	var Tip = require('@base/tip').base;

	/**
	 * Input类
	 */
	var Base = view.widget.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'layout': {
					'tag': 'span',
					'class': 'M-commonInput'
				},
				'class': '',
				'tag': 'input',
				'type': 'button',
				'attr': null,
				'css': null,
				'width': 0,
				'height': 30,
				'value': LANG('按钮'),
				'events': 'click',
				'data': '',
				'placeholder': ''
			});

			this.Super('init', arguments);
		},
		afterBuild: function(layout){
			var self = this;
			var c = self.getConfig();
			var input = self.$input = $('<'+c.tag+' />');

			// 设置属性
			if (c.attr){
				input.attr(c.attr);
			}
			input.attr('type', c.type);

			if(c.placeholder){
				input.attr('placeholder', c.placeholder);
			}

			// 设置CSS和尺寸
			if (c.css){
				input.css(c.css);
			}
			if (c.width){
				input.width(c.width);
			}
			if (c.height){
				input.height(c.height);
			}
			if (c.data){
				input.attr('data-op', c.data);
			}

			// 设置样式
			var cls = c['class'] || [];
			if (!util.isArray(cls)){
				cls = [cls];
			}
			// if (c.type == 'button'){
				//cls.push('btn');
			// }
			if (cls.length){
				input.addClass(cls.join(' '));
			}

			// 插入对象到目标对象
			if (layout){
				self.append(input);
			}else {
				self.$el = input;
				self.appendTo(c.target);
			}

			// 绑定事件
			if (c.events){
				self.uiBind(input, c.events, 'eventHandler');
			}

			if (c.value){
				self.setValue(c.value);
			}
		},
		// 事件转发
		// onInputClick ..
		eventHandler: function(evt, elm){
			var self = this;
			self.fire('input' + util.ucFirst(evt.type),{
				'value': self.getValue(),
				'target': elm,
				'data': $(elm).attr('data-op')
			});
		},
		setValue: function(value){
			this.$input.val(value);
			return this;
		},
		getValue: function(){
			return this.$input.val();
		},
		// 转发操作
		click: function(){
			var el = this.$input;
			el.click.apply(el, arguments);
			return this;
		},
		blur: function(){
			var el = this.$input;
			el.blur.apply(el, arguments);
			return this;
		},
		focus: function(){
			var el = this.$input;
			el.focus.apply(el, arguments);
			return this;
		},
		enable: function(){
			this.$input.prop('disabled', false);
			return this;
		},
		disable: function(){
			this.$input.prop('disabled', true);
			return this;
		}
	});
	exports.base = Base;

	var Button = Base.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'tag': 'button',
				'icon': null,
				'width': 100
			});

			this.Super('init', arguments);
		},
		setValue: function(val){
			var self = this;
			var icon = self.getConfig('icon');
			var btn = self.$input;
			if (icon){
				btn.html('<i class="'+icon+' pr5"></i>' + util.html(val));
			}else {
				btn.text(val);
			}
			return self;
		},
		getValue: function(){
			return this.$input.text();
		}
	});
	exports.button = Button;

	var Text = Base.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'value': '',
				'type':'text',
				'placeholder':null,
				'beforeText': '',
				'afterText': ''
			});

			this.$bindPlaceholder = false;
			this.Super('init', arguments);

			window.inp = this;
		},
		afterBuild: function(){
			var self = this;
			self.Super('afterBuild', arguments);
			var c = self.getConfig();
			var el = self.getDOM();

			if (c.beforeText){
				this.$beforeText = $('<span class="M-commonInputPrefix" />').text(c.beforeText).prependTo(el);
				el.find('input').css('text-indent', 14);
			}
			if (c.afterText){
				this.$afterText = $('<span class="M-commonInputSuffix" />').text(c.afterText).appendTo(el);
			}
			if(c.readOnly){
				el.find('input').attr("readonly","readonly");
			}
			// @暂遗弃 placeholder使用html 5 的placeholder属性
			// self.setPlaceholder(self.getConfig('placeholder'));
		},
		eventPlaceHolder: function(evt){
			var self = this;
			var input = self.$input;
			var val = input.val();
			var def = self.$placeholder;

			switch (evt && evt.type){
				case 'focus':
					if (val == def){
						val = '';
						input.val(val);
					}
					break;
				case 'blur':
					if (!val){
						val = def;
						input.val(val);
					}
					break;
			}
			input.toggleClass('M-commonInputPlaceholder', (Boolean(def) && (val == def)));
		},
		setPlaceholder: function(val){
			var self = this;
			var bind = self.$bindPlaceholder;
			self.$placeholder = val;
			if (val && !bind){
				self.$bindPlaceholder = true;
				self.uiBind(self.$input, 'focus.placeholder blur.placeholder', self.eventPlaceHolder);
			}else if (!val && bind){
				self.$bindPlaceholder = false;
				self.uiUnbind(self.$input, 'focus.placeholder blur.placeholder');
			}
			self.eventPlaceHolder();
			return self;
		},
		setValue: function(value){
			var self = this;
			self.$input.val(value);
			// self.$input.val(value || self.$placeholder || '');
			// 调用事件, 更新样式
			// if (self.$placeholder){
			// 	self.eventPlaceHolder();
			// }
			return self;
		},
		updatePlaceholder: function(val){
			var self = this;
			var c = self.getConfig();
			self.$input.attr('placeholder', val || c.placeholder);
			return self;
		},
		reset: function(){
			var self = this;
			self.$input.val('');
			return self;
		}
	});
	exports.text = Text;

	var Radio = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'class': 'M-commonItem',
				'data': [],
				'value': '',
				'changeEvent': false,
				'autoChange': true, // 构建后是否自动触发changeEvent
				'eventWithoutChange': false, //是否允许不改变值的情况下，仍然广播事件；
				'tips':'',		// 提示说明
				'type': 'radio',
				'key': 'value',
				'name': 'text',
				'reqType': 'ajax',
				'autoLoad': true,
				'setDataType': 'click',
				'vertical': false, // 是否竖排
				'hasVerifyValue': false, // 用于是否开启验证值作用
				'verifyValue': 0, // 验证值，用于getData为空的时候，返回这个值；
				'id': 'form_el_' + util.guid(),
				'labelWidth': null,	// 单个选项宽度
				'labelHeight': null,	// 单个选项高度
				'customCheckbox': false // 是否开启自定义checkbox样式
			});

			this.last_value = null;
			this.list = [];
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			if(c.data && c.data.length && !c.url){
				this.buildList();
			}else{
				if(c.autoLoad && c.url){
					this.load();
				}
			}
		},
		buildList: function(data){
			var el = this.getDOM();
			el.find('.M-commonItemCon').remove();
			this.list = [];
			var c = this.getConfig();
			var con, input, label, opt, id, not_select = true;
			data = data || c.data;
			for (var i=0; i<data.length; i++){
				opt = data[i];
				if (util.isString(opt)){
					opt = {'text':opt, 'value':i, 'name':opt, 'id': i};
				}else {
					opt = $.extend({'text':LANG('选项'), 'value':i, 'name':LANG('选项'), 'id':i}, opt);
				}
				id = c.id + '_' + i;
				con = $('<div class="M-commonItemCon"/>').appendTo(el);

				// 单个选项宽度
				if(c.labelWidth){
					con.width(c.labelWidth);
				}
				// 单个选项高度
				if(c.labelHeight){
					con.height(c.labelHeight);
				}
				input = $('<input/>')
					.attr({
						'type': c.type,
						'name': c.id,
						'id': id,
						'data-id': opt.id === 0 ? 0 : (opt.id || opt._id || opt.value || null),
						'checked': opt.checked,
						'value': opt[c.key]
					})
					.appendTo(con);

				label = $('<label class="M-commonItemRadio text-truncate"/>').attr('for', id).appendTo(con);
				// 设置宽度，为了能够截断生效
				if(c.labelWidth){
					label.outerWidth('85%');
				}
				if(c.vertical){
					$('<div class="M-commonItemRadioIsolation"/>').appendTo(el);
				}
				if (opt.html){
					label.html(opt.html).attr('title', opt.html);
				}else {
					label.text(LANG(opt[c.name])).attr('title', LANG(opt[c.name]));
				}

				if (c.changeEvent){
					this.uiBind(input, 'change', opt, 'eventChange');
					if(c.type == 'checkbox'){
						if(c.customCheckbox){
							$([
								'<i class="custom-checkbox">',
									'<i class="icon-checkbox-in"/>',
								'</i>'
							].join('')).prependTo(label);
							con.addClass('custom');
						}
						this.uiBind(input, 'click', opt, 'eventCheckboxChange');
					}
				}
				if (not_select && (opt.value == c.value || opt.id == c.value || opt._id == c.value)){
					input.prop('checked', true);
					not_select = false;
					if(c.autoChange){
						input.change();
					}
				}

				this.list.push(input);
			}

			// 提示说明
			if(c.tips){
				this.createAsync('tips', '@base/tip.desc', {
					target: $('<div class="M-commonItemTips"/>').appendTo(el),
					data: c.tips
				})
			}
		},
		setData: function(data){
			var c = this.getConfig();
			var chk;
			var isClick = (c.setDataType == 'click');
			var list = this.list;
			c.value = data;
			for (var i=0; i<list.length; i++){
				chk = (list[i].val() == data || list[i].attr('data-id') == data);
				if (isClick){
					if (chk){
						list[i].click();
					}
				}else {
					list[i].prop('checked', chk);
				}
			}
			return this;
		},
		getData: function(complete){
			var c = this.getConfig();
			for (var i=0; i<this.list.length; i++){
				if (this.list[i].prop('checked')){
					return complete ? c.data[i] : this.list[i].val();
				}
			}
			return c.hasVerifyValue ? c.verifyValue : '';
		},
		/*
		* param data : 要设置的radio
		* param state : 要设置的状态值，当为true是就为disable 当为false就为 enable
		 */
		disable:function(data,state){
			for (var i=0; i<this.list.length; i++){
				if(data === true || data === false){
					// 整个组件禁用启用
					this.list[i].parent().toggleClass('is-disabled', data);
				}else{
					if (this.list[i].val() == data || this.list[i].attr('data-id') == data){
						this.list[i].parent().toggleClass('is-disabled', state);
						break;
					}
				}
			}
			return this;
		},
		disableAll: function(bool){
			for (var i=0; i<this.list.length; i++){
				this.list[i].parent().toggleClass('is-disabled', bool);
			}
			return this;
		},
		eventChange: function(evt, elm){
			var data = evt.data;
			var c = this.getConfig();
			if (this.last_value === data){
				// 是否允许不改变值的情况下，仍然广播事件；
				if(!c.eventWithoutChange){
					return false;
				}
			}

			if (data){
				c.value = data.value;
				this.last_value = data;
				data.el = evt.target || evt.srcElement;
				this.fire('radioChange', data);
			}
		},
		// 加载数据
		load: function(){
			var self = this;
			var c = self.getConfig();

			pubjs.sync();
			switch(c.reqType){
				case 'ajax':
					pubjs.data.get(
						c.url
						,$.extend({}, c.param, this.sysParam)
						,self
						,'afterLoad'
					);
				break;
				case 'websocket':
					pubjs.mc.send(c.url, $.extend({}, c.param, this.sysParam), this.afterLoad.bind(this));
				break;
			}
			//pubjs.data.get(c.url, c.param, self, 'afterLoad');
			return self;
		},
		afterLoad: function(err, data){
			if (err){
				if (err.message){
					pubjs.alert(err.message);
				}
				pubjs.error(err);
			}else {
				var c = this.getConfig();
				c.data = c.data.concat(data.items || data);
				this.buildList();
			}
			pubjs.sync(true);
		},
		reset: function(){
			for (var i=0; i<this.list.length; i++){
				this.list[i].prop('checked',false);
			}
			return this;
		}
	});
	exports.radio = Radio;

	var Checkbox = Radio.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'data': [],
				'value': '',
				'changeEvent': false,
				'type': 'checkbox',
				'hasSearch': false,
				'hasSelectAll': false,
				'hasInverse': false,
				'hasEmpty': false,
				'customCheckbox': false // 是否开启自定义checkbox样式, ture的时候请勿配置全选反选清空按钮
			});

			this.last_value = null;
			this.Super('init', arguments);
		},
		afterBuild: function(){
			this.Super('afterBuild', arguments);
			var self = this;
			var c = self.getConfig();
			var el = self.getDOM();

			var tools = $('<div class="M-commonItemTools"/>').appendTo(el);

			if(c.hasSearch){
				self.createAsync('search', '@base/common/base.search', {
					'target': tools
				});
			}

			if(c.hasSelectAll){
				$('<input type="button" data-type="all" value="'+LANG('全选')+'"  class="btn btn-default"/>').appendTo(tools);
			}
			if(c.hasInverse){
				$('<input type="button" data-type="inverse" value="'+LANG('反选')+'"  class="ml10 btn btn-default"/>').appendTo(tools);
			}
			if(c.hasEmpty){
				$('<input type="button" data-type="empty" value="'+LANG('清空')+'"  class="ml10 btn btn-default"/>').appendTo(tools);
			}
			// 绑定弹框按钮事件
			self.uiBind(tools.find('input[type="button"]'), 'click', 'eventToolsButtonClick');
		},
		// 重新绑定checkbox改变事件
		eventCheckboxChange: function(evt, elm){
			var c = this.getConfig();
			var data = evt.data;
			if (data){
				data.checked = $(elm).prop('checked') || false;
				data.selected = this.getData();
				if(c.customCheckbox){
					$(elm).parent().toggleClass('change');
				}
				this.fire('checkboxChange', data);
			}
		},
		// 功能按钮点击
		eventToolsButtonClick: function(evt, elm){
			var type = $(elm).attr('data-type');
			var list = this.getDOM();
			var unsels, sels;
			switch(type){
				case 'all':
					unsels = list.find('input:not(:checked)').filter(':visible');
					list.find(':checkbox').filter(':visible').prop('checked', Boolean(unsels.length));
				break;
				case 'inverse':
					sels = list.find('input:checked').filter(':visible');
					unsels = list.find('input:not(:checked)').filter(':visible');
					sels.prop('checked', false);
					unsels.prop('checked', true);
				break;
				case 'empty':
					this.reset();
				break;
			}
			this.fire('selectedCheckbox', {
				'sels': list.find(':checkbox'),
				'unsels': list.find('input:not(:checked)')
			});
			return false;
		},
		onSearch: function(ev){
			var self = this;
			var val = ev.param.toLowerCase();
			var box;
			for(var i=0; i<self.list.length; i++){
				box = self.list[i];
				var name = box.next('label').text().toLowerCase();
				if(name.indexOf(val) != -1){
					self.list[i].parent().show();
				}else{
					self.list[i].parent().hide();
				}
			}

			return false;
		},
		// 参数attr，指匹配的值，带这个参数的时候默认为data-id;
		setData: function(data, attr){
			var box;
			var c = this.getConfig();
			if(!data||!data.length){return;}
			this.reset();

			for (var i=0; i<this.list.length; i++){
				box = this.list[i];
				for(var x=0; x<data.length; x++){
					if(attr || attr == 'data-id'){
						if (box.attr('data-id') == data[x]){
							box.prop('checked',true);
							box.parent().addClass(c.customCheckbox ? 'change' : '');
						}
					}else{
						if (box.val() == data[x]){
							box.prop('checked',true);
							box.parent().addClass(c.customCheckbox ? 'change' : '');
						}
					}
				}
			}
		},
		// 返回一个数组, 参数type代表要获取input中那个值，带这个参数的时候默认为data-id;
		getData: function(type){
			var arr = [];
			var c = this.getConfig();
			for (var i=0; i<this.list.length; i++){
				if (this.list[i].prop('checked')){
					if (type) {
						// 返回id或data-id;
						if(type == 'id' || type == 'data-id'){
							if(isNaN(+this.list[i].attr('data-id'))){
								arr.push(this.list[i].attr('data-id'));
							}else{
								arr.push(+this.list[i].attr('data-id'));
							}
						}
						// 返回部分数据
						if(type === 'data') {
							var t = {};
							if(isNaN(+this.list[i].attr('data-id')))
							{
								t.id = this.list[i].attr('data-id');
							}
							else
							{
								t.id = +this.list[i].attr('data-id');

							}
							t['data-id'] = this.list[i].val();
							t.value = this.list[i][0].labels[0].innerText;
							arr.push(t);
						}
						// 返回完整的已选数据
						if(type == 'complete'){
							var val = this.list[i].val();
							var item = util.find(c.data, val, c.key);
							if(item){
								arr.push(item);
							}
						}
					}
					else{
						arr.push(this.list[i].val());
					}
				}
			}
			return arr;
		},
		reset: function(){
			for (var i=0; i<this.list.length; i++){
				this.list[i].prop('checked',false);
				this.list[i].parent().removeClass('change');
			}
			return this;
		}
	});
	exports.checkbox = Checkbox;

	/**
	 * 可增减输入框- 数量可变
	 */
	var FlexibleInput = Text.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'type':'text',
				'placeholder':null,
				'class': '',
				'intervalText': '',
				'width':'',
				'hasDelete': true
			});

			this.$data = null;
			this.$amount = 0;
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var klazz = this.getConfig('class');
			var con = $('<div class="M-commonFlexibleInputWrap"/>');

			this.append(con);

			if (klazz) {
				this.addClass(klazz);
			}


			//构建input组
			this.$inputGroup = $('<div class="M-commonFlexibleInput"></div>').appendTo(con);
			//按钮-新增一个输入框
			var addBtn = $('<span class="M-commonFlexibleInputAdd"><i class="icon-add"/></span>').appendTo(con);

			//绑定按钮事件
			this.uiBind(addBtn,"click", "eventAddItem");
			this.uiProxy(this.$inputGroup, '.M-commonFlexibleInputDel', 'click', 'eventDelItem');

			//构建单条input组
			if (this.$data){
				this.setData(this.$data);
			}else {
				this.buildItem();
			}
		},
		/**
		 * 单条input组
		 * @return {Object} Jquery对象
		 */
		buildItem: function(value){
			var c = this.getConfig();

			//单条input组
			var inputDiv =$('<div class="M-commonFlexibleInputDiv"/>').appendTo(this.$inputGroup);

			// 输入框input
			this.input = this.create(Text,{
				'placeholder': c.placeholder,
				'value': value || '',
				'width': c.width,
				'attr':{'id': c.id}
			}).appendTo(inputDiv);


			//按钮-删除当前输入框
			$('<span class="M-commonFlexibleInputDel icon-close"></span>').appendTo(inputDiv).hide();


			if(c.intervalText){
				$('<span class="ml5 mr5 intervalText"/>').html(c.intervalText).hide().prependTo(inputDiv);
			}

			this.$amount++;
			if (this.$amount > 1){
				if(c.hasDelete){
					this.$inputGroup.find(".M-commonFlexibleInputDel").show();
				}

				this.$inputGroup.find(".intervalText").show();
				this.$inputGroup.find(".intervalText").eq(0).hide();
			}
		},
		/**
		 * 新增输入框 -按钮的回调事件
		 * @param  {object} ev 事件对象
		 */
		eventAddItem: function(ev, elm){
			this.buildItem();
		},
		/**
		 * 删除输入框 -按钮的回调事件
		 * @param  {object} ev 事件对象
		 */
		eventDelItem: function(ev, elm){
			if(this.$amount > 1){
				this.$amount--;
				$(elm).parent().remove();
				//若只剩下一个输入框，隐藏删除按钮
				if(this.$amount==1){
					this.$inputGroup.find(".M-commonFlexibleInputDel").hide();
					this.$inputGroup.find(".intervalText").hide();
				}
			}
		},
		getData: function(){
			//在数组inputs中的每一条，返回各自的val;
			//保存在data数组里面。
			var inputs = this.getDOM().find("input");
			var data = [], val;
			for(var i=0; i<inputs.length; i++){
				val = util.trim($(inputs[i]).val());
				if (val !== ''){
					data.push(val);
				}
			}
			return data;
		},
		setData: function(data){
			this.$data = data;
			if(data){
				this.$inputGroup.empty();
				this.$amount = 0;
				for(var i=0; i<data.length; i++){
					//调用buildItem，创建输入框
					this.buildItem(data[i]);
				}
				if (this.$amount === 0){
					this.buildItem();
				}
			}else {
				this.reset();
			}
			return this;
		},
		reset: function(){
			this.$data = null;
			this.$inputGroup.empty();
			this.$amount=0;
			this.buildItem();
		}
	});
	exports.flexibleInput = FlexibleInput;

	/**
	 * 按钮组模块
	 */
	var ButtonGroup = view.container.extend({
		init: function(config){
			config = pubjs.conf(config, {
				'items': null,
				'selected': null,
				'no_state': false,
				'disabled': false
			});
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			self.$doms = {};
			self.buildItems();
			self.updateSelected();
			self.addClass('btn-group');
			self.uiProxy('input', 'click', 'eventClick');
		},
		/**
		 * 禁用某几个按钮
		 * @param  {Array}  items   按钮索引数组
		 * @return {Object}         实例对象
		 */
		disableItems:function(items){
			var self = this;
			var c = self.getConfig();
			var doms = self.$doms;
			util.each(c.items, function(item, index){
				doms['item_'+index].prop('disabled', false).removeClass('is-disabled');
			});

			util.each(items, function(i){
				var item = doms['item_'+i];
				if (item){
					item.prop('disabled', true);
					item.addClass('is-disabled');
				}
			});
			return self;
		},
		// 禁用
		disable: function() {
			var c = this.getConfig();
			var doms = this.$doms;
			util.each(c.items, function(item, index){
				doms['item_'+index].prop('disabled', true).addClass('is-disabled');
			});

			return this;
		},
		// 启用
		enable: function() {
			this.disableItems([]);
			return this;
		},
		// 生成按钮组按钮项目
		buildItems: function(){
			var self = this;
			var doms = self.$doms;
			var c = self.getConfig();
			util.each(c.items, function(item, index){
				var id = 'item_'+index;
				var name = (item && item.text) || item;
				if (util.has(doms, id)) {return;}

				var dom = $('<input class="btn btn-default" type="button"/>');
				doms[id] = dom.attr('data-id', index)
							.val(name)
							.prop('disabled', item.disabled || c.disabled);
				self.append(dom);
			});
			return self;
		},
		// 更新按钮选中状态
		updateSelected: function(){
			var self = this;
			var c = self.getConfig();
			if (c.no_state) {return false;}
			var doms = self.$doms;
			self.getDOM().children('.btn-active').removeClass('btn-active');
			if (c.selected !== null){
				var item = doms['item_' + c.selected];
				if (item){
					item.addClass('btn-active');
				}
			}
			return self;
		},
		// 按钮点击事件
		eventClick: function(evt, elm){
			var c = this.getConfig();
			var id = $(elm).attr('data-id');
			if (!c.no_state && id === c.selected){ return false; }
			var msg = {
				last: c.selected,
				selected: id,
				item: c.items[id] || null
			};
			c.selected = id;
			if (!c.no_state) { this.setData(id); }
			this.fire('changeButton', msg);
		},
		// 重置控件, 清除按钮组选项按钮
		reset: function(){
			var self = this;
			util.each(self.$doms, function(item, name){
				if (name == 'group') {return;}
				item.remove();
				return null;
			});
			var c = self.getConfig();
			c.items = null;
			c.selected = null;
			return self;
		},
		// 设置控件数据
		setData: function(selected, items, noSilence){
			var self = this;
			var c = self.getConfig();
			if (util.isArray(selected)){
				items = selected;
			}else {
				c.selected = selected;
			}
			if (items){
				self.reset();
				c.items = items;
				self.buildItems();
			}
			self.updateSelected();
			if(noSilence){
				self.$doms['item_'+selected].click();
			}

			return self;
		},
		// 获取选中状态
		getData: function(complete){
			var c = this.getConfig();
			return complete?{
				"id":c.selected,
				"text":c.items[c.selected]
			}:c.selected;
		},
		setValue: function(selected) {
			var c = this.getConfig();
			c.selected = selected;
			this.updateSelected();
			return this;
		},
		getValue: function() {
			var c = this.getConfig();
			return c.selected;
		},
		/**
		 * 设置单个控件的数据
		 * @param {Number} index 索引
		 * @param {Object} data  数据item
		 */
		setItem: function(index, data) {
			var self = this;
			var item = self.getConfig('items/'+index);
			item = $.extend(item, data);
			var id = 'item_' + index;
			var name = item && item.text;
			self.$doms[id].val(name);
			return self;
		}
	});
	exports.buttonGroup = ButtonGroup;


	/**
	 * 时间粒度切换模块
	 */
	var TimeRange = view.container.extend({
		init: function(config){
			config = pubjs.conf(0, config, {
				'items': [
					LANG('小时'), LANG('天'), LANG('周'),
					LANG('月'), LANG('季'), LANG('年')
				],
				'selected': 0
			});
			this.Super('init', arguments);
		},
		afterBuild: function(){
			var self = this;
			var c = self.getConfig();
			self.addClass('M-commonTimeRange');
			self.create('buttons', ButtonGroup, {
				'items': c.items,
				'selected': c.selected
			});
		},
		/**
		 * 切换时间粒度
		 */
		onChangeButton: function(ev){
			var c = this.getConfig();
			c.selected = +ev.param.selected;
			this.fire('changeTimeRange', {
				selected: c.selected,
				item: ev.param.item
			});
			return false;
		},
		/**
		 * 禁用某几个按钮
		 * @param  {Array}  items   按钮索引数组
		 * @return {Object}         实例对象
		 */
		disableItems:function(items){
			if(!items || !items.length){
				return this;
			}
			this.$.buttons.disableItems(items);
			var sel = this.getConfig('selected');
			if (util.index(items, sel) != null){
				// 粒度已经被禁用, 变为小时粒度
				this.setData(0);
			}
			return this;
		},
		getData: function(detail){
			var item = this.$.buttons.getData(true);
			return detail ?  item : item.id;
		},
		setData: function(sid, items, noSilence){
			var btns = this.$.buttons;
			btns.setData.apply(btns, arguments);
			this.setConfig('selected', sid);

			return this;
		},
		setDateRange: function(date){
			var days = Math.round((util.toDate(date.enddate) - util.toDate(date.begindate)) / 86400000);
			var items = [];
			if (days < 365){ items.push(5); }
			if (days < 90){ items.push(4); }
			if (days < 30){ items.push(3); }
			if (days < 7){ items.push(2); }
			if (days < 1){ items.push(1); }
			this.disableItems(items);

			// 更加日期更新值
			var sid = 0;
			if(days <= 1){
				sid = 0;
			}
			if(days > 1 && days < 30){
				sid = 1;
			}
			if(days >= 30 && days < 90){
				sid = 2;
			}
			if(days >= 90 && days < 365){
				sid = 3;
			}
			this.setData(sid, null, true);
			return this;
		}
	});
	exports.timeRange = TimeRange;

	// 该模块用于生成多个radio
	var RadioGroup = view.container.extend({
		init: function(config) {
			config = pubjs.conf(config, {
				// 当items要从远端拉取时的url地址
				'class': 'M-commonRadioGroup',
				'url': null,
				// 默认通信方式使用ajax，可选websocket
				"reqType": "ajax",
				'param': null,
				'auto_load': true,
				// data为初始化列表
				// {'text': label中的文字, 'value': radio中的value, 'checked': 是否选中, 不填则不选}
				'data': null,
				// 初始化状态
				'value': null,
				// 根据请求数据生成时用到，对应checkbox的value
				'key': 'value',
				// 根据请求数据生成时用到，对应checkbox的label
				'name': 'text',
				// 是否显示搜索框
				'search': false,
				// 限制高度出现滚动条
				'height': 0,
				// 新建后马上广播事件
				'autoChange': true,
				// 只读
				'readonly': false
			});

			var self = this;
			// 使用guid来生成不重复的name
			self.$inputName = 'input' + util.guid();
			self.$inputType = self.$inputType || 'radio';

			// 储存所有item数据
			self.$data = null;
			self.$list = null;
			self.$value = config.get('value');
			self.$index = null;
			self.$inputs = [];

			self.Super('init', arguments);
		},
		afterBuild: function() {
			var self = this;
			var el = self.getDOM();
			var c = self.getConfig();
			// 添加搜索框
			if (c.search) {
				var searchDiv = $('<div class="M-commonRadioGroupSearch"/>').appendTo(el);
				var input = self.$searchInput = $('<input type="text" class="checkBoxGroupSearch" />');
				input.attr('placeholder', LANG('请输入搜索关键字')).appendTo(searchDiv);
				self.uiBind(input, 'keyup', 'eventSearchInputKeyup');

				var btn = $('<button class="btn btn-default" />').text(LANG('取消')).appendTo(searchDiv);
				self.uiBind(btn, 'click', 'eventClearSearch');
			}

			var itemCon = self.$itemsDiv = $('<div class="items"></div>').appendTo(el);
			if (c.height){
				var con = $('<div />').css('max-height', c.height).appendTo(el);
				self.$itemsDiv.appendTo(con);
				if(util.isMobile()){
					con.css('overflow-y', 'auto');
				}else{
					self.createAsync('scroller', '@base/common/base.scroller', {
						'dir': 'V',
						'target': con,
						'content': itemCon,
						'wrap': true,
						'watch': true
					});
				}
			}

			self.uiProxy(itemCon, 'input', 'change', 'eventValueChange');

			if (c.data) {
				self.setData(c.data);
			}else if (c.url && c.auto_load){
				self.load();
			}
		},
		// 构建选项项目
		buildItems: function(items) {
			var self = this;
			var c = self.getConfig();
			var con = self.$itemsDiv;
			var type = self.$inputType;
			var name = self.$inputName;

			// 首先清空所有item
			con.empty();

			util.each(items, function(item, index){
				var label = $('<label title="'+item[c.name]+'"/>').text(item[c.name]).appendTo(con);
				var input = $('<input type="'+type+'"/>').prependTo(label);
				input.attr('name', name).attr({
					'value': index,
					'data-id': item[c.key]
				}).prop('disabled', c.readonly);
				self.$inputs.push(input);
			});

			if (self.$value !== null){
				self.setValue(self.$value);
			}
		},
		// 搜索框的事件，每有输入的时候就进行搜索
		eventSearchInputKeyup: function(ev) {
			var self = this;
			var items = self.$list;

			if (items){
				// 获得输入框文字
				var inputText = this.$searchInput.val();
				if (inputText){
					// 过滤项目
					var result = {};
					var name = self.getConfig('name');
					util.each(items, function(item, index){
						if (item[name].indexOf(inputText) !== -1) {
							result[index] = item;
						}
					});
					self.buildItems(result);
				}else {
					// 显示所有项目
					self.buildItems(items);
				}
			}
		},
		eventClearSearch: function(evt){
			this.$searchInput.val('');
			this.eventSearchInputKeyup(evt);
			return false;
		},
		eventValueChange: function(evt, elm){
			var self = this;
			self.$index = elm.value;
			var item = (self.$list && self.$list[elm.value]);
			if (item){
				this.$value = item[self.getConfig('key')];
			}
			// 冒泡单选框变化事件
			this.fire('radioChange', this.$value);
		},
		// 设置加载参数
		setParam: function(param){
			return this.extendConfig('param', param);
		},
		// 加载数据
		load: function(){
			var self = this;
			var c = self.getConfig();

			pubjs.sync();
			switch(c.reqType){
				case 'ajax':
					pubjs.data.get(
						c.url
						,$.extend({}, c.param, this.sysParam)
						,self
						,'afterLoad'
					);
				break;
				case 'websocket':
					pubjs.mc.send(c.url, $.extend({}, c.param, this.sysParam), this.afterLoad.bind(this));
				break;
			}
			//pubjs.data.get(c.url, c.param, self, 'afterLoad');
			return self;
		},
		afterLoad: function(err, data){
			if (err){
				if (err.message){
					pubjs.alert(err.message);
				}
				pubjs.error(err);
			}else {
				this.setData(data.items);
			}
			pubjs.sync(true);
		},
		// 设置当前值
		setValue: function(value){
			var self = this;
			var con = self.$itemsDiv;
			var key = self.getConfig('key');
			// 保存数据
			self.$value = value;
			if (self.$list){
				self.$index = util.index(self.$list, value, key);

				// 更新状态
				con.find('input').prop('checked', false);
				con.find('input[value="'+self.$index+'"]').prop('checked', true);
				if(self.getConfig('autoChange')){
					con.find('input[value="'+self.$index+'"]').change();
				}
			}
			return self;
		},
		// 获取当前值
		getValue: function(){
			return this.$value;
		},
		getFullValue: function(){
			var self = this;
			return (self.$list && self.$list[self.$index]);
		},

		// 返回当前显示数据对象列表
		getData: function() {
			return this.$data;
		},
		// 设置要显示的对象列表, 构建对象
		setData: function(data) {
			this.$data = data;
			var list = this.$list = {};
			util.each(data, function(item, index){
				list[index] = item;
			});
			// 构建子项目
			this.buildItems(list);

			return this;
		},
		// 重置模块
		reset: function() {
			var self = this;
			self.$data = self.$value = self.$index = self.$list = null;
			self.$itemsDiv.empty();
			if (self.$searchInput){
				this.$searchInput.val('');
			}

			var c = self.getConfig();
			if (c.data){
				self.setData(c.data);
			}else if (c.auto_load && c.url){
				self.load();
			}
			return self;
		},
		// 禁用
		disable: function () {
			this.$itemsDiv.find('input').prop('disabled', true);
			return this;
		},
		// 启用
		enable: function () {
			this.$itemsDiv.find('input').prop('disabled', false);
			return this;
		}
	});
	exports.radioGroup = RadioGroup;

	// 多选框Checkbox分组模块
	var CheckBoxGroup = RadioGroup.extend({
		init: function(){
			var self = this;
			self.$inputType = 'checkbox';
			self.Super('init', arguments);
		},
		eventValueChange: function(evt, elm){
			var self = this;
			var val = elm.value;
			var key = self.getConfig('key');
			var item = (self.$list && self.$list[val]);
			var index = self.$index = (self.$index || []);
			var value = self.$value = (self.$value || []);

			var pos = util.index(index, val);
			if (elm.checked){
				if (pos === null){
					index.push(val);
					value.push(item[key]);
				}
			}else {
				if (index !== null){
					index.splice(pos, 1);
					value.splice(pos, 1);
				}
			}
		},
		setValue: function(value){
			var self = this;
			var con = self.$itemsDiv;
			var key = self.getConfig('key');
			var list = self.$list;
			// 保存数据
			self.$value = value;
			// 查找选中的项目
			if (list){
				var index = self.$index = [];
				util.each(value, function(id){
					var idx = util.index(list, id, key);
					if (idx !== null){
						index.push(idx);
					}
				});

				// 更新状态
				con.find('input').prop('checked', false).each(function(idx, input){
					input.checked = (util.index(index, input.value) !== null);
				});
			}
			return self;
		},
		getFullValue: function(){
			var self = this;
			var list = self.$list;
			var result = [];
			if (list){
				util.each(self.$index, function(idx){
					result.push(list[idx]);
				})
			}
			return result;
		}
	});
	exports.checkboxGroup = CheckBoxGroup;

	var SubLevelCheckbox = view.container.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				'class': 'M-commonSLC',
				'target': parent,
				'readonly': false,
				'selected': null,
				'getSubs': false,
				'callback': null,
				// 子级对应的key
				"key":"child",
				// 层级值对应的key
				"valueKey":"value",
				// 显示名称对应的key
				"nameKey":"name",
				// 是否发消息
				"silence":true,
				"level":2,
				// 父项取消选中规则 1：当子项有一个不选中，父项就取消选中，2：当子项全部不选中时父项才不选中
				"parentUnSelectRule": 1,
				// 设置disable数组值时，geData时否将禁用的数据也返回
				"includeDisable": false,
				// title属性的文字
				"titleField": "name",
				// 是否有搜索模块
				'hasSearch': false,
				// 是否鼠标移上去弹层显示描述，false是title属性显示
				'hasShowDesc': true
			});

			this.Super('init', arguments);

			var c = config.get();
			if(!c.newBuild)
			{
				var el = this.getDOM();
				this.$guid = util.guid('c_');
				this.$list = null;
				this.$selected = c['selected'];
				this.$key = c['key'];
				this.$vKey = c['valueKey'];
				this.$nKey = c['nameKey'];

				var doms = this.doms = {};
				doms.head = $('<ul class="M-commonSLCHead" />').appendTo(el);
				doms.body = $('<div class="M-commonSLCBody" />').appendTo(el);
				doms.head.append('<span>' + LANG('数据加载中...') + '</span>');
				// 绑定事件
				this.dg(doms.head, 'li', 'click', 'eventSwitchSection');
				this.dg(doms.head, 'li > input', 'change', 'eventToggleSection');
				this.dg(doms.body, '.M-commonSLCItem', 'mouseenter mouseleave', 'eventHoverItem');
				if (!c['readonly']){
					this.dg(doms.body, 'input', 'change', 'eventToggleChange');
				}

				if (c.hasSearch) {
					var searchDiv = $([
						'<div class="form-element-group M-commonSearchInputCon w200 mb10">',
							'<input type="text" class="M-commonSearchInput form-element" placeholder="请输入搜索内容" style="max-height:30px;">',
							'<span class="M-commonSearchUndo icon-close undo"></span>',
							'<span class="form-element-extra w30 do" style="cursor:pointer;" >',
								'<i class="M-commonSearchDo"></i>',
							'</span>',
						'</div>'
					].join('')).insertBefore(el);
					this.$searchInput = searchDiv.find('input');
					this.uiBind(searchDiv.find('input'), 'keyup', 'input', 'eventSearch');
					this.uiBind(searchDiv.find('.do'), 'click', 'eventSearch');
					this.uiBind(searchDiv.find('.undo'), 'click', 'cancel', 'eventSearch');
				}
			}
		},
		/**
		 * 设置选项列表
		 * @param {Array} list 列表对象
		 */
		setList: function(list){
			this.$list = list;
			this.buildDom();
		},
		buildDom : function(noAfterBuild ){
			var doms = this.doms;
			var list = this.$list;
			var c = this.$config;
			var self = this;
			doms.head.empty();
			doms.body.empty();

			for (var i=0; i<list.length; i++){
				var id = self.$guid + '_' + i;
				self.buildSection(id, list[i]);
			}

			// 显示默认面板
			doms.head.children(':eq(0)').addClass('act');
			doms.body.children(':gt(0)').hide();

			if (c.get('readonly')){
				doms.head.find('input:checkbox').prop('disabled', true);
				doms.body.find('input:checkbox').prop('disabled', true);
			}

			// 设置选中的选项
			if (self.$selected){
				self.setData(self.$selected);
				this.setValueDone();
			}

			// 回调函数
			var callback = c.get('callback');
			if (callback && $.isFunction(callback)) {
				callback.call(self);
			}

			// 添加搜索标记
			if (c.hasSearch) {
				var val = util.trim(self.$searchInput.val() || '');
				self.addSearchMark(val);
			}
			return self;
		},
		eventToggleChange: function(evt, elm){
			var type = $(elm).attr('data-type');
			switch (type){
				case 'zone':
					this.eventToggleZone(evt, elm);
					break;
				case 'item':
					this.eventToggleItem(evt, elm);
					break;
				case 'sub':
					this.eventToggleSub(evt, elm);
					break;
			}
			if(!this.$config.get('silence')){
				// 非静默模式
				this.fire(
					"subLevelChange"
					,{
						"type":type
						,"data":this.getData()
					}
				);
			}
		},
		// 创建分区
		buildSection: function(id, data){
			var c = this.getConfig();
			var doms = this.doms;
			var head = $('<li/>').attr('data-link', id).appendTo(doms.head);
			var body = $('<div/>').attr('data-link', id).appendTo(doms.body);

			$('<input type="checkbox"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(head);
			$('<label class="labelState"/>').text(LANG(data[this.$nKey])).attr('data-desc', LANG(data[this.$nKey]) + '\n' + LANG(data[c.titleField])).appendTo(head);
			this.uiProxy(head, 'label', 'mouseenter mouseleave', 'eventMetricTips');

			var tmp = data[this.$key];
			if(tmp){
				for (var i=0; i<tmp.length; i++){
					var con = $('<div class="M-commonSLCZone"/>').toggleClass('alt', (i%2 === 0)).appendTo(body);
					if(tmp[i].value){
						con.attr('data-key', tmp[i].value);
					}
					if(tmp[i].config && tmp[i].config.hide){
						con.hide();
					}
					this.buildZone(id + '_' + i, con,tmp[i]);
				}
			}
			tmp = null;
		},
		eventSwitchSection: function(evt, elm){
			elm = $(elm);
			elm.siblings().removeClass('act');
			var link = elm.addClass('act').attr('data-link');
			this.doms.body.children().hide().filter('[data-link="'+link+'"]').show();
		},
		eventToggleSection: function(evt, elm){
			var dom = $(elm);
			var chk = dom.prop('checked');
			var link = dom.parent().attr('data-link');
			var body = this.doms.body.children('[data-link="'+link+'"]');
			body.find('input').prop('checked', chk);
			body.find('.M-commonSLCSubCount').hide();
			if(!this.$config.get('silence')){
				// 非静默模式
				this.fire(
					"subLevelChange"
					,{
						"type":"all"
						,"data":this.getData()
					}
				);
			}
		},
		updateSectionCheck: function(body){
			var rule = this.getConfig('parentUnSelectRule');
			var input = body.find('input');
			var check = input.filter(':checked').length;
			var link = body.attr('data-link');
			var dom = this.doms.head.find('[data-link="'+link+'"] > input');
			var hasSub = input.length > 0;
			var parentIsCheck = rule == 1 ? check == input.length : check > 0;
			dom.prop('checked', (hasSub && parentIsCheck));
		},
		// 创建栏目
		buildZone: function(id, con, data){
			var c = this.getConfig();
			if(!c.hideZoneHead)
			{
				var head = $('<div class="M-commonSLCZoneHead" />').appendTo(con);
				$('<input id="'+id+'" type="checkbox" data-type="zone"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(head);
				$('<label class="labelState" for="'+id+'"/>').text(LANG(data[this.$nKey])).attr('data-desc', LANG(data[this.$nKey]) + '\n' + LANG(data[c.titleField])).appendTo(head);
				this.uiProxy(head, 'label', 'mouseenter mouseleave', 'eventMetricTips');
			}
			var tmp = data[this.$key];
			if (!tmp || !tmp.length){
				return;
			}
			var body = $('<ul class="M-commonSLCZoneBody" />').appendTo(con);
			for (var i=0; i<tmp.length; i++){
				var item = $('<li class="M-commonSLCItem"/>').appendTo(body);
				this.buildItem(id + '_' + i, item,tmp[i]);
			}
			body.append('<div class="clear"/>');
			tmp = null;
		},
		eventToggleZone: function(evt, elm){
			var dom = $(elm);
			var chk = dom.prop('checked');
			dom = dom.parent().next();
			if (dom.length){
				dom.find('input').prop('checked', chk);
				dom.find('.M-commonSLCSubCount').hide();
			}else {
				dom = $(elm).parent();
			}
			this.updateSectionCheck(dom.parent().parent());
		},
		updateZoneCheck: function(body){
			var rule = this.getConfig('parentUnSelectRule');
			var input = body.find('input');
			var check = input.filter(':checked').length;
			var hasSub = input.length > 0;
			var parentIsCheck = rule == 1 ? check == input.length : check > 0;
			body.prev().children('input').prop('checked', (hasSub && parentIsCheck));
			this.updateSectionCheck(body.parent().parent());
		},
		// 创建项目
		buildItem: function(id, con, data){
			var c = this.getConfig();
			var head = con, body = null
				,tmp = data[this.$key];
			if (tmp && tmp.length){
				head = $('<div class="M-commonSLCItemHead" />').appendTo(con);
				body = $('<ul class="M-commonSLCSub" />').appendTo(con);
				$('<span class="M-commonSLCSubCount" />').appendTo(con);
				con.addClass('hasSub');
			}

			$('<input id="'+id+'" type="checkbox" data-type="item"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(head);
			$('<label class="labelState" for="'+id+'"/>').text(LANG(data[this.$nKey])).attr('data-desc', LANG(data[this.$nKey]) + '\n' + LANG(data[c.titleField])).appendTo(head);
			this.uiProxy(head, 'label', 'mouseenter mouseleave', 'eventMetricTips');

			if (tmp && tmp.length){
				$('<i class="icon-more ico"></i>').appendTo(head);
			}

			// 构建问号提示
			if(data.config && data.config.tips){
				$('<i class="tips"/>').appendTo(head).attr('title', data.config.tips);
			}

			if (body){
				for (var i=0; i<tmp.length; i++){
					var item = $('<li/>').appendTo(body);
					this.buildSubItem(id + '_' + i, item,tmp[i]);
				}
			}
			tmp = null;
		},
		eventHoverItem: function(evt, elm){
			var dom = $(elm);
			if (evt.type == 'mouseenter'){
				dom = dom.children('.M-commonSLCItemHead');
				if (dom.length){
					dom.parent().addClass('act');
					dom.next().css('left', dom.innerWidth()-1);
				}
			}else {
				dom.removeClass('act');
			}
		},
		eventToggleItem: function(evt, elm){
			var dom = $(elm);
			if (dom.parent().hasClass('M-commonSLCItemHead')){
				var chk = dom.prop('checked');
				dom = dom.parent().next();
				dom.find('input').prop('checked', chk);
				dom.next().hide();
			}
			this.updateZoneCheck(dom.parent().parent());
		},
		// 创建子项目
		buildSubItem: function(id, con, data){
			var c = this.getConfig();
			$('<input id="'+id+'" type="checkbox" data-type="sub"/>').val(data[this.$vKey] === 0 && '0' || data[this.$vKey] || '').appendTo(con);
			$('<label class="labelState" for="'+id+'"/>').text(LANG(data[this.$nKey])).attr('data-desc', LANG(data[this.$nKey]) + '\n' + LANG(data[c.titleField])).appendTo(con);
			this.uiProxy(con, 'label', 'mouseenter mouseleave', 'eventMetricTips');
		},
		eventToggleSub: function(evt, elm){
			var ul = $(elm).parent().parent();
			var total = ul.children().length;
			var check = ul.find('input:checked').length;
			if (check > 0 && check != total){
				ul.next().css('display', 'block').text(check + '/' + total);
			}else {
				ul.next().hide();
			}
			ul.prev().children('input').prop('checked', check > 0);

			this.updateZoneCheck(ul.parent().parent());
		},

		/**
		 * 设置选中的项目
		 * @param {Array} sels 选中的项目ID值
		 * @return {None} 无返回
		 */
		setData: function(sels){
			this.setValueStart();
			var rule = this.getConfig('parentUnSelectRule');
			this.reset();
			if (!sels || !sels.length){
				return;
			}
			this.$selected = sels;

			var i,map = {};
			for (i=sels.length-1; i>=0; i--){
				map[sels[i]] = 1;
			}

			var dom, body = this.doms.body;
			var doms = body.find('input[value!=""]');
			for (i=doms.length-1; i>=0; i--){
				dom = doms.eq(i);
				if (map[dom.val()]){
					dom.prop('checked', true);
				}
			}

			// 更新项目状态
			var total, check, input, parentIsCheck;
			doms = body.find('.M-commonSLCSub');
			for (i=0; i<doms.length; i++){
				dom = doms.eq(i);
				input = dom.prev().children('input');
				total = dom.find('input');
				// role 1时: 父选中则子全部选中
				if (input.prop('checked') && rule == 1){
					total.prop('checked', true);
				}else {
					check = total.filter(':checked');
					if (input.prop('checked')){
						if (check.length === 0){
							total.prop('checked', true);
						}
					}else {
						// 这个最底层的固定为子选中即父选中，于rule无关
						if (check.length > 0){
							input.prop('checked', true);
						}
					}
					if (check.length > 0 && check.length < total.length){
						dom.next().css('display', 'block').text(check.length + '/' + total.length);
					}
				}
			}

			// 更新栏目状态
			doms = body.find('.M-commonSLCZoneBody');
			for (i=0; i<doms.length; i++){
				dom = doms.eq(i);
				input = dom.prev().children('input');
				total = dom.find('input');
				// role 1时: 父选中则子全部选中
				if (input.prop('checked') && rule == 1){
					total.prop('checked', true);
					dom.find('.M-commonSLCSubCount').hide();
				}else {
					check = total.filter(':checked');
					parentIsCheck = rule == 1 ? check.length == input.length : check.length > 0;
					if (total.length > 0 && parentIsCheck){
						input.prop('checked', true);
					}
				}
			}

			// 更新分区状态
			doms = body.children();
			for (i=0; i<doms.length; i++){
				dom = doms.eq(i);
				input = this.doms.head.find('input:eq('+i+')');
				total = dom.find('.M-commonSLCZoneHead > input');
				// role 1时: 父选中则子全部选中
				if (input.prop('checked') && rule == 1){
					total.prop('checked', true);
					dom.find('.M-commonSLCSubCount').hide();
				}else {
					check = total.filter(':checked');
					parentIsCheck = rule == 1 ? check.length == input.length : check.length > 0;
					if (total.length > 0 && parentIsCheck){
						input.prop('checked', true);
					}
				}
			}
		},
		// 设置禁用的数据
		setDisableData: function(disables) {
			var c = this.getConfig();
			// 全部数据
			var body = this.doms.body;
			var doms = body.find('input[value!=""]');

			if (c.parentUnSelectRule === 2) {
				doms = doms.add(this.doms.head.find('input[value!=""]'));
			}

			// 缓存选中id标记的数据
			this.$disableData = disables;
			var setMap = {}, i;
			for (i = 0; i < disables.length; i++) {
				setMap[disables[i]] = true;
			}

			// 设置选中状态
			var dom;
			for (i = doms.length - 1; i >= 0; i--) {
				dom = doms.eq(i);
				// 找到禁用的去掉选中状态(传入[]相当于reset)
				if (dom.prop('disabled')) {
					dom.prop('checked', false).prop('disabled', false);
					dom.next().addClass('labelState');
				}
				// 再重新disable
				if (setMap[dom.val()]) {
					dom.prop('checked', true).prop('disabled', true);
					var grandpa = dom.parent().parent();
					var className = grandpa.attr('class');
					// 表格主体部分，禁用时，移除labelState
					// 表格最上面的标题部分，有两种情况，1.只有一个标题，禁用时，移除labelState;2.一个以上标题时，禁用时，不移除
					if (className !== 'M-commonSLCHead' || className === 'M-commonSLCHead' && grandpa.children('li').length < 2) {
						dom.next().removeClass('labelState');
					}
				}
			}
		},
		// 全部input禁用，只能查看
		setAllDataDisable: function(){
			var body = this.doms.body;
			var doms = body.find('input[value!=""]');
			var dom;

			// 循环所有的input，并禁用它们
			for (var i = doms.length -1; i >= 0; i--) {
				dom = doms.eq(i);
				dom.prop('disabled', true);
				dom.next().addClass('labelState');
			}
		},
		/**
		 * 清空所有选择
		 * @return {None} 无返回
		 */
		reset: function(){
			var doms = this.doms;
			doms.head.find('input').prop('checked', false).prop('disabled', false);
			doms.body.find('input').prop('checked', false).prop('disabled', false);
			doms.body.find('.M-commonSLCSubCount').hide();
			this.$selected = null;
			return this;
		},
		/**
		 * 获取选中的区域数据
		 * @return {Array} 返回选中的区域ID数组
		 */
		getData: function(){
			var c = this.getConfig();
			var merge = !c.getSubs;
			var rule = c.parentUnSelectRule;
			var ret = [];
			// 禁用的数据(需配置包含禁用数据)
			var disables = c.includeDisable ? [] : this.$disableData;
			// 获取项目数据
			var dom, input, total, check, i, body = this.doms.body;
			var doms = body.find('.M-commonSLCItem');

			// 获取三级和四级选项
			for (i=0; i<doms.length; i++){
				dom = doms.eq(i);
				input = dom.children('input');
				if (input.length){
					if (input.prop('checked') && input.val() !== ''){
						// 如果不是disable中的数据则返回
						if (util.index(disables, +input.val()) === null) {
							ret.push(input.val());
						}
					}
				}else {
					total = dom.find('.M-commonSLCSub input');
					check = total.filter(':checked');
					input = dom.find('.M-commonSLCItemHead > input');
					if (total.length > 0 && input.val() !== ''){
						if (rule == 1 && check.length == total.length || rule == 2 && check.length > 0) {
							// 如果不是disable中的数据则返回
							if (util.index(disables, +input.val()) === null) {
								ret.push(input.val());
							}
							if (merge){ check = false; }
						}
					}
					if (check){
						for (var j=0; j<check.length; j++){
							input = check.eq(j);
							if (input.val() !== ''){
								// 如果不是disable中的数据则返回
								if (util.index(disables, +input.val()) === null) {
									ret.push(input.val());
								}
							}
						}
					}
				}
			}

			// 获取栏目数据
			doms = body.find('.M-commonSLCZoneHead > input[value!=""]');
			for (i=0; i<doms.length; i++){
				input = doms.eq(i);
				if (input.prop('checked')){
					// 如果不是disable中的数据则返回
					if (util.index(disables, +input.val()) === null) {
						ret.push(input.val());
					}
				}
			}

			if (rule == 2) {
				// 获取分区数据
				doms = this.doms.head.find('input[value!=""]');
				for (i=0; i<doms.length; i++){
					input = doms.eq(i);
					if (input.prop('checked')){
						// 如果不是disable中的数据则返回
						if (util.index(disables, +input.val()) === null) {
							ret.push(input.val());
						}
					}
				}
			}

			this.$selected = ret;
			return ret;
		},
		// 获取简单描述
		getDesc: function(){
			var checkeds = this.getDOM().find('input').filter(':checked');
			var desc = {};
			var result = [];
			var data = this.getData();
			$.each(checkeds, function(idx, item){
				var id = $(item).val();
				var text = $(item).next().text();
				desc[id] = text;
			});

			// 只返回id组对应的地区名称
			util.each(data, function(item){
				if(item){
					if(desc[item]){
						result.push(desc[item]);
					}
				}
			});
			return result;
		},
		// 搜索模块
		eventSearch: function(evt, elm){
			var self = this;
			var c = self.getConfig();
			var el = this.getDOM();
			var val;

			if(evt.data === 'input' && evt.keyCode !== 13){
				return;
			}
			// 先全部清除高亮
			el.find('label').removeClass('highlight');

			if(c.hasSearch){
				if(evt.data === 'cancel'){
					self.$searchInput.val('');
					$(elm).css({'display':'none'});
				}else{
					val = util.trim(self.$searchInput.val() || '');
					$(elm).siblings('.undo').css({'display':'inline'});
				}
				self.addSearchMark(val);
			}
		},
		addSearchMark: function(val){
			var el = this.getDOM();

			// 先全部清除高亮
			el.find('label').removeClass('highlight');

			if(!val) return;
			var re = new RegExp(val,"gi");
			var labels = el.find('label');
			for (var i=0; i<labels.length; i++) {
				var labelDom = $(labels[i]);
				if (labelDom.text().match(re)){
					labelDom.addClass('highlight');
					labelDom.parent().parent().parent().find('>.M-commonSLCZoneHead label').addClass('highlight');
					if (labelDom.parent().parent().parent().hasClass('hasSub')) {
						labelDom.parent().parent().parent().find('.M-commonSLCItemHead label').addClass('highlight').parents('.M-commonSLCZone').find('.M-commonSLCZoneHead label').addClass('highlight');
					}
				}
			}

			// 当Body中有label被选中时，M-commonSLCHead下label
			var tmpArr = el.find('.M-commonSLCZoneHead label.highlight').parents('div[data-link]');
			for (var j=0; j<tmpArr.length; j++) {
				var num = $(tmpArr[j]).index(); // div[data-link]排第几
				el.find('.M-commonSLCHead li label').eq(num).addClass('highlight');
			}
		},
		// tip提示
		eventMetricTips: function(ev, dom){
			var c = this.getConfig();
			var el = $(dom);
			var desc = el.attr('data-desc');

			if(!c.hasShowDesc){
				el.attr('title', desc);
				return false;
			}else{
				el.removeAttr('title');
			}

			var tip = this.get('metricTip');
			if(!tip){
				tip = this.create("metricTip", Tip, {
					"anchor": el,
					"pos": "tm",
					"width": 255
				});
				tip.hide(); // 避免刚创建时就显示（里面没有内容）
			}
			clearTimeout(this.$lockTimeout);
			if (ev.type === 'mouseenter'){
				this.$lockTimeout = setTimeout(function(){
					tip.setData(desc).update({"anchor":el}).show();
				}, 400);
			}else {
				tip.hide();
			}
		}
	});

	exports.subLevelCheckbox = SubLevelCheckbox;

	exports.newSubLevelCheckbox = SubLevelCheckbox.extend({
		init: function(config, parent){
			config = pubjs.conf(config, {
				newBuild: true
			});

			this.Super('init', arguments);
		},
		afterBuild: function()
		{
			var el = this.getDOM();
			var c = this.getConfig();
			this.$guid = util.guid('c_');
			this.$list = null;
			this.$selected = c['selected'];
			this.$key = c['key'];
			this.$vKey = c['valueKey'];
			this.$nKey = c['nameKey'];

			var doms = this.doms = {};
			doms.head = $('<ul class="M-commonSLCHead" />').appendTo(el);
			doms.body = $('<div class="M-commonSLCBody" />').appendTo(el);

			doms.head.append('<span>' + LANG('数据加载中...') + '</span>');

			// 绑定事件
			this.dg(doms.head, 'li', 'click', 'eventSwitchSection');
			this.dg(doms.head, 'li > input', 'change', 'eventToggleSection');
			this.dg(doms.body, '.M-commonSLCItem', 'mouseenter mouseleave', 'eventHoverItem');
			if(!c['readonly'])
			{
				this.dg(doms.body, 'input', 'change', 'eventToggleChange');
			}
		}
	});

});