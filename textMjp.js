import Core from '@CORE/core';
Core.init(
    {
        Log: {
            debug : 2
        }
    }
);

console.log(Core)
//测试创建模块
let Tree = new Core.Module({
	name: 'parent',
	castChild(){
		this.cast('kk',{p:1})
	},
	// eventBreak(ev){
	//     debugger
	//     if(ev.returnValue){
	// 		console.log('eventBreak','Tree',ev);
	// 	}
	// },
	fireEvent(ev){
		console.log('fireEvent','parent',ev);
		return true;
	}
});
//测试创建子模块
Tree.create('test1', function () {
	let test = new Core.Module({
		name: 'test',
		init(config,parent) {
			console.log("======调试parent=====\n")
			console.log('textparent:' + config + "\n");
			console.log("======结束parent=====\n");
		},
		log() {
			console.log("======调试log=====\n")
			console.log('textlog:' + JSON.stringify(this) + "\n");
			console.log("======结束log=====\n");
			
		},
		fireEvent(ev){
			console.log('fireEvent test',ev)
		},
		castKk(ev){
			console.log('castKk test',ev)
            ev.returnValue = 'test1';
			return true;
		},
        fireKk(ev){
		    console.log('test1',ev);
			return true;
        }
	});
	// 测试创建多个模块
	test.create('testChild',function () {
		return new Core.Module({
			name: 'testChild',
			init(config,parent) {
				console.log("======调试testChild=====\n")
				console.log('textparent:' + config + "\n");
				console.log("======结束testChild=====\n");
			},
			log() {
				console.log("======调试logtestChild====\n")
				console.log('textlog:' + JSON.stringify(this) + "\n");
				console.log("======结束logtestChild=====\n");
			},
			fireEvent(ev){
				console.log('fireEvent testChild',ev)
			},
			castKk(ev){
				console.log('castKk testChild',ev);
				return true;
			},
			fireParent(){
			    this.fire('kk',{name:'testChild'})
		    }
		})
	});
	test.create('testChild2',function () {
		return new Core.Module({
			name: 'testChild2',
			init(config,parent) {
				console.log("======调试testChild2=====\n")
				console.log('textparent:' + config + "\n");
				console.log("======结束testChild2=====\n");
			},
			fireEvent(ev){
				console.log('fireEvent testChild2',ev)
			},
			castKk(ev){
				console.log('castKk testChild2',ev)
				return true;
			}
			,
            fireParent(){
			    this.fire('kk',{name:'testChild2'})
            }
		})
	});
	return test;
},{
	page:1
});
console.log(Tree);
console.log(Tree.castChild());
// 获取子模块
let test = Tree.getChild('test1');
let testChild = test.getChild('testChild');
let testChild2 = test.getChild('testChild2');
console.log(test,testChild,testChild2);
testChild2.fireParent();
testChild.fireParent();