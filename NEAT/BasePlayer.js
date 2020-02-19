import {Genome} from "./genome";

export class BasePlayer {

    constructor(inputs, outputs) {

        this.fitness = 0;
        this.vision = []; //the input array fed into the neuralNet
        this.decision = []; //the out put of the NN
        //this.unadjustedFitness;
        this.lifespan = 0; //how long the player lived for this.fitness
        this.bestScore = 0; //stores the this.score achieved used for replay
        this.dead = false;
        this.score = 0;
        this.gen = 0;

        this.genomeInputs = inputs;
        this.genomeOutputs = outputs;
        this.brain = new Genome(this.genomeInputs, this.genomeOutputs);
    }


    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    //gets the output of the this.brain then converts them to actions
    think() {

        let max = 0;
        let maxIndex = 0;
        //get the output of the neural network
        this.decision = this.brain.feedForward(this.vision);

        for (let i = 0; i < this.decision.length; i++) {
            if (this.decision[i] > max) {
                max = this.decision[i];
                maxIndex = i;
            }
        }

        return this.decision;
    }


    clone() {
        return new BasePlayer();
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //since there is some randomness in games sometimes when we want to replay the game we need to remove that randomness
    //this fuction does that

    cloneForReplay() {
        return this.clone();
    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------
    crossover(parent2) {

        let child = this.clone();
        child.brain = this.brain.crossover(parent2.brain);
        child.brain.generateNetwork();
        return child;
    }
}
