import {BasePlayer} from '../NEAT/BasePlayer';
import {Vector} from "../math/vector";
import {clamp} from "../math/clamp";

export class BlobCharacter extends BasePlayer {
    constructor() {
        super(1, 2);

        this.position = new Vector(250, 250);
        this.speed = new Vector(0, 0);
        this.angle = Math.PI/2;

        this.energy = 1600;
        this.age = 0;
        this.acceleration = new Vector(0,0);

        this.color = [Math.random()*256, Math.random()*256, Math.random()*256];

        this.speedBias = new Vector(Math.random()/2 - 1/4, Math.random()/2-1/4);

        this.distance = 0;

    }

    show(context) {
        context.translate(this.position.x, this.position.y);
        context.rotate(this.angle);
        context.fillStyle = "rgb("+this.color[0]+","+this.color[1]+","+this.color[2]+")";
        context.fillRect(-this.energy/40, -this.energy/40, this.energy/20, this.energy/20);
        context.strokeStyle="#F00";

        /*
        context.beginPath();
        context.lineTo(0,0);
        context.lineTo(0, -this.distance+10);
        context.stroke();
*/
        context.rotate(-this.angle);
        context.translate(-this.position.x, -this.position.y);
    }

    move() {
        this.speed = this.speed.add(this.acceleration);
        this.position = this.position.add(this.speed).add(this.speedBias);
    }

    update() {
        this.think();

        this.angle += this.decision[1]/10 - 1/20;
        this.angle = this.angle % (Math.PI*2);

        this.acceleration = new Vector(
            this.decision[0]*Math.sin(this.angle)/32,
            this.decision[0]*Math.cos(this.angle)/32
        );

        this.move();

        if (this.position.x < 0 || this.position.x > 500 ||
            this.position.y < 0 || this.position.y > 500) {
            this.dead = true;
        }

        this.energy -= 1.9;
        this.energy += this.decision[0]*1.9 - Math.abs(this.decision[1]-0.5)*4;
        if (this.energy <= 0){
            this.dead = true;
        }

        this.age++;
        this.score = this.age + this.energy;

    }

    look() {
        //let speedWithBias = this.speed.add(this.speedBias);

        const edgePretransform = (i)=>(i<100 ? 100 - i : 0)/10;

        let distancex, distancey;
        if (this.angle <= Math.PI/2 || this.angle >= 3*Math.PI/2) {
            distancey = 1/Math.cos(this.angle) * (this.position.y);
        } else {
            distancey = -1/Math.cos(this.angle) * (500 - this.position.y);
        }

        if (this.angle <= Math.PI) {
            distancex = (1/Math.sin(this.angle)) * (this.position.x);
        } else if (Math.PI * 5/4 < this.angle && this.angle <= Math.PI * 7 / 4) {
            distancex = -1/Math.sin(this.angle) * (500 - this.position.x);
        }

        this.distance = Math.min(distancex, distancey);


        this.vision = [
            edgePretransform(this.distance),
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

        clone.color[0] = clamp(this.color[0]+(Math.random()*10-5),0,255);
        clone.color[1] = clamp(this.color[1]+(Math.random()*10-5),0,255);
        clone.color[2] = clamp(this.color[2]+(Math.random()*10-5),0,255);

        return clone;
    }



    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    //fot Genetic algorithm
    calculateFitness() {
        this.fitness = this.age;
        //<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<replace
    }
}
