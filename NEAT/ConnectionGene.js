import {randomGaussian} from "../math/gausian";

//a connection between 2 nodes
export class ConnectionGene {
    constructor(from, to, w, inno) {
        this.fromNode = from;
        this.toNode = to;

        if (this.toNode === null){
            throw Error("to node may not be null");
        }

        this.weight = w;
        this.enabled = true;
        this.innovationNo = inno; //each connection is given a innovation number to compare genomes

    }

    //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
    //changes the this.weight
    mutateWeight() {
        var rand2 = Math.random();
        if (rand2 < 0.1) { //10% of the time completely change the this.weight
            this.weight = Math.random() * 2 - 1;
        } else { //otherwise slightly change it
            this.weight += (randomGaussian() / 50);
            //keep this.weight between bounds
            if (this.weight > 1) {
                this.weight = 1;
            }
            if (this.weight < -1) {
                this.weight = -1;

            }
        }
    }

    //----------------------------------------------------------------------------------------------------------
    //returns a copy of this connectionGene
    clone(from, to) {
        let clone = new ConnectionGene(from, to, this.weight, this.innovationNo);
        clone.enabled = this.enabled;

        return clone;
    }
}
