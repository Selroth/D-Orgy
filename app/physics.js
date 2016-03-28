"use strict";
define({
    // Returns the linear interpolation between a and b
    lerp: function(a, b, factor) {
        return a + factor * (b - a);
    },

    // A store of all state related to the physics engine
    context: {
        objects: [],
        gravity: {x: 0, y: 10},
    },

    Derivative: function() {
        this.dx = 0;
        this.dy = 0;
        this.dvx = 0;
        this.dvy = 0;
    },

    // Simple spring calculation
    acceleration: function(state, t) {
        var k = 0.3; // Spring constant
        var b = 0.1; // Spring Damping
        var l = 80; // Spring Rest length

        // Calculate the unit vector of the spring direction
        var length = Math.sqrt(state.x * state.x + state.y * state.y);
        var ux = state.x / length;
        var uy = state.y / length;

        // Calculate the force made by the spring
        var fx = -k * (length-l) * ux;
        var fy = -k * (length-l) * uy;

        // Add the dampening force of the spring
        var dot = state.vx*ux + state.vy*uy;
        fx += -ux * dot * b;
        fy += -uy * dot * b;

        var mass = 1;

        // Add gravity
        fx += this.context.gravity.x * mass;
        fy += this.context.gravity.y * mass;

        // Divide force with mass to get acceleration
        return {x: fx / mass, y: fy / mass};
    },

    evaluate: function(initial, t, dt, derivative) {
        var state = {
            x: initial.x + derivative.dx*dt,
            y: initial.y + derivative.dy*dt,
            vx: initial.vx + derivative.dvx*dt,
            vy: initial.vy + derivative.dvy*dt,
        };

        var acc = this.acceleration(state, t+dt);

        return {
            dx: state.vx,
            dy: state.vy,
            dvx: acc.x,
            dvy: acc.y,
        };
    },

    // An implementation of Runge Kutta order 4 integrator
    // see http://gafferongames.com/game-physics/integration-basics/
    integrate: function(state, t, dt) {
        var a = this.evaluate(state, t, 0, new this.Derivative());
        var b = this.evaluate(state, t, dt*0.5, a);
        var c = this.evaluate(state, t, dt*0.5, b);
        var d = this.evaluate(state, t, dt, c);

        var dxdt = 1 / 6 * (a.dx + 2*(b.dx + c.dx) + d.dx);
        var dydt = 1 / 6 * (a.dy + 2*(b.dy + c.dy) + d.dy);
        var dvxdt = 1 / 6 * (a.dvx + 2*(b.dvx + c.dvx) + d.dvx);
        var dvydt = 1 / 6 * (a.dvy + 2*(b.dvy + c.dvy) + d.dvy);

        state.x = state.x + dxdt * dt;
        state.y = state.y + dydt * dt;
        state.vx = state.vx + dvxdt * dt;
        state.vy = state.vy + dvydt * dt;
    },
});
