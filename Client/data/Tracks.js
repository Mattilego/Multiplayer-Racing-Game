let tracks = [];

tracks.push(new Track(
    //Visual
    new Shape([
        new GeneralPath([
            new Point(50, 100),
            new Arc(new Point(130, 250), 80, Math.PI, Math.PI/2, true),
            new Arc(new Point(370, 250), 80, Math.PI/2, 0, true),
            new Arc(new Point(370, 100), 80, 0, Math.PI, true),
            new Arc(new Point(250, 100), 40, 0, Math.PI, false),
            new Arc(new Point(130, 100), 80, 0, Math.PI, true)
        ], "khaki", ),
        new GeneralPath([
            new Point(90, 100),
            new Arc(new Point(130, 250), 40, Math.PI, Math.PI/2, true),
            new Arc(new Point(370, 250), 40, Math.PI/2, 0, true),
            new Arc(new Point(370, 100), 40, 0, Math.PI, true),
            new Arc(new Point(250, 100), 80, 0, Math.PI, false),
            new Arc(new Point(130, 100), 40, 0, Math.PI, true)
        ], "green"),
        new GeneralPath([
            new Point(110, 100),
            new Arc(new Point(130, 250), 20, Math.PI, Math.PI/2, true),
            new Arc(new Point(370, 250), 20, Math.PI/2, 0, true),
            new Arc(new Point(370, 100), 20, 0, Math.PI, true),
            new Arc(new Point(250, 100), 100, 0, Math.PI, false),
            new Arc(new Point(130, 100), 20, 0, Math.PI, true)
        ], "maroon"),
        new GeneralPath([
            new Point(240, 290),
            new Point(260, 290),
            new Point(260, 330),
            new Point(240, 330),
            new Point(240, 290)
        ], "orange"),
        new GeneralPath([
            new Point(247, 20),
            new Point(253, 20),
            new Point(253, 95),
            new Point(247, 95),
            new Point(247, 20)
        ], "maroon"),
        // White background for finish line
        new GeneralPath([
            new Point(451, 235.5),
            new Point(451, 238.5),
            new Point(411, 238.5),
            new Point(411, 235.5),
            new Point(451, 235.5)
        ], "white", null, 0),
        // Black checkered pattern
        new GeneralPath([
            // Middle line
            new Point(451, 237),
            new Point(409, 237),
            //Zig-zag lines
            new Point(409, 238.5),
            new Point(410.5, 238.5),
            new Point(410.5, 235.5),
            new Point(412, 235.5),
            new Point(412, 238.5),
            new Point(413.5, 238.5),
            new Point(413.5, 235.5),
            new Point(415, 235.5),
            new Point(415, 238.5),
            new Point(416.5, 238.5),
            new Point(416.5, 235.5),
            new Point(418, 235.5),
            new Point(418, 238.5),
            new Point(419.5, 238.5),
            new Point(419.5, 235.5),
            new Point(421, 235.5),
            new Point(421, 238.5),
            new Point(422.5, 238.5),
            new Point(422.5, 235.5),
            new Point(424, 235.5),
            new Point(424, 238.5),
            new Point(425.5, 238.5),
            new Point(425.5, 235.5),
            new Point(427, 235.5),
            new Point(427, 238.5),
            new Point(428.5, 238.5),
            new Point(428.5, 235.5),
            new Point(430, 235.5),
            new Point(430, 238.5),
            new Point(431.5, 238.5),
            new Point(431.5, 235.5),
            new Point(433, 235.5),
            new Point(433, 238.5),
            new Point(434.5, 238.5),
            new Point(434.5, 235.5),
            new Point(436, 235.5),
            new Point(436, 238.5),
            new Point(437.5, 238.5),
            new Point(437.5, 235.5),
            new Point(439, 235.5),
            new Point(439, 238.5),
            new Point(440.5, 238.5),
            new Point(440.5, 235.5),
            new Point(442, 235.5),
            new Point(442, 238.5),
            new Point(443.5, 238.5),
            new Point(443.5, 235.5),
            new Point(445, 235.5),
            new Point(445, 238.5),
            new Point(446.5, 238.5),
            new Point(446.5, 235.5),
            new Point(448, 235.5),
            new Point(448, 238.5),
            new Point(449.5, 238.5),
            new Point(449.5, 235.5),
            new Point(451, 235.5),
            new Point(451, 238.5)
        ], "black", null, 0)
    ]), "green", 6,//background color, scale
    //Offroad
    new Shape([
        new GeneralPath([
            new Point(90, 100),
            new Arc(new Point(130, 250), 40, Math.PI, Math.PI/2, true),
            new Arc(new Point(370, 250), 40, Math.PI/2, 0, true),
            new Arc(new Point(370, 100), 40, 0, Math.PI, true),
            new Arc(new Point(250, 100), 80, 0, Math.PI, false),
            new Arc(new Point(130, 100), 40, 0, Math.PI, true)
        ]),
        new Arc(new Point(250, 100), 40),
        new GeneralPath([
            new Point(50, 100),
            new Arc(new Point(130, 250), 80, Math.PI, Math.PI/2, true),
            new Arc(new Point(370, 250), 80, Math.PI/2, 0, true),
            new Arc(new Point(370, 100), 80, 0, Math.PI, true),
            new Arc(new Point(250, 100), 40, 0, Math.PI, false),
            new Arc(new Point(130, 100), 80, 0, Math.PI, true),
            new Point(0, 100),
            new Point(0, 0),
            new Point(500, 0),
            new Point(500, 500),
            new Point(0, 500),
            new Point(0, 100),
            new Point(50, 100)
        ], "rgba(0, 0, 0, 0.5)")
    ]),
    //walls
    new Shape([
        new GeneralPath([
            new Point(110, 100),
            new Arc(new Point(130, 250), 20, Math.PI, Math.PI/2, true),
            new Arc(new Point(370, 250), 20, Math.PI/2, 0, true),
            new Arc(new Point(370, 100), 20, 0, Math.PI, true),
            new Arc(new Point(250, 100), 100, 0, Math.PI, false),
            new Arc(new Point(130, 100), 20, 0, Math.PI, true)
        ]),
        new GeneralPath([
            new Point(247, 20),
            new Point(253, 20),
            new Point(253, 95),
            new Point(247, 95),
            new Point(247, 20)
        ])
    ]),
    //Boost panels
    new Shape([
        new GeneralPath([
            new Point(240, 290),
            new Point(260, 290),
            new Point(260, 330),
            new Point(240, 330),
            new Point(240, 290)
        ])
    ]),
    // Slippery road
    new Shape(),
    // Path
    new GeneralPath([
        new Point(50, 100),
        new Arc(new Point(130, 250), 60, Math.PI, Math.PI/2, true),
        new Arc(new Point(370, 250), 60, Math.PI/2, 0, true),
        new Arc(new Point(370, 100), 60, 0, Math.PI, true),
        new Arc(new Point(250, 100), 60, 0, Math.PI, false),
        new Arc(new Point(130, 100), 60, 0, Math.PI, true)
    ]),
    // laps
    3,
    // checkpoints
    [
        new GeneralPath([
            new Point(370, 235.5),
            new Point(370, 238.5),
            new Point(500, 238.5),
            new Point(500, 235.5),
            new Point(370, 235.5)
        ]),
        new GeneralPath([
            new Point(370, 238.5),
            new Point(500, 238.5),
            new Point(500, 500),
            new Point(370, 500),
            new Point(370, 238.5)
        ]),
        new GeneralPath([
            new Point(370, 238.5),
            new Point(370, 500),
            new Point(130, 500),
            new Point(130, 238.5),
            new Point(370, 238.5)
        ]),
        new GeneralPath([
            new Point(130, 250),
            new Point(130, 500),
            new Point(0, 500),
            new Point(0, 250),
            new Point(130, 250)
        ]),
        new GeneralPath([
            new Point(130, 250),
            new Point(0, 250),
            new Point(0, 100),
            new Point(130, 100),
            new Point(130, 250)
        ]),
        new GeneralPath([
            new Point(0, 0),
            new Point(0, 100),
            new Point(130, 100),
            new Point(130, 0),
            new Point(0, 0)
        ]),
        new GeneralPath([
            new Point(130, 0),
            new Point(130, 200),
            new Point(370, 200),
            new Point(370, 0),
            new Point(130, 0)
        ]),
        new GeneralPath([
            new Point(370, 0),
            new Point(370, 200),
            new Point(500, 200),
            new Point(500, 0),
            new Point(370, 0)
        ]),
        new GeneralPath([
            new Point(500, 200),
            new Point(500, 235.5),
            new Point(370, 235.5),
            new Point(370, 200),
            new Point(500, 200)
        ])
    ],
    // Item boxes
    [
        new ItemBox(new Point(56, 175)), // item box 1 on straight 1
        new ItemBox(new Point(63, 175)), // item box 2 on straight 1
        new ItemBox(new Point(70, 175)), // item box 3 on straight 1
        new ItemBox(new Point(77, 175)), // item box 4 on straight 1
        new ItemBox(new Point(84, 175)), // item box 5 on straight 1
        new ItemBox(new Point(416, 100)), // item box 1 on straight 2
        new ItemBox(new Point(423, 100)), // item box 2 on straight 2
        new ItemBox(new Point(430, 100)), // item box 3 on straight 2
        new ItemBox(new Point(437, 100)), // item box 4 on straight 2
        new ItemBox(new Point(444, 100)), // item box 5 on straight 2
        new ItemBox(new Point(236, 296)), // item box 1 on straight 3
        new ItemBox(new Point(236, 303)), // item box 2 on straight 3
        new ItemBox(new Point(236, 310)), // item box 3 on straight 3
        new ItemBox(new Point(236, 317)), // item box 4 on straight 3
        new ItemBox(new Point(236, 324)), // item box 5 on straight 3
        new ItemBox(new Point(252.5, 100))  // item box next to crystal in offroad
    ],
    // Other items (nitro crystals, etc)
    [
        new Item("nitroCrystal", new Point(80, 300), null, null, 0), // Crystal on first curve outer edge (45° to 130,250)
        new Item("nitroCrystal", new Point(420, 50), null, null, 0), // Crystal on right curve outer edge (45° to 370,100)
        new Item("nitroCrystal", new Point(420, 300), null, null, 0), // Crystal on bottom right outer edge (45° to 370,250)
        new Item("nitroCrystal", new Point(250, 175), null, null, 0), // Crystal on top curve outer edge
        new Item("nitroCrystal", new Point(80, 50), null, null, 0),  // Crystal on left curve outer edge (45° to 130,100)
        new Item("nitroCrystal", new Point(247.5, 100), null, null, 0),  // Crystal next to item box in offroad
        new Item("nitroCrystal", new Point(0, 0), null, null, 0)
    ],
    [
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(441, 225), Math.PI/2, true),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(431, 220), Math.PI/2, false),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(421, 215), Math.PI/2, false),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(441, 210), Math.PI/2, false),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(431, 205), Math.PI/2, false),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(421, 200), Math.PI/2, false),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(441, 195), Math.PI/2, false),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(431, 190), Math.PI/2, false),
        new Racer(10, -5, 0.04, 0.1, 30, 20, new Shape(), new Point(421, 185), Math.PI/2, false), 
    ]
));