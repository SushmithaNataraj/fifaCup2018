/**
 * Loads in the table information from fifa-matches-2018.json
 */
d3.json('data/fifa-matches-2018.json').then( data => {

    /**
     * Loads in the tree information from fifa-tree-2018.csv and calls createTree(csvData) to render the tree.
     *
     */
    d3.csv("data/fifa-tree-2018.csv").then(csvData => {

        //Create a unique "id" field for each game
        //csvData.forEach( (d, i) => {
        //    d.id = d.Team + d.Opponent + i;
        //});

        //Create Tree Object
        //let tree = new Tree();
        //tree.createTree(csvData);

        //Create Table Object and pass in reference to tree object (for hover linking)

        //let table = new Table(data,tree);

        //table.createTable();
        //table.updateTable();
    });
});



// // ********************** HACKER VERSION ***************************
/**
 * Loads in fifa-matches-2018.csv file, aggregates the data into the correct format,
 * then calls the appropriate functions to create and populate the table.
 *
 */

d3.csv("data/fifa-matches-2018.csv").then( matchesCSV => {

    let ranks = {
        "Winner": 7,
        "Runner-Up": 6,
        "Third Place": 5,
        "Fourth Place": 4,
        "Semi Finals": 3,
        "Quarter Finals": 2,
        "Round of Sixteen": 1,
        "Group": 0
    };

    let ranks_order = function(d){
        for(let r in ranks) {
            if (ranks[r] == d) return r;
        }
    };

    /**
     * Loads in the tree information from fifa-tree-2018.csv and calls createTree(csvData) to render the tree.
     *
     */

    let teamData = d3.nest()
        .key(d => d.Team)
        .rollup(leaves => {
            let hacker_obj = new Object;
            let rankIndex = d3.max(leaves, d=>ranks[d.Result]);
            hacker_obj["Goals Made"] = d3.sum(leaves, function(l){ return l["Goals Made"]; });
            hacker_obj["Goals Conceded"] = d3.sum(leaves, function(l){ return l["Goals Conceded"]; });
            hacker_obj["Delta Goals"] = hacker_obj["Goals Made"] - hacker_obj["Goals Conceded"];
            hacker_obj.Wins = d3.sum(leaves, function(l){ return l.Wins; });
            hacker_obj.Losses = d3.sum(leaves, function(l){ return l.Losses; });
            hacker_obj.Result = {"label": ranks_order(rankIndex), "ranking": rankIndex};
            hacker_obj.TotalGames = leaves.length;
            hacker_obj.type = "aggregate";
            let games = [], ct = 0;
            for (let i of leaves) {
                let game = {};
                game.key = i.Opponent;
                game.value = {
                    "Delta Goals": [],
                    "Goals Conceded": i["Goals Conceded"],
                    "Goals Made": i["Goals Made"],
                    "Losses": [],
                    "Opponent": i.Team,
                    "Wins": [],
                    "Result": {"label": i.Result, "ranking": ranks[i.Result]},
                    "type": "game",
                };
                games[ct++] = game;
            }
            hacker_obj.games = games;
            hacker_obj.games.sort(function(x, y){
                return d3.descending(x.value.Result.ranking, y.value.Result.ranking);
            });
            return hacker_obj;
        })
        .entries(matchesCSV);

    //console.log(teamData);
    d3.csv("data/fifa-tree-2018.csv").then( treeCSV => {

        // ******* TODO: PART I *******
        //Create a unique "id" field for each game
        treeCSV.forEach( (d, i) => {
            d.id = d.Team + d.Opponent + i;
        });
        //Create Tree Object
        let tree = new Tree();
        tree.createTree(treeCSV);

        //Create Table Object and pass in reference to tree object (for hover linking)
        let table = new Table(teamData,tree);
        table.createTable();
        table.updateTable();
    });
});
// ********************** END HACKER VERSION ***************************