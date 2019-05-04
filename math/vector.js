export class Vector {
    constructor(x, y){
        this.x = x;
        this.y = y;
    }

    add(v2){
        return new Vector(this.x+v2.x, this.y+v2.y);
    }
}
