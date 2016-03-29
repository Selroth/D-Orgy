// ====================================================================
// Insert fancy header with description
// of what this is here
// ====================================================================

define(function() {


    // ================================================================
    //    Vector Type
    // ================================================================

    function Vector(x, y) {
        if (x === undefined) {
            x = y = 0;

        } else if (typeof x === Vector) {
            var vec = x;
            x = vec.x;
            y = vec.y;

        } else if (y === undefined) {
            // Illegal constructor
            throw TypeError("Vector needs 0 or 2 arguments");
        }

        this.x = x;
        this.y = y;
    }



    // ----------------------------------------------------------------
    //    Common Vector math
    // ----------------------------------------------------------------

    Vector.prototype.dot = function(rhs) {
        return this.x*rhs.x + this.y*rhs.y;
    };

    Vector.prototype.length = function() {
        return Math.sqrt(this.x*this.x + this.y*this.y);
    };

    Vector.prototype.normalize = function() {
        var length = this.length();
        this.x /= length;
        this.y /= length;
    };

    Vector.prototype.normal = function() {
        var length = this.length();
        return new Vector(this.x / length, this.y / length);
    };



    // ----------------------------------------------------------------
    //    Simple Vector math
    // ----------------------------------------------------------------

    Vector.prototype.add = function(rhs) {
        return new Vector(this.x+rhs.x, this.y+rhs.y);
    };

    Vector.prototype.addThis = function(rhs) {
        this.x += rhs.x;
        this.y += rhs.y;
    };

    Vector.prototype.scalarAdd = function(rhs) {
        return new Vector(this.x+rhs, this.y+rhs);
    };

    Vector.prototype.scalarAddThis = function(rhs) {
        this.x += rhs;
        this.y += rhs;
    };

    Vector.prototype.sub = function(rhs) {
        return new Vector(this.x-rhs.x, this.y-rhs.y);
    };

    Vector.prototype.subThis = function(rhs) {
        this.x -= rhs.x;
        this.y -= rhs.y;
    };

    Vector.prototype.scalarSub = function(rhs) {
        return new Vector(this.x-rhs, this.y-rhs);
    };

    Vector.prototype.scalarSubThis = function(rhs) {
        this.x -= rhs;
        this.y -= rhs;
    };

    Vector.prototype.mul = function(rhs) {
        return new Vector(this.x*rhs.x, this.y*rhs.y);
    };

    Vector.prototype.mulThis = function(rhs) {
        this.x *= rhs.x;
        this.y *= rhs.y;
    };

    Vector.prototype.scalarMul = function(rhs) {
        return new Vector(this.x*rhs, this.y*rhs);
    };

    Vector.prototype.scalarMulThis = function(rhs) {
        this.x *= rhs;
        this.y *= rhs;
    };

    Vector.prototype.div = function(rhs) {
        return new Vector(this.x/rhs.x, this.y/rhs.y);
    };

    Vector.prototype.divThis = function(rhs) {
        this.x /= rhs.x;
        this.y /= rhs.y;
    };

    Vector.prototype.scalarDiv = function(rhs) {
        return new Vector(this.x/rhs, this.y/rhs);
    };

    Vector.prototype.scalarDivThis = function(rhs) {
        this.x /= rhs;
        this.y /= rhs;
    };



    return {
        Vector: Vector,
    };
});
