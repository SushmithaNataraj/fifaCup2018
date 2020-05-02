/** Class implementing the table. */
class Table {
    /**
     * Creates a Table Object
     */
    constructor(teamData, treeObject) {

        // Maintain reference to the tree object
        this.tree = treeObject;

        /**List of all elements that will populate the table.*/
        // Initially, the tableElements will be identical to the teamData
        this.tableElements = teamData.slice();

        ///** Store all match data for the 2018 Fifa cup */
        this.teamData = teamData;

        this.tableHeaders = ["Delta Goals", "Result", "Wins", "Losses", "TotalGames"];

        /** letiables to be used when sizing the svgs in the table cells.*/
        this.cell = {
            "width": 70,
            "height": 20,
            "buffer": 15
        };

        this.bar = {
            "height": 20
        };

        /** Set variables for commonly accessed data columns*/
        this.goalsMadeHeader = 'Goals Made';
        this.goalsConcededHeader = 'Goals Conceded';

        /** Setup the scales*/
        this.goalScale = null;


        /** Used for games/wins/losses*/
        this.gameScale = null;

        /**Color scales*/
        /**For aggregate columns*/
        /** Use colors '#feebe2' and '#690000' for the range*/
        this.aggregateColorScale = null;
        /**For goal Column*/
        /** Use colors '#cb181d' and '#034e7b' for the range */
        this.goalColorScale = null;

        this.teamFlag = true;
        this.goalFlag = false;
        this.resultFlag = false;
        this.winFlag = false;
        this.lossFlag = false;
        this.totalGamesFlag = false;
    }


    /**
     * Creates a table skeleton including headers that when clicked allow you to sort the table by the chosen attribute.
     * Also calculates aggregate values of goals, wins, losses and total games as a function of country.
     *
     */
    createTable() {

        // ******* TODO: PART II *******

        //Update Scale Domains
        let that = this;
        let max_goal = 0, max_game = 0;
        this.teamData.forEach(team => {
            let init_goal = 0;
            let init_game = team.value["TotalGames"];
            if (team.value[that.goalsMadeHeader] > team.value[that.goalsConcededHeader]) {
                init_goal = team.value[that.goalsMadeHeader];
            } else {
                init_goal = team.value[that.goalsConcededHeader];
            }
            if (init_goal > max_goal) {
                max_goal = init_goal;
            }
            if (init_game > max_game) {
                max_game = init_game;
            }
        });

        // Create the axes
        this.goalScale = d3.scaleLinear().domain([0, max_goal])
            .range([this.cell.buffer, 2 * this.cell.width]);

        this.gameScale = d3.scaleLinear()
            .domain([0, max_game]).range([this.cell.buffer, this.cell.width - this.cell.buffer]);

        this.aggregateColorScale = d3.scaleLinear().domain([0, max_game])
            .range(["#feebe2","#690000"]);

        this.goalColorScale = d3.scaleLinear().domain([0, max_goal])
            .range(["#cb181d","#034e7b"]);

        //add GoalAxis to header of col 1.
        let init_axis = d3.axisBottom().scale(this.goalScale);
        let init_axisGroup = d3.select("#goalHeader").append("svg")
            .attr("height", this.cell.height).attr("width", 2 * (this.cell.width + this.cell.buffer))
            .call(init_axis)
            .attr("transform", "scale(1, -1)");

        init_axisGroup.selectAll("text")
            .style("text-anchor", "end")
            .attr("dx", "0.3em").attr("dy", "0.35em")
            .attr("transform", "scale(1, -1) translate(0, -20)");

        // ******* TODO: PART V *******

        // Set sorting callback for clicking on headers


        //Set sorting callback for clicking on Team header
        //Clicking on headers should also trigger collapseList() and updateTable().
        d3.select("#team").on("click", function(){ that.sort_team(); });
        d3.select("#goals").on("click", function(){ that.sort_goals(); });
        d3.select("#result").on("click", function(){ that.sort_results(); });
        d3.select("#wins").on("click", function(){ that.sort_wins(); });
        d3.select("#losses").on("click", function(){ that.sort_losses(); });
        d3.select("#totalGames").on("click", function(){ that.sort_total_games(); });
    }
    sort_team(){
        let that = this;
        that.teamData.sort(function(a, b){
            if(that.teamFlag){return d3.ascending(a.key, b.key);}
            return d3.descending(a.key, b.key);
        });
        that.teamFlag = !that.teamFlag;
        that.collapseList();
    }
    sort_goals(){
        let that = this;
        that.teamData.sort(function(a, b){
            if(that.goalFlag) {return d3.ascending(a.value["Delta Goals"], b.value["Delta Goals"]);}
            return d3.descending(a.value["Delta Goals"], b.value["Delta Goals"]);
        });
        that.goalFlag = !that.goalFlag;
        that.collapseList();
    }
    sort_results(){
        let that = this;
        that.teamData.sort(function(a, b){
            if(that.resultFlag) return d3.ascending(a.value.Result.ranking, b.value.Result.ranking);
            return d3.descending(a.value.Result.ranking, b.value.Result.ranking);
        });
        that.resultFlag = !that.resultFlag;
        that.collapseList();
    }
    sort_wins(){
        let that = this;
        that.teamData.sort(function(a, b){
            if(that.winFlag) return d3.ascending(a.value.Wins, b.value.Wins);
            return d3.descending(a.value.Wins, b.value.Wins);
        });
        that.winFlag = !that.winFlag;
        that.collapseList();
    }
    sort_losses(){
        let that = this;
        that.teamData.sort(function(a, b){
            if(that.lossFlag) return d3.ascending(a.value.Losses, b.value.Losses);
            return d3.descending(a.value.Losses, b.value.Losses);
        });
        that.lossFlag = !that.lossFlag;
        that.collapseList();
    }
    sort_total_games(){
        let that = this;
        that.teamData.sort(function(a, b){
            if(that.totalGamesFlag)
                return d3.ascending(a.value.TotalGames, b.value.TotalGames);
            return d3.descending(a.value.TotalGames, b.value.TotalGames);
        });
        that.totalGamesFlag = !that.totalGamesFlag;
        that.collapseList();
    }
    /**
     * Updates the table contents with a row for each element in the global variable tableElements.
     */
    updateTable() {
        // ******* TODO: PART III *******
        //Create table rows
        let that = this;
        let table = d3.select("#matchTable").select("tbody").selectAll("tr").data(this.tableElements);
        let table_enter = table.enter().append("tr");
        table.exit().remove();
        table = table_enter.merge(table);
        table.on("mouseover", d => that.tree.updateTree(d));
        table.on("mouseout", d => that.tree.clearTree());

        //Append th elements for the Team Names
        let th = table.selectAll("th").data((d, i) => [{name:d.key, type: d.value.type, index: i}]);
        let th_val = th.enter().append("th");
        th.exit().remove();
        th = th_val.merge(th);

        th.text(d => { return d.type === "game" ? "x"+d.name : d.name; }).attr("class", d => { return d.type === "game" ? "game" : "aggregate"; })
            .on("click", d => that.updateList(d.index));

        //Append td elements for the remaining columns.
        //Data for each cell is of the type: {'type':<'game' or 'aggregate'>, 'vis' :<'bar', 'goals', or 'text'>, 'value':<[array of 1 or two elements]>}
        let td = table.selectAll("td")
            .data(d => [
                {type: d.value.type, vis: "goals", value: {goalsMade: d.value[that.goalsMadeHeader], goalsConceded: d.value[that.goalsConcededHeader], deltaGoals: d.value[that.goalsMadeHeader] - d.value[that.goalsConcededHeader]}},
                {type: d.value.type, vis: "text", value: d.value.Result.label},
                {type: d.value.type, vis: "bar", value: d.value.Wins},
                {type: d.value.type, vis: "bar", value: d.value.Losses},
                {type: d.value.type, vis: "bar", value: d.value.TotalGames}
            ]);
        let td_val = td.enter().append("td");
        td.exit().remove();
        td = td_val.merge(td);

        //Add scores as title property to appear on hover

        //Populate cells (do one type of cell at a time )
        //do it column by column
        let svg = td.filter(function(d){ return d.vis == "goals"; });
        let svg_grp = svg.selectAll("svg").data(function(d){
            return d3.select(this).data();
        });
        let svg_grpEnter = svg_grp.enter().append("svg");
        svg_grp.exit().remove();
        svg_grp = svg_grpEnter.merge(svg_grp);
        svg_grp.attr("height", this.cell.height)
            .attr("width", 2 * this.cell.width + this.cell.buffer);

        let score_grp = svg_grp.selectAll("g").data(function(d){
            return d3.select(this).data();
        });
        let score_grpEnter = score_grp.enter().append("g");
        score_grp.exit().remove();
        score_grp = score_grpEnter.merge(score_grp);

        let score_bars = score_grp.selectAll("rect").data(function(d){
            return d3.select(this).data();
        });
        let score_barsEnter = score_bars.enter().append("rect");
        score_bars.exit().remove();
        score_bars = score_barsEnter.merge(score_bars);
        score_bars.attr("x", d => {
            let retVal = d.value.goalsMade > d.value.goalsConceded ? that.goalScale(d.value.goalsConceded) : that.goalScale(d.value.goalsMade);
            if (d.type === "game") {
                return retVal;
            }
            return retVal;
        })
            .attr("y", d => { return d.type === "game" ? 8 : 5; })
            .attr("height", d => { return d.type === "game" ? 4: 10; }).attr("width", d => {
            if (d.value.deltaGoals === 0) {
                return 0;
            }
            let width = that.goalScale(Math.abs(d.value.deltaGoals))- that.cell.buffer;
            if (d.type === "game") {
                return width > 10 ? width-10 : 0;
            }
            return Math.abs(width);
        })
            .classed("goalBar", true)
            .style("fill", d => { return d.value.deltaGoals > 0 ? "#364e74" : "#be2714"; });

        //Create diagrams in the goals column

        //Set the color of all games that tied to light gray

        let score_circle_win = score_grp.selectAll("circle").data(function(d){
            return d3.select(this).data();
        });
        let score_circle_winEnter = score_circle_win.enter().append("circle");
        score_circle_win.exit().remove();
        score_circle_win = score_circle_winEnter.merge(score_circle_win);
        score_circle_win.attr("cx", d => { return this.goalScale(d.value.goalsMade)-5; })
            .attr("cy", 10)
            .classed("goalCircle", true)
            .style("fill", d => {return d.type === "game" ? "none" : "#364e74"; })
            .style("stroke", "#364e74");

        let score_circle_loss = score_grp.selectAll("circles").data(function(d){
            return d3.select(this).data();
        });
        let score_circle_lossEnter = score_circle_loss.enter().append("circle");
        score_circle_loss.exit().remove();
        score_circle_loss = score_circle_lossEnter.merge(score_circle_loss);
        score_circle_loss.attr("cx", d => { return this.goalScale(d.value.goalsConceded)-5; })
            .attr("cy", 10)
            .classed("goalCircle", true)
            .style("fill", d => {
                if (d.type === "game") {
                    return "none";
                }
                if (d.value.deltaGoals == 0) {
                    return "grey";
                }
                return "#be2714";
            })
            .style("stroke", d => {
                if (d.value.deltaGoals == 0) {
                    return "grey";
                }
                return "#be2714";
            });
        //mouse events
        score_grp.on("mouseover", function(d){
            d3.select(this).append("title").text("Goals Scored: " + d.value.goalsMade+" Goals Conceded: " + d.value.goalsConceded);
        });

        score_grp.on("mouseout", function(d){
            d3.select(this).selectAll("title").remove();
        });

        let rslt = td.filter(d => { return d.vis == 'text'; });
        let rsltSvg = rslt.selectAll("svg").data(function(d){
            return d3.select(this).data();
        });
        let rsltEnter = rsltSvg.enter().append("svg");
        rsltSvg.exit().remove();
        rsltSvg = rsltEnter.merge(rsltSvg);
        rsltSvg.attr("width", 2 * this.cell.width)
            .attr("height", this.cell.height);

        let rsltText = rsltSvg.selectAll("text").data(function(d){
            return d3.select(this).data();
        });
        let rsltTextEnter = rsltText.enter().append("text");
        rsltText.exit().remove();
        rsltText = rsltTextEnter.merge(rsltText);
        rsltText.attr("y", 15).text(d => d.value);


        let game = td.filter(d => {return d.vis == 'bar'; });
        let game_svg = game.selectAll("svg").data(function(d){
            return d3.select(this).data();
        });
        let game_svgEnter = game_svg.enter().append("svg");
        game_svg.exit().remove();
        game_svg = game_svgEnter.merge(game_svg);
        game_svg.attr("width", this.cell.width).attr("height", this.cell.height)
            .attr("transform", "translate(-5, 0)");

        let game_grp = game_svg.selectAll("g").data(function(d){
            return d3.select(this).data();
        });
        let game_grpEnter = game_grp.enter().append("g");
        game_grp.exit().remove();
        game_grp = game_grpEnter.merge(game_grp);

        let gameBars = game_grp.selectAll("rect").data(function(d){
            return d3.select(this).data();
        });
        let gameBarsEnter = gameBars.enter().append("rect");
        gameBars.exit().remove();
        gameBars = gameBarsEnter.merge(gameBars);
        gameBars.attr("x", 5)
            .attr("y", 5)
            .attr("height", 20).attr("width", d => {
            if (d.type === "game"){
                return 0;
            }
            return this.gameScale(d.value);
        }).style("fill", d => { return this.aggregateColorScale(d.value); });

        let gameText = game_grp.selectAll("text").data(function(d){
            return d3.select(this).data();
        });
        let gameTextEnter = gameText.enter().append("text");
        gameText.exit().remove();
        gameText = gameTextEnter.merge(gameText);
        gameText.attr("x", d => {
            if (d.type === "game") {
                return;
            }
            return this.gameScale(d.value)-10;
        })
            .attr("y", 17)
            .text(d => {return d.type === "game" ? "": d.value; }).style("fill", "white");

    };
    /**
     * Updates the global tableElements variable, with a row for each row to be rendered in the table.
     *
     */
    updateList(i) {
        // ******* TODO: PART IV *******

        //Only update list for aggregate clicks, not game clicks
        let team_selected = this.tableElements[i];
        //console.log(team_selected);
        if(team_selected.value.type === "game"){
            return;
        }
        let games_array = team_selected.value.games;
        let nxt_select = this.tableElements[i+1];
        let teamData = this.tableElements.slice();
        this.tableElements = [];
        if(nxt_select!==undefined && nxt_select.value.type === "game"){
            Array.prototype.push.apply(this.tableElements, teamData.slice(0, i+1));
            Array.prototype.push.apply(this.tableElements, teamData.slice(i + (games_array.length+1)));
        } else {
            Array.prototype.push.apply(this.tableElements, teamData.slice(0, i+1));
            Array.prototype.push.apply(this.tableElements, games_array);
            Array.prototype.push.apply(this.tableElements, teamData.slice(i+1));
        }
        this.updateTable();
    }

    /**
     * Collapses all expanded countries, leaving only rows for aggregate values per country.
     *
     */
    collapseList() {
        // ******* TODO: PART IV *******
        this.tableElements = this.teamData;

        this.updateTable();
    }
}