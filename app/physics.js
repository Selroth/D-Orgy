"use strict";
define(['linmath'], function(linmath) {
    var Vector = linmath.Vector;

    // Returns the linear interpolation between a and b
    function lerp(a, b, factor) {
        return a + factor * (b - a);
    }

    // A store of all state related to the physics engine
    var context = {
        objects: [],
        gravity: new Vector(0, 10),
    };

    function Derivative() {
        this.dl = new Vector();
        this.dv = new Vector();
    }

    // Simple spring calculation
    function acceleration(state, t) {
        var k = 0.3; // Spring constant
        var b = 0.1; // Spring Damping
        var l = 80; // Spring Rest length

        // Calculate the unit vector of the spring direction
        var length = state.l.length();
        var normal = state.l.normal();

        // Calculate the force made by the spring
        var f = normal.scalarMul(-k * (length-l));

        // Add the dampening force of the spring
        var dot = state.v.dot(normal);
        f.addThis(normal.scalarMul(-dot * b));

        var mass = 1;

        // Add gravity
        f.addThis(context.gravity.scalarMul(mass));

        // Divide force with mass to get acceleration
        f.scalarDivThis(mass);

        return f;
    }

    function evaluate(initial, t, dt, derivative) {
        var state = {
            l: initial.l.add(derivative.dl.scalarMul(dt)),
            v: initial.v.add(derivative.dv.scalarMul(dt)),
        };

        var acc = acceleration(state, t+dt);

        return {
            dl: state.v,
            dv: acc,
        };
    }

    // An implementation of Runge Kutta order 4 integrator
    // see http://gafferongames.com/game-physics/integration-basics/
    function integrate(state, t, dt) {
        var a = evaluate(state, t, 0, new Derivative());
        var b = evaluate(state, t, dt*0.5, a);
        var c = evaluate(state, t, dt*0.5, b);
        var d = evaluate(state, t, dt, c);

        // Formula is 1 / 6 * (a + 2b + 2c + d)
        var dldt = b.dl.add(c.dl);
        dldt.scalarMulThis(2);
        dldt.addThis(a.dl);
        dldt.addThis(d.dl);
        dldt.scalarMulThis(1 / 6);

        // Formula is 1 / 6 * (a + 2b + 2c + d)
        var dvdt = b.dv.add(c.dv);
        dvdt.scalarMulThis(2);
        dvdt.addThis(a.dv);
        dvdt.addThis(d.dv);
        dvdt.scalarMulThis(1 / 6);

        state.l.addThis(dldt.scalarMul(dt));
        state.v.addThis(dvdt.scalarMul(dt));
    }

    return {
        lerp: lerp,
        integrate: integrate,
    };
});
