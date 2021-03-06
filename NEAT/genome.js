import {Node} from './Node.js';
import {ConnectionHistory} from './ConnectionHistory';
import {ConnectionGene} from './ConnectionGene.js';
import {Vector} from "../math/vector";

let nextConnectionNo = 0;

export class Genome {
  constructor(inputs, outputs, crossover) {
    this.genes = []; //a list of connections between this.nodes which represent the NN
    this.nodes = [];
    this.inputs = inputs;
    this.outputs = outputs;
    this.layers = 2;
    this.nextNode = 0;
    // this.biasNode;
    this.network = []; //a list of the this.nodes in the order that they need to be considered in the NN
    //create input this.nodes

    if (crossover) {
      return;
    }

    for (let i = 0; i < this.inputs; i++) {
      this.nodes.push(new Node(i));
      this.nextNode++;
      this.nodes[i].layer = 0;
    }

    //bias nodes
    this.nodes.push(new Node(this.nextNode)); //bias node
    this.biasNode = this.nextNode;
    this.nextNode++;

    //create output this.nodes
    this.output_nodes = this.nextNode;
    this.nodes[this.biasNode].layer = 0;

    for (let i = 0; i < this.outputs; i++) {
      this.nodes.push(new Node(this.nextNode, true));
      this.nodes[this.nextNode].layer = 1;
      this.nextNode++;
    }
  }


  //-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //returns the node with a matching number
  //sometimes the this.nodes will not be in order
  getNode(nodeNumber) {
    for (let i = 0; i < this.nodes.length; i++) {
      if (this.nodes[i].number === nodeNumber) {
        return this.nodes[i];
      }
    }
    throw new Error("Cannot find node with number " + nodeNumber);
  }


  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //adds the conenctions going out of a node to that node so that it can access the next node during feeding forward
  connectNodes() {

    for (let i = 0; i < this.nodes.length; i++) { //clear the connections
      this.nodes[i].outputConnections = [];
    }

    for (let i = 0; i < this.genes.length; i++) { //for each connectionGene
      this.genes[i].fromNode.outputConnections.push(this.genes[i]); //add it to node
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  //feeding in input values varo the NN and returning output array
  feedForward(inputValues) {
    for (let i = 0; i < this.nodes.length; i++) { //reset all the this.nodes for the next feed forward
      this.nodes[i].inputSum = 0;
      this.nodes[i].outputValue = 0;
    }

    this.nodes[this.biasNode].outputValue = 1;

    //set the outputs of the input this.nodes
    for (let i = 0; i < this.inputs; i++) {
      if (this.nodes[i].layer !== 0) {
        throw Error("Node in wrong layer")
      }
      this.nodes[i].outputValue = inputValues[i];
    }

    for (let i = 0; i < this.network.length; i++) { //for each node in the network engage it(see node class for what this does)
      this.network[i].engage();
    }

    let outs = [];
    for (let i = 0; i < this.outputs; i++) {
      outs[i] = this.nodes[this.output_nodes + i].outputValue;
    }

    return outs;
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //sets up the NN as a list of this.nodes in order to be engaged

  generateNetwork() {
    this.connectNodes();
    this.network = [];
    //for each layer add the node in that layer, since layers cannot connect to themselves there is no need to
    // order the this.nodes within a layer

    for (let l = 0; l < this.layers; l++) { //for each layer
      for (let i = 0; i < this.nodes.length; i++) { //for each node
        if (this.nodes[i].layer === l) { //if that node is in that layer
          this.network.push(this.nodes[i]);
        }
      }
    }
  }

  //mutate the NN by adding a new node
  //it does this by picking a random connection and disabling it then 2 new connections are added
  //1 between the input node of the disabled connection and the new node
  //and the other between the new node and the output of the disabled connection
  addNode(innovationHistory) {
    //pick a random connection to create a node between
    if (this.genes.length === 0) {
      return this.addConnection(innovationHistory);
    }

    let randomConnection = Math.floor(Math.random() * this.genes.length);

    while (
      this.genes[randomConnection].fromNode === this.nodes[this.biasNode] &&
      this.genes.length !== 1) { //dont disconnect bias
      randomConnection = Math.floor(Math.random() * this.genes.length);
    }

    //Before creating a new connection, disable the old connection
    this.genes[randomConnection].enabled = false;

    //Create a new node
    let newNodeNo = this.nextNode;
    this.nodes.push(new Node(newNodeNo));
    this.nextNode++;

    //add a new connection to the new node with a weight of 1
    let connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.genes[randomConnection].fromNode, this.getNode(newNodeNo));
    this.genes.push(new ConnectionGene(this.genes[randomConnection].fromNode, this.getNode(newNodeNo), 1, connectionInnovationNumber));

    connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.getNode(newNodeNo), this.genes[randomConnection].toNode);
    //add a new connection from the new node with a weight the same as the disabled connection
    this.genes.push(new ConnectionGene(this.getNode(newNodeNo), this.genes[randomConnection].toNode, this.genes[randomConnection].weight, connectionInnovationNumber));
    this.getNode(newNodeNo).layer = this.genes[randomConnection].fromNode.layer + 1;


    connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[this.biasNode], this.getNode(newNodeNo));
    //connect the bias to the new node with a weight of 0
    this.genes.push(new ConnectionGene(this.nodes[this.biasNode], this.getNode(newNodeNo), 0, connectionInnovationNumber));

    //if the layer of the new node is equal to the layer of the output node of the old connection then a new layer needs to be created
    //more accurately the layer numbers of all layers equal to or greater than this new node need to be incremented
    if (this.getNode(newNodeNo).layer === this.genes[randomConnection].toNode.layer) {
      for (let i = 0; i < this.nodes.length - 1; i++) { //dont include this newest node
        if (this.nodes[i].layer >= this.getNode(newNodeNo).layer) {
          this.nodes[i].layer++;
        }
      }
      this.layers++;
    }
    this.connectNodes();
  }

  //------------------------------------------------------------------------------------------------------------------
  //adds a connection between 2 this.nodes which aren't currently connected
  addConnection(innovationHistory) {
    //cannot add a connection to a fully connected network
    if (this.fullyConnected()) {
      console.log("connection failed");
      return;
    }


    //get random this.nodes
    let randomNode1 = Math.floor(Math.random() * (this.nodes.length));
    let randomNode2 = Math.floor(Math.random() * (this.nodes.length));
    while (this.randomConnectionNodesAreShit(randomNode1, randomNode2)) { //while the random this.nodes are no good
      //get new ones
      randomNode1 = Math.floor(Math.random() * (this.nodes.length));
      randomNode2 = Math.floor(Math.random() * (this.nodes.length));
    }
    let temp;
    if (this.nodes[randomNode1].layer > this.nodes[randomNode2].layer) { //if the first random node is after the second then switch
      temp = randomNode2;
      randomNode2 = randomNode1;
      randomNode1 = temp;
    }

    //get the innovation number of the connection
    //this will be a new number if no identical genome has mutated in the same way
    let connectionInnovationNumber = this.getInnovationNumber(innovationHistory, this.nodes[randomNode1], this.nodes[randomNode2]);
    //add the connection with a random array

    this.genes.push(new ConnectionGene(this.nodes[randomNode1], this.nodes[randomNode2], Math.random() * 2 - 1,
      connectionInnovationNumber)); //changed this so if error here
    this.connectNodes();
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------
  randomConnectionNodesAreShit(r1, r2) {
    if (this.nodes[r1].layer === this.nodes[r2].layer) return true; // if the this.nodes are in the same layer
    if (this.nodes[r1].isConnectedTo(this.nodes[r2])) return true; //if the this.nodes are already connected


    return false;
  }

  //-------------------------------------------------------------------------------------------------------------------------------------------
  //returns the innovation number for the new mutation
  //if this mutation has never been seen before then it will be given a new unique innovation number
  //if this mutation matches a previous mutation then it will be given the same innovation number as the previous one
  getInnovationNumber(innovationHistory, from, to) {
    let isNew = true;
    let connectionInnovationNumber = nextConnectionNo;
    for (let i = 0; i < innovationHistory.length; i++) { //for each previous mutation
      if (innovationHistory[i].matches(this, from, to)) { //if match found
        isNew = false; //its not a new mutation
        connectionInnovationNumber = innovationHistory[i].innovationNumber; //set the innovation number as the innovation number of the match
        break;
      }
    }

    if (isNew) { //if the mutation is new then create an arrayList of varegers representing the current state of the genome
      let innoNumbers = [];
      for (let i = 0; i < this.genes.length; i++) { //set the innovation numbers
        innoNumbers.push(this.genes[i].innovationNo);
      }

      //then add this mutation to the innovationHistory
      innovationHistory.push(new ConnectionHistory(from.number, to.number, connectionInnovationNumber, innoNumbers));
      nextConnectionNo++;
    }
    return connectionInnovationNumber;
  }

  //----------------------------------------------------------------------------------------------------------------------------------------

  //returns whether the network is fully connected or not
  fullyConnected() {

    let maxConnections = 0;
    let nodesInLayers = []; //array which stored the amount of this.nodes in each layer
    for (let i = 0; i < this.layers; i++) {
      nodesInLayers[i] = 0;
    }
    //populate array
    for (let i = 0; i < this.nodes.length; i++) {
      nodesInLayers[this.nodes[i].layer] += 1;
    }
    //for each layer the maximum amount of connections is the number in this layer * the number of this.nodes infront of it
    //so lets add the max for each layer together and then we will get the maximum amount of connections in the network
    for (let i = 0; i < this.layers - 1; i++) {
      let nodesInFront = 0;
      for (let j = i + 1; j < this.layers; j++) { //for each layer infront of this layer
        nodesInFront += nodesInLayers[j]; //add up this.nodes
      }

      maxConnections += nodesInLayers[i] * nodesInFront;
    }

    return maxConnections <= this.genes.length;


  }


  //-------------------------------------------------------------------------------------------------------------------------------
  //mutates the genome
  mutate(innovationHistory) {
    if (this.genes.length === 0) {
      this.addConnection(innovationHistory);
    }


    let rand1 = Math.random();
    if (rand1 < 0.8) { // 80% of the time mutate weights

      for (let i = 0; i < this.genes.length; i++) {
        this.genes[i].mutateWeight();
      }
    }

    //5% of the time add a new connection
    let rand2 = Math.random();
    if (rand2 < 0.05) {

      this.addConnection(innovationHistory);
    }

    //1% of the time add a node
    let rand3 = Math.random();
    if (rand3 < 0.01) {

      this.addNode(innovationHistory);
    }
  }

  //---------------------------------------------------------------------------------------------------------------------------------
  //called when this Genome is better that the other parent
  crossover(parent2) {
    let child = new Genome(this.inputs, this.outputs, true);
    child.genes = [];
    child.nodes = [];
    child.layers = this.layers;
    child.nextNode = this.nextNode;
    child.biasNode = this.biasNode;
    child.output_nodes = this.output_nodes;
    let childGenes = []; //list of genes to be inherited form the parents
    let isEnabled = [];
    //all inherited genes
    for (let i = 0; i < this.genes.length; i++) {
      let setEnabled = true; //is this node in the child going to be enabled

      let parent2gene = this.matchingGene(parent2, this.genes[i].innovationNo);
      if (parent2gene !== -1) { //if the genes match
        if (!this.genes[i].enabled || !parent2.genes[parent2gene].enabled) { //if either of the matching genes are disabled

          if (Math.random() < 0.75) { //75% of the time disable the childs gene
            setEnabled = false;
          }
        }
        let rand = Math.random();
        if (rand < 0.5) {
          childGenes.push(this.genes[i]);

          //get gene from this fucker
        } else {
          //get gene from parent2
          childGenes.push(parent2.genes[parent2gene]);
        }
      } else { //disjoint or excess gene
        childGenes.push(this.genes[i]);
        setEnabled = this.genes[i].enabled;
      }
      isEnabled.push(setEnabled);
    }


    //since all excess and disjovar genes are inherrited from the more fit parent (this Genome) the childs structure
    // is no different from this parent | with exception of dormant connections being enabled but this wont effect this.nodes
    //so all the this.nodes can be inherrited from this parent
    for (let i = 0; i < this.nodes.length; i++) {
      child.nodes.push(this.nodes[i].clone());
    }

    //clone all the connections so that they connect the childs new this.nodes

    for (let i = 0; i < childGenes.length; i++) {
      child.genes.push(childGenes[i].clone(child.getNode(childGenes[i].fromNode.number), child.getNode(childGenes[i].toNode.number)));
      child.genes[i].enabled = isEnabled[i];
    }

    child.connectNodes();
    return child;
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //returns whether or not there is a gene matching the input innovation number  in the input genome
  matchingGene(parent2, innovationNumber) {
    for (let i = 0; i < parent2.genes.length; i++) {
      if (parent2.genes[i].innovationNo === innovationNumber) {
        return i;
      }
    }
    return -1; //no matching gene found
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //prints out info about the genome to the console
  printGenome() {
    console.log("Prvar genome  layers:" + this.layers);
    console.log("bias node: " + this.biasNode);
    console.log("this.nodes");
    for (let i = 0; i < this.nodes.length; i++) {
      console.log(this.nodes[i].number + ",");
    }
    console.log("Genes");
    for (let i = 0; i < this.genes.length; i++) { //for each connectionGene
      console.log("gene " + this.genes[i].innovationNo + "From node " + this.genes[i].fromNode.number + "To node " + this.genes[i].toNode.number +
        "is enabled " + this.genes[i].enabled + "from layer " + this.genes[i].fromNode.layer + "to layer " + this.genes[i].toNode.layer + "weight: " + this.genes[i].weight);
    }

    console.log();
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //returns a copy of this genome
  clone() {

    let clone = new Genome(this.inputs, this.outputs, true);

    for (let i = 0; i < this.nodes.length; i++) { //copy this.nodes
      clone.nodes.push(this.nodes[i].clone());
    }

    //copy all the connections so that they connect the clone new this.nodes

    for (let i = 0; i < this.genes.length; i++) { //copy genes
      clone.genes.push(this.genes[i].clone(clone.getNode(this.genes[i].fromNode.number), clone.getNode(this.genes[i].toNode.number)));
    }

    clone.layers = this.layers;
    clone.nextNode = this.nextNode;
    clone.biasNode = this.biasNode;
    clone.output_nodes = this.output_nodes;
    clone.connectNodes();

    return clone;
  }

  //----------------------------------------------------------------------------------------------------------------------------------------
  //draw the genome on the screen
  drawGenome(context, startX, startY, w, h) {
    //i know its ugly but it works (and is not that important) so I'm not going to mess with it
    let allNodes = [];
    let nodePoses = [];
    let nodeNumbers = [];
    let nodeLayers = [];

    //get the positions on the screen that each node is supposed to be in
    //split the this.nodes varo layers
    for (let i = 0; i < this.layers; i++) {
      let temp = []; // new ArrayList<Node>();
      for (let j = 0; j < this.nodes.length; j++) { //for each node
        if (this.nodes[j].layer === i) { //check if it is in this layer
          temp.push(this.nodes[j]); //add it to this layer
        }
      }
      allNodes.push(temp); //add this layer to all this.nodes
    }

    //for each layer add the position of the node on the screen to the node posses
    for (let i = 0; i < this.layers; i++) {
      //fill(255, 0, 0);
      let x = startX + ((i + 1.0) * (w - 25)) / (this.layers);
      for (let j = 0; j < allNodes[i].length; j++) { //for the position in the layer
        let y = startY + ((j + 1.0) * h) / (allNodes[i].length + 1.0);
        nodePoses.push(new Vector(x, y));
        nodeNumbers.push(allNodes[i][j].number);
        nodeLayers.push(allNodes[i][j].layer)
      }
    }

    for (let i = 0; i < this.genes.length; i++) {
      let from;
      let to;
      from = nodePoses[nodeNumbers.indexOf(this.genes[i].fromNode.number)];
      to = nodePoses[nodeNumbers.indexOf(this.genes[i].toNode.number)];
      if (!this.genes[i].enabled) {
        context.strokeStyle = "#888888";
      } else if (this.genes[i].weight > 0.0) {
        context.strokeStyle = "#FF0000";
      } else {
        context.strokeStyle = "#0000FF";
      }
      context.lineWidth = Math.max(1, (Math.abs(this.genes[i].weight * 6)));
      context.beginPath();
      context.moveTo(from.x, from.y);
      context.lineTo(to.x, to.y);
      context.stroke();
      context.closePath();
    }

    //draw this.nodes last so they appear on top of the connection lines
    for (let i = 0; i < nodePoses.length; i++) {
      context.fillStyle = "#fff";
      context.strokeStyle = "#888";
      if (this.nodes[i].outputValue === 0.0) {
        context.strokeStyle = "#888888";
      } else if (this.nodes[i].outputValue > 0.5) {
        context.strokeStyle = "#FF0000";
      } else if (this.nodes[i].outputValue > 0) {
        context.strokeStyle = "#880000"
      } else if (this.nodes[i].outputValue > -0.5) {
        context.strokeStyle = "#000088";
      } else {
        context.strokeStyle = "#0000FF";
      }
      context.lineWidth = 4;
      context.beginPath();
      //context.moveTo(nodePoses[i].x, nodePoses[i].y - 10);
      context.arc(nodePoses[i].x, nodePoses[i].y - 7.5, 15, 0, 2 * Math.PI);

      context.fill();
      context.stroke();
      context.closePath();
      context.textAlign = 'center';
      context.fillStyle = '#000';
      context.fillText(nodeLayers[i], nodePoses[i].x, nodePoses[i].y);

    }

  }
}
