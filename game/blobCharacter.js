import {BasePlayer} from '../NEAT/BasePlayer';
import {Vector} from "../math/vector";
import {clamp} from "../math/clamp";
import {sigmoid} from "../math/activation";

export class BlobCharacter extends BasePlayer {
  constructor() {
    super(8, 2);

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
    context.translate(this.position.x + 20, this.position.y + 20);
    context.rotate(this.angle);
    context.fillStyle = "rgb(" + this.color[0] + "," + this.color[1] + "," + this.color[2] + ")";

    const energy = Math.max(5, this.energy);
    const speed = Math.max(-0.25, this.decision[0]);

    context.beginPath();
    context.moveTo(-energy / 40, energy / 40); //Top Left Corner
    context.lineTo(-energy / 60, energy/80); //Halfway top edge
    context.lineTo(this.decision[1] * energy / 40, -speed * energy / 40); //Point
    context.lineTo(0, energy / 40 - speed * this.energy / 80); //Middle Left Point
    context.closePath();
    context.fill();


    context.fillStyle = "rgb(" + this.color[0]/2 + "," + this.color[1]/2 + "," + this.color[2]/2 + ")";

    context.beginPath();
    context.lineTo(this.decision[1] * this.energy / 40, -speed * this.energy / 40); //Point
    context.lineTo(this.energy/60, this.energy/80); //Halfway bottom edge
    context.lineTo(this.energy / 40, this.energy / 40); //Bottom Left Corner
    context.lineTo(0, this.energy / 40 - speed * this.energy / 80); //Middle Left Point
    context.fill();

    context.strokeStyle = "#F00";

    context.rotate(-this.angle);
    context.translate(-this.position.x - 20, -this.position.y - 20);
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

    const accel = Math.max(0, sigmoid(this.decision[0]));

    this.acceleration = new Vector(
      accel * Math.sin(this.angle) / 32,
      -accel * Math.cos(this.angle) / 32
    );

    this.move();

    if (this.position.x < 0 || this.position.x > 500 ||
      this.position.y < 0 || this.position.y > 500) {
      this.dead = true;
    }

    this.energy -= Math.min(0, 1 - Math.sqrt(this.speed.x * this.speed.x + this.speed.y * this.speed.y) / 4);
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

    const verticalSpeed = Math.sin(this.angle) * this.speed.x - Math.cos(this.angle) * this.speed.y;
    const horizontalSpeed = Math.cos(this.angle) * this.speed.x + Math.sin(this.angle) * this.speed.y;


    this.vision = [
      edgePretransform(this.distance = this.distanceFromEdge(this.angle)),
      edgePretransform(this.distanceFromEdge(this.angle + Math.PI / 8)),
      edgePretransform(this.distanceFromEdge(this.angle - Math.PI / 8)),
      edgePretransform(this.distanceFromEdge(this.angle + Math.PI / 4)),
      edgePretransform(this.distanceFromEdge(this.angle - Math.PI / 4)),
      edgePretransform(this.distanceFromEdge(this.angle + Math.PI)),
      verticalSpeed,
      horizontalSpeed

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

    clone.color[0] = clamp(this.color[0] + (Math.random() * 10 - 5), 64, 255);
    clone.color[1] = clamp(this.color[1] + (Math.random() * 10 - 5), 64, 255);
    clone.color[2] = clamp(this.color[2] + (Math.random() * 10 - 5), 64, 255);

    return clone;
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------
  //fot Genetic algorithm
  calculateFitness() {
    this.fitness = this.age;
    //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
  }
}
