import {Game} from './game.js';

window.addEventListener('load',
    () => {
        console.log("loading...");
        let canvas = document.getElementById('canvas');
        console.log(canvas);
        let game = new Game(canvas);

        game.run();
    }
);
