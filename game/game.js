import {Population} from '../NEAT/Population';
import {BlobCharacter} from './blobCharacter';

export class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.context = this.canvas.getContext('2d');

        this.run = this.run.bind(this);

        let b = new BlobCharacter();

        this.population = new Population(500, () => (new BlobCharacter()));

    }

    run() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.context.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.population.done()) {
            this.population.updateAlive(this.context);
        } else {
            this.population.naturalSelection();
            console.log(this.population.players);
        }

        this.writeInfo();
        this.population.players[this.population.players.length - 1].brain.drawGenome(this.context, 500, 0, 500, 200);

        requestAnimationFrame(this.run)
    }

    writeInfo() {
        //fill(200);
        this.context.textAlign = 'left';
        this.context.font = '30px sans-serif';
        this.context.fillStyle="#FFF";

        this.context.fillText("Score: " + this.population.players[0].score, 650, 50); //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
        this.context.fillText("Gen: " + this.population.gen, 1150, 50);
        this.context.fillText("Species: " + this.population.species.length, 50, canvas.height / 2 + 300);
        this.context.fillText("Global Best Score: " + this.population.bestScore, 50, canvas.height / 2 + 200);

    }
}
