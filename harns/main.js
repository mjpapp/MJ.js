const path = require('path');
import {greet} from '../eye/route';

greet('ES6').then((res) => {
    document.getElementById('content').innerHTML += res;
});