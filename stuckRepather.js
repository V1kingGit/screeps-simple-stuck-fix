/* Stuck Repather-module - V1king 12 March 2024

Usage:
    Simply add  require("stuckRepather");  at the top of your main.js
    creep.moveTo() will then automatically repath to avoid getting stuck when using a high "reusePath" value or "ignoreCreeps: true"
*/

const moveTo = Creep.prototype.moveTo;
Creep.prototype.moveTo = function(firstArg, secondArg, opts)
{
    if(!this.memory.lastPos)
        initStuckMemory(this);
    performStuckCheck(this);
    pathAroundCreepsIfStuck(this, secondArg, opts);

    const result = moveTo.call(this, firstArg, secondArg, opts);
    
    this.memory.triedMoving = result === OK;
    return result;
}

function performStuckCheck(creep)
{
    if(!creep.memory.triedMoving)
        return;

    // Didn't move
    if(creep.pos.x === creep.memory.lastPos.x
    && creep.pos.y === creep.memory.lastPos.y)
    {
        creep.memory.blockedTicks = Math.min(11, creep.memory.blockedTicks + 1);
        if(creep.memory.blockedTicks > 10)
            creep.memory.isStuck = true;
    }
    // Moved successfully
    else
    {
        creep.memory.lastPos = creep.pos;

        // We weren't stuck, reset our blockedTicks
        if(!creep.memory.isStuck)
            creep.memory.blockedTicks = 0;
        // We were stuck, decrease our blockedTicks slowly and then become unstuck after a while
        else if(--creep.memory.blockedTicks < 9)
            creep.memory.isStuck = false;
    }
}

function pathAroundCreepsIfStuck(creep, secondArg, opts)
{
    if(!creep.memory.isStuck)
        return;
    
    creep.say("Stuck", true);
    
    // Don't worry about this. Essentially either of these may be the true opts-object due to how moveTo works internally
    if(typeof(secondArg) === "number")
    {
        opts = opts || {};
        opts.reusePath = 0;
    }
    else
    {
        secondArg = secondArg || {};
        secondArg.reusePath = 0;
    }

    // Try to move through creeps half the time, try to path around them half the time
    if(Game.time % 10 < 5)
    {
        if(opts)
            delete opts.ignoreCreeps;
        else if(secondArg)
            delete secondArg.ignoreCreeps;
    }
}

function initStuckMemory(creep)
{
    creep.memory.lastPos = creep.pos;
    creep.memory.blockedTicks = 0;
}