Silly little project
====================

So, welcome to this silly little project of mine, which I thought would
be a good base for somekinda collaborative project between the various
programmers of D.org, of various skill- levels.  All it really is, is
some bouncing ball in a canvas.  The idea I had as a kid was to make a
real-time, very physics-based, top-down game involving dragons, animals,
and humans in somekinda strategic team-based hunt.

One problem I had in earlier (flash-based) versions was collision
detection.  None of the solutions I was finding at the time (I wasn't
very savvy in physics either) worked well in a game where every limb on
the ground incurred friction and was a collidable object.  Since I
originally planned for the game to be played on a keyboard (not mouse),
I figured the paths and state objects are in didn't change frequently
(at least, several dozen frames would likely pass before the random
input of a user would occur again).  Thus, collision events wouldn't be
detected, but predicted at the time the system state changed.  The
collision event would be added onto a timeline (as well as other
events), and be processed once the timeline's time passed over the
event's time.

One aspect of the game was precise time-control: speeding up, slowing
down, stopping, or even reversing time.  If a hunt or something doesn't
go as planned, the player may rewind time and adjust as they wish.  As
things get more chaotic and require finer control, the player may slow
the game down.

Personally, I consider the game idea more or less abandoned, so feel
free to take things in a completely different direction, or trash it
altogether and make some other base to build a game off of.  It wouldn't
be hard - just need something that's easy for a novice programmer to
understand and contribute to, yet graphical and inviting enough to
inspire such a contribution.
