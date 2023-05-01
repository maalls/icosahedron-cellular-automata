
export class CellularAutomata {
    zoneMap = {
        1: [5, 2, 7], // left, right, bottom
        2: [1, 3, 6],
        3: [2, 4, 10],
        4: [3, 5, 9],
        5: [4, 1, 8],
        6: [2, 20, 16],
        7: [1, 16, 17],
        8: [5, 17, 18],
        9: [4, 18, 19],
        10: [3, 19, 20],
        11: [15, 12, 16],
        12: [11, 13, 17],
        13: [12, 14, 18],
        14: [13, 15, 19],
        15: [14, 11, 20],
        16: [11, 7, 6],
        17: [12, 8, 7],
        18: [13, 9, 8],
        19: [14, 10, 9],
        20: [15, 6, 10]
    }

    colors = []
    newColors = [];

    constructor(n) {
        this.setN(n);
    }

    setN(n) {
        this.n = n;
        this.facePerZone = (n + 1) * (n + 1);
        this.faceCount = this.facePerZone * 20;
        this.baseSize = 1 + 2 * n;
        this.zoneHeight = 0;
        let diff = this.facePerZone;
        let rowSize = this.baseSize;
        while (diff > 0) {
            this.zoneHeight++;
            diff = diff - rowSize;
            rowSize = rowSize - 2;
        }
        this.generateNeigbors();
    }

    isInRegularZone(zone) {
        // zone 1 to 5 and 11 to 15 are called regular because they are adjacent to a pole
        return this.zone <= 5 || (this.zone > 10 && this.zone <= 15);
    }

    getNeigborCount(i) {
        let neighbor = 0;
        this.getNeigbors(i).forEach(el => {
            neighbor += this.getColor(el);
        });

        return neighbor;

    }


    getNeigbors(i) {
        return this.neighbors[i];
    }

    generateNeigbors() {

        this.neighbors = [];

        for (let i = 1; i <= this.faceCount; i++) {
            //console.log('check2',i, leftNeighbor);
            //console.log(i, leftNeighbor, rightNeighbor, bottomNeighbor);
            //console.log(i, leftNeighbor, rightNeighbor, bottomNeighbor);
            this.neighbors[i] = this.computeNeigbors(i);
        }
    }

    computeNeigbors(i) {
        this.zone = Math.floor((i - 1) / this.facePerZone) + 1;
        this.subIndex = i - (this.zone - 1) * this.facePerZone;
        let diff = this.subIndex;
        this.levelSize = this.baseSize;
        this.level = 0;
        this.levelIndex = this.subIndex;
        while (diff > 0) {
            this.level++;
            diff -= this.levelSize;
            if (this.levelIndex - this.levelSize > 0) {
                this.levelIndex = this.levelIndex - this.levelSize;
                this.levelSize -= 2;
            }



        }
        let neighbors = [];
        let isOnLeft = null;
        let isOnRight = null;
        let isOnBottom = null;
        if (this.levelIndex == 1) {
            isOnLeft = true;
        }
        else {
            isOnLeft = false;
        }

        if (this.level == 1 && this.subIndex % 2 == 1) {
            isOnBottom = true;
        }
        else {
            isOnBottom = false;
        }

        if (this.levelSize == this.levelIndex) {
            isOnRight = true;
        }
        else {
            isOnRight = false;
        }
        //console.log('position', i,'l', isOnLeft,'r', isOnRight, 'b', isOnBottom, this.level);

        let leftNeighbor = 0;
        let rightNeighbor = null;
        let bottomNeighbor = null;

        // we will solve the ones on the left border, then right border, then bottom border
        // the for the one inside
        //console.log(i, 'zone', this.zone);
        if (isOnRight) {

            // bottom
            //console.log("right", i, this.zone);

            let target = this.zoneMap[this.zone][2];
            if (this.isInRegularZone(this.zone)) {
                bottomNeighbor = (target - 1) * this.facePerZone + (this.baseSize - 2 * this.level + 2);
            }
            else {



                bottomNeighbor = (target - 1) * this.facePerZone;
                // get the inverse level i.e. level 1 will be top level
                let targetLevel = this.zoneHeight - this.level + 1;
                //console.log("tl", i, target, bottomNeighbor, targetLevel);
                let s = this.baseSize;
                for (let j = 0; j < targetLevel; j++) {
                    bottomNeighbor += s;
                    s = s - 2;
                }

            }
            //console.log("bottom", bottomNeighbor);

            // left
            if (!isOnBottom) {

                leftNeighbor = i - this.levelSize - 1;
                //console.log("not bottom, left", leftNeighbor);

            }
            else {

                let target = this.zoneMap[this.zone][0];
                if (this.isInRegularZone(this.zone)) {

                    leftNeighbor = target * this.facePerZone;

                }
                else {
                    leftNeighbor = (target - 1) * this.facePerZone + this.baseSize;
                }

                //console.log("bottom, left", leftNeighbor);

            }

            //console.log('check1', i, leftNeighbor);

            // right

            if (this.level != this.zoneHeight) {
                rightNeighbor = i - 1;
            }
            else {

                let target = this.zoneMap[this.zone][1];
                //.log('is on top, target', target);
                if (this.isInRegularZone(this.zone)) {
                    rightNeighbor = (target - 1) * this.facePerZone + this.baseSize;
                }
                else {
                    rightNeighbor = (target - 1) * this.facePerZone + 1;
                }
            }


        }

        else if (isOnLeft) {
            // calculate the bottom neighbor
            if (!isOnBottom) {

                //console.log('test', i, this.levelSize);
                bottomNeighbor = i - (this.levelSize + 2) + 1;

            }
            else {
                let target = this.zoneMap[this.zone][0];

                if (this.isInRegularZone(this.zone)) {

                    bottomNeighbor = (target - 1) * this.facePerZone + 1;
                }
                else {

                    bottomNeighbor = target * this.facePerZone;
                }



            }

            // calculation of right neighbor (done)
            if (this.level < this.zoneHeight) {
                rightNeighbor = i + 1;
            }
            else {
                if (this.isInRegularZone(this.zone)) {
                    rightNeighbor = (this.zoneMap[this.zone][2] - 1) * this.facePerZone + 1;
                }
                else {
                    rightNeighbor = (this.zoneMap[this.zone][2] - 1) * this.facePerZone + this.baseSize;
                }


                //console.log(this.zone, i, rightNeighbor);
            }


            // calculation of left neighbor (done)
            let target = this.zoneMap[this.zone][1];
            if (this.isInRegularZone(this.zone)) {
                leftNeighbor = (target - 1) * this.facePerZone + 1 + 2 * (this.level - 1);

            }
            else {

                leftNeighbor = (target - 1) * this.facePerZone + 1;
                let targetLevel = this.zoneHeight - this.level;
                let facePerRow = this.baseSize;
                for (let j = 0; j < targetLevel; j++) {
                    leftNeighbor += facePerRow;
                    facePerRow -= 2;
                }

            }

        }
        else if (isOnBottom) {


            let target = this.zoneMap[this.zone][0];

            if (this.isInRegularZone(this.zone)) {
                //console.log("here");
                bottomNeighbor = (target - 1) * this.facePerZone + 1;
                let targetLevel = (this.subIndex - 1) / 2;
                let s = this.baseSize;
                for (let j = 1; j <= targetLevel; j++) {
                    bottomNeighbor += s;
                    s = s - 2;
                }



            }
            else {

                //console.log('zone', this.zone);
                let targetLevel;
                if (!this.isInRegularZone(this.zone)) {
                    targetLevel = (this.baseSize - this.subIndex) / 2 + 1;
                    //console.log('tl', targetLevel);

                    bottomNeighbor = (target - 1) * this.facePerZone;
                    let s = this.baseSize;
                    for (let j = 1; j <= targetLevel; j++) {
                        bottomNeighbor += s;
                        s -= 2;
                    }

                }
                else {
                    targetLevel = this.zoneHeight - this.level + 1;
                    //.log('f', this.zoneHeight, this.level);
                    bottomNeighbor = (target - 1) * this.facePerZone;
                    //console.log('tl', targetLevel, target);
                    let s = this.baseSize;
                    //console.log("b", bottomNeighbor, targetLevel, s);
                    for (let j = 1; j < targetLevel; j++) {
                        bottomNeighbor += s;
                        s -= 2;
                        //console.log("it", bottomNeighbor, s);
                    }

                }


            }

            // if not on left or right
            leftNeighbor = i - 1;
            rightNeighbor = i + 1;

        }
        else {

            // not in left or right or bottom
            // left and right are always the direct neighbors
            leftNeighbor = i - 1;
            rightNeighbor = i + 1;


            // if the first element of the zone is odd then:
            // - odd element on odd row has bottom element on bottom
            // - even element on odd row has bottom element on top
            // - odd element on even row has bttom element on top
            // - even element on even row has bottom element on bottom
            // if the first element of the zone is even then:
            // - odd element on odd row has bottom element on top
            // - even element on odd row has bottom element on bottom
            // - odd element on even row has bttom element on bottom
            // - even element on even row has bottom element on top
            let isOnTop;
            let localFirst = i - (i % this.facePerZone) + 1;
            let localFirstIsEven = localFirst % 2 == 0;
            let onEvenLevel = this.level % 2 == 0;
            let onEvenIndex = i % 2 == 0;
            // we first assume it's on odd zone

            // then we assume it's on odd level
            if (!onEvenIndex) {
                isOnTop = false;
            }
            else {
                isOnTop = true;
            }
            // if on even level we take the opposite
            if (onEvenLevel) {
                isOnTop = !isOnTop;
            }
            // and if on even zone, we take the opposite again
            if (localFirstIsEven) {
                isOnTop = !isOnTop;
            }

            if (!isOnTop) {
                //console.log(i, 'bot');
                bottomNeighbor = i - 2 * (this.zoneHeight - this.level + 1);

            }
            else {

                bottomNeighbor = i + this.levelSize - 1;

            }

            /*console.log(i, {
                localFirst: localFirst,
                localFirstIsEven: localFirstIsEven, 
                onEvenLevel: onEvenLevel, 
                onEvenIndex: onEvenIndex,
                isOnTop: isOnTop,
                neighbors: [leftNeighbor, rightNeighbor, bottomNeighbor],
                subIndex: this.subIndex
            });*/

        }

        const ret = [leftNeighbor, rightNeighbor, bottomNeighbor];

        return ret;
    }

    getColor(i) {
        let ind = (i - 1) * 9;
        return this.colors[ind];
    }

    setColor(i, color) {

        return this.setColorRGB(i, color, 0, 0);

    }

    getColorRGB(i) {

        let ind = (i - 1) * 9;
        return [this.colors[ind], this.colors[ind + 1], this.colors[ind + 2]];

    }

    setColors(colors) {
        this.newColors = colors;
    }

    setColorRGB(i, red, green, blue) {
        let ind = (i - 1) * 9;
        this.newColors[ind + 0] = red;
        this.newColors[ind + 1] = green;
        this.newColors[ind + 2] = blue;
        this.newColors[ind + 3] = red;
        this.newColors[ind + 4] = green;
        this.newColors[ind + 5] = blue;
        this.newColors[ind + 6] = red;
        this.newColors[ind + 7] = green;
        this.newColors[ind + 8] = blue;
    }

    printNeigbors() {

        for (let i = 1; i <= this.faceCount; i++) {

            let nei = this.getNeigbors(i);
            console.log(i, nei);

        }
    }

    

    applyColors() {
        this.colors = this.newColors;
        this.newColors = [];
    }

}

