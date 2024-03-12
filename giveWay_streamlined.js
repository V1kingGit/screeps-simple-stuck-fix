/* Give Way-module - V1king 12 March 2024

Usage:
    First add  require("giveWay");  at the top of your main.js
    Finally call creep.giveWay() once after your creep has executed its normal logic.
    "Normal logic" includes anything where creep.move(), creep.moveTo() or creep.moveByPath() is called.


Streamlined version:
    The streamlined version cuts out any handling of erroneous moves into walls or structures, instead trying to merely achieve the behavior in the simplest way possible.
    Creeps may therefore still block others if they're trying to move into walls or structures.
    Use the standard version instead if you cannot guarantee that this won't occur.
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
    }

    this.hasMoved = true;

    return move.call(this, target);
}

function isOutOfBounds(x, y)
{
    return x < 0 || x > 49
        || y < 0 || y > 49;
}