import {BasePlayer} from '../NEAT/BasePlayer';
import {Vector} from "../math/vector";
import {clamp} from "../math/clamp";
import {sigmoid} from "../math/activation";

export class BlobCharacter extends BasePlayer {
  constructor() {
    super(6, 2);

    this.position = new Vector(250, 250);
    this.speed = new Vector(1, 0);
    this.angle = Math.PI / 2;

    this.energy = 1600;
    this.age = 0;
    this.acceleration = new Vector(0, 0);

    this.color = [Math.random() * 256, Math.random() * 256, Math.random() * 256];

    this.speedBias = new Vector(Math.random() / 2 - 1 / 4, Math.random() / 2 - 1 / 4);

    this.distance = 0;

    this.height = 500;
    this.width = 500;

  }

  show(context) {
    context.translate(this.position.x + 10, this.position.y + 10);
    context.rotate(this.angle);
    context.fillStyle = "rgb(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + ")";

    context.beginPath();
    context.moveTo(-this.energy / 40, this.energy / 40);
    context.lineTo(0, -this.decision[0] * this.energy / 40);
    context.lineTo(this.energy / 40, this.energy / 40);
    context.lineTo(0, this.energy / 40 - this.decision[0] * this.energy / 120);
    context.fill();

    //context.fillRect(-this.energy / 40, -this.energy / 40, this.energy / 20, this.energy / 20);
    context.strokeStyle = "#F00";


    // context.beginPath();
    // context.lineTo(0, 0);
    // context.lineTo(0, -this.distance);
    // context.stroke();

    context.rotate(-this.angle);
    context.translate(-this.position.x - 10, -this.position.y - 10);
  }

  move() {
    this.speed = this.speed.add(this.acceleration);
    this.position = this.position.add(this.speed).add(this.speedBias);
  }

  update() {
    this.think();

    const turn = sigmoid(this.decision[1] / 2) - 0.5;

    this.angle += turn / 5;
    this.angle = this.angle % (Math.PI * 2);

    const accel = sigmoid(this.decision[0]);

    this.acceleration = new Vector(
      accel * Math.sin(this.angle) / 32,
      -accel * Math.cos(this.angle) / 32
    );

    this.move();

    if (this.position.x < 0 || this.position.x > 500 ||
      this.position.y < 0 || this.position.y > 500) {
      this.dead = true;
    }

    this.energy -= Math.min(0, 1 - Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y) / 2);
    this.energy -= Math.abs(this.decision[1]);
    if (this.energy <= 0) {
      this.dead = true;
    }

    this.age++;
    this.score = this.age + this.energy;

  }

  distanceFromEdge(angle) {
    //calculate distance from top edge

    const distanceFromTopEdge = this.position.y / Math.cos(angle);
    const distanceFromLeftEdge = -this.position.x / Math.sin(angle);
    const distanceFromBottomEdge = -(this.height - this.position.y) / Math.cos(angle);
    const distanceFromRightEdge = (this.width - this.position.x) / Math.sin(angle);

    return Math.min(Math.max(distanceFromTopEdge, distanceFromBottomEdge),
      Math.max(distanceFromLeftEdge, distanceFromRightEdge));
  }

  look() {
    //let speedWithBias = this.speed.add(this.speedBias);

    const edgePretransform = (i) => (i < 200 ? 200 - i : 0) / 100;


    this.vision = [
      edgePretransform(this.distance = this.distanceFromEdge(this.angle)),
      edgePretransform(this.distanceFromEdge(this.angle + Math.PI / 8)),
      edgePretransform(this.distanceFromEdge(this.angle - Math.PI / 8)),
      edgePretransform(this.distanceFromEdge(this.angle + Math.PI / 4)),
      edgePretransform(this.distanceFromEdge(this.angle - Math.PI / 4)),
      edgePretransform(this.distanceFromEdge(this.angle + Math.PI)),

    ]
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns a clone of this player with the same brain
  clone() {
    let clone = new BlobCharacter();
    clone.brain = this.brain.clone();
    clone.fitness = this.fitness;
    clone.brain.generateNetwork();
    clone.gen = this.gen;
    clone.bestScore = this.score;

    clone.color[0] = clamp(this.color[0] + (Math.random() * 10 - 5), 0, 255);
    clone.color[1] = clamp(this.color[1] + (Math.random() * 10 - 5), 0, 255);
    clone.color[2] = clamp(this.color[2] + (Math.random() * 10 - 5), 0, 255);

    return clone;
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //fot Genetic algorithm
  calculateFitness() {
    this.fitness = this.age;
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  }
}
