# Simple Stuck Fix
These modules seek to provide the simplest possible solution to creeps getting stuck on eachother, typically when using high `reusePath` values or `ignoreCreeps: true`.
With these modules you should be able to use these options without issues.

The scripts provide good insight into a perfectly capable basic solution by being as simple and easy-to-use as possible.

However, they don't aim to be the most efficient solution. To be more efficient it is recommended to expand upon their capabilities in your own codebase. Suggestions for ideas on how to improve upon them yourself are given at the end of this readme. More efficient solutions can be reached simply by expanding upon the provided framework, but there are also entirely different systems and ways of doing it.

## Usage
One of the `giveWay`-scripts can be used, as well as `stuckRepather`. It is up to you if you want to use `stuckRepather`, `giveWay`, or both.
Usage of each module is described in the files themselves.

## GiveWay
Allows creeps to move out of the way of other creeps.

Two files are provided, a *standard* and a *streamlined* version. They cannot be used together.

The streamlined version is much simpler and more concise, but some uses of `move` or `moveTo` may cause problematic behavior if creeps accidentally try moving into walls.

The standard version is more forgiving to inefficient use of `move` and `moveTo`, but also includes more code at the bottom of the file which is more confusing and not really necessary to understand.

## StuckRepather

Implements a last-ditch effort to automatically repath around other creeps if they get stuck.

Ideally `giveWay` aims to minimize the need for this, but ultimately if it fails, this module will take care of it.

## Ideas for things to improve upon
  
* Pushing is not always instant due to creep execution order.
* If a blocking creep is building, upgrading etc. it would be desirable (though not always possible!) to be pushed to another position still in range, rather than one out of range.
* When a creep gives way, it may try to move into walls, structures, or more trickily other creeps! This may delay the process by a couple ticks and issue unnecessary move-intents.
* Swapping may be a cheaper alternative to solving the above point, but can also result in extra unnecessary move intents at best, or infinitely recursive behavior at worst. Mixing it up is a good way of avoiding the latter.
* If a blocking creep can't move out of the way, we're still spending a move-intent trying to `move` into it.
* There may be cheaper alternatives to `lookForAt`, ones that can be reused to make other behaviors in our codebase cheaper too.
