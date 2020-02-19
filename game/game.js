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
    this.context.fillStyle="#222";
    this.context.fillRect(20,20,500,500);

    if (!this.population.done()) {
      this.population.updateAlive(this.context);
    } else {
      this.population.naturalSelection();
      console.log(this.population.players);
    }

    this.writeInfo();
    this.population.firstLivingPlayer.brain.drawGenome(
      this.context, this.canvas.width - 700, 250,
      700, this.canvas.height - 250);

    requestAnimationFrame(this.run)
  }

  writeInfo() {
    //fill(200);
    this.context.font = '25px mono';
    this.context.fillStyle = "#FFF";

    this.context.textAlign = "right";

    this.context.fillText("Score: " + (this.population.firstLivingPlayer.score).toFixed(2), this.canvas.width, 50);
    this.context.fillText("Gen: " + this.population.gen, this.canvas.width, 100);
    this.context.fillText("Species: " + this.population.species.length, this.canvas.width, 150);
    this.context.fillText("Global Best Score: " + (this.population.bestScore).toFixed(2), this.canvas.width, 200);

  }
}
