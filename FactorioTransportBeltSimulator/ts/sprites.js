class Sprites {
    constructor() {
        this.loadChecked = false;
        const path = "/factorio/data/base/graphics/entity/";
        Sprites.loadImg(path + "transport-belt/transport-belt.png", img => { this.transportBelt = img; });
        Sprites.loadImg(path + "splitter/splitter-east.png", img => { this.splitterEast = img; });
        Sprites.loadImg(path + "splitter/splitter-north.png", img => { this.splitterNorth = img; });
        Sprites.loadImg(path + "splitter/splitter-south.png", img => { this.splitterSouth = img; });
        Sprites.loadImg(path + "splitter/splitter-west.png", img => { this.splitterWest = img; });
        Sprites.loadImg(path + "underground-belt/underground-belt-structure.png", img => { this.undergroundBelt = img; });
    }
    static loadImg(url, callback) {
        const img = new Image();
        img.onload = () => callback(img);
        img.onerror = () => {
            console.error("load error: " + url);
            if (this.showError)
                return;
            alert("load error: " + url);
            this.showError = true;
        };
        img.src = url;
    }
    hasLoaded() {
        if (this.loadChecked)
            return true;
        const check = this.transportBelt && this.splitterEast && this.splitterNorth && this.splitterSouth && this.splitterWest && this.undergroundBelt && true;
        if (check)
            this.loadChecked = true;
        return check;
    }
}
Sprites.showError = false;
//# sourceMappingURL=sprites.js.map