var main = require('../lib/main');

console.log(main.getProvider('http://vimeo.com/26355165'));
console.log(main.getId('http://vimeo.com/26355165'));

console.log(main.getProvider('http://www.youtube.com/watch?v=9eHbqMayxv8'));
console.log(main.getId('http://www.youtube.com/watch?v=9eHbqMayxv8'));

console.log(main.getProvider('http://www.confreaks.com/videos/1288-rubyconf2012-ruby-vs-the-world'));
console.log(main.getId('http://www.confreaks.com/videos/1288-rubyconf2012-ruby-vs-the-world'));

