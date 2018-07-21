import {Core} from '@CORE/core';
Core.init(
    {
        Log: {
            debug : 2
        }
    }
);
console.log(Core.blog.error(Core.blog));
console.log(Core.blog.getConfigByName("debug"));
console.log("======调试Bone.log.config=====\n")
console.log('textBone.log.config:' + JSON.stringify(Core.blog.config) + "\n");
console.log("======结束Bone.log.config=====\n");

