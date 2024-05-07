/* Give Way-module - V1king 12 March 2024

Usage:
    First add  require("giveWay");  at the top of your main.js
    Finally call creep.giveWay() once after your creep has executed its normal logic.
    "Normal logic" includes anything where creep.move(), creep.moveTo() or creep.moveByPath() is called.


Standard version:
    The standard version tries to handle any issues that may arise from inefficient usage of creep.move() or creep.moveTo().
    Essentially it tries to detect when the creep won't move despite either function returning OK, and allow it to give way in those cases as well.
    This can happen if a creep attempts to move into a wall or structure.
*/

Creep.prototype.giveWay = function()
{
    if(this.fatigue)
        return;
    // We can't block others when we're actively moving
    if(this.hasMoved)
    {
        delete this.memory.blocking;
        return;
    }
    // No request
    if(!this.memory.blocking)
        return;
    // It's an old request that has timed out
    if(Game.time > this.memory.blocking)
    {
        delete this.memory.blocking;
        return;
    }

    // Move a random direction to get out of their way
    this.say("Giving way", true);
    this.move(getRandomDirection());
    delete this.memory.blocking;
}

function getRandomDirection()
{
    return Math.floor(Math.random() * 8) + 1;
}

// Taken from Screeps engine source code https://github.com/screeps/engine/blob/78d980e50821ea9956d940408b733c44fc9d94ed/src/utils.js#L3
const offsetsByDirection = [, [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1]];

const move = Creep.prototype.move;
Creep.prototype.move = function(target)
{
    // We passed a direction
    if(typeof(target) === "number")
    {
        // Use the direction to find the next position
        const offset = offsetsByDirection[target];
        const nextX = this.pos.x + offset[0];
        const nextY = this.pos.y + offset[1];

        if(!isOutOfBounds(nextX, nextY))
        {
            // Check any creeps at the next position
            const blockingCreep = this.room.lookForAt(LOOK_CREEPS, nextX, nextY)[0];
            if(blockingCreep && blockingCreep.my)
                blockingCreep.memory.blocking = Game.time + 1; // Request that they move away either this tick, or the next
        }

        if(canMoveInto(this.room, nextX, nextY))
            this.hasMoved = true;
    }
    else
        this.hasMoved = true;

    return move.call(this, target);
}

function isOutOfBounds(x, y)
{
    return x < 0 || x > 49
        || y < 0 || y > 49;
}

// Complex code below to handle erroneous moves

function canMoveInto(room, x, y)
{
    const objects = room.lookAt(x, y);
    for(let i = 0; i < objects.length; ++i)
    {
        switch(objects[i].type)
        {
            case LOOK_STRUCTURES:
                if(OBSTACLE_OBJECT_TYPES.includes(objects[i].structure.structureType))
                    return false;
                break;
            case LOOK_TERRAIN:
                if(objects[i].terrain === "wall")
                    return false;
                break;
        }
    }
    return true;
}

const moveTo = Creep.prototype.moveTo;
Creep.prototype.moveTo = function(firstArg, secondArg, opts)
{
    const result = moveTo.call(this, firstArg, secondArg, opts);
    switch(result)
    {
        case OK:
            if(_.isObject(firstArg))
                opts = _.clone(secondArg);
            opts = opts || {};
        
            const [x, y, roomName] = fetchXYArguments(firstArg, secondArg)
            opts.range = opts.range || 1;
            if(!this.pos.inRangeTo(new RoomPosition(x, y, roomName || this.room.name), opts.range))
                this.hasMoved = true;
            break;
    }
    return result;
}

// Taken from Screeps engine source code https://github.com/screeps/engine/blob/97c9d12385fed686655c13b09f5f2457dd83a2bf/src/utils.js#L34-L63
function fetchXYArguments(firstArg, secondArg) {
    var x,y, roomName;
    if(_.isUndefined(secondArg) || !_.isNumber(secondArg)) {
        if(!_.isObject(firstArg)) {
            return [undefined,undefined,undefined];
        }

        if(firstArg instanceof RoomPosition) {
            x = firstArg.x;
            y = firstArg.y;
            roomName = firstArg.roomName;
        }
        if(firstArg.pos && (firstArg.pos instanceof RoomPosition)) {
            x = firstArg.pos.x;
            y = firstArg.pos.y;
            roomName = firstArg.pos.roomName;
        }
    }
    else {
        x = firstArg;
        y = secondArg;
    }
    if(_.isNaN(x)) {
        x = undefined;
    }
    if(_.isNaN(y)) {
        y = undefined;
    }
    return [x,y,roomName];
}
