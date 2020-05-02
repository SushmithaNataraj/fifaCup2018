/** Class implementing the tree view. */
class Tree {
    /**
     * Creates a Tree Object
     */
    constructor() {

    }

    /**
     * Creates a node/edge structure and renders a tree layout based on the input data
     *
     * @param treeData an array of objects that contain parent/child information.
     */
    createTree(treeData) {

        // ******* TODO: PART VI *******


        //Create a tree and give it a size() of 800 by 300.
        this.treeData = treeData;
        let height = 800;
        let width = 300;

        let treeMap = d3.tree().size([height, width]);

        //Create a root for the tree using d3.stratify();
        treeData.forEach(function(d){
            d.name = d.id;
        });

        let stratify = d3.stratify()
            .id(d => d.id)
            .parentId(d => {
                if (treeData[d.ParentGame] === undefined) {
                    return null;
                }
                return treeData[d.ParentGame].id;
            })(treeData);

        let root = d3.hierarchy(stratify, d => d.children);

        update(root);

        //Add nodes and links to the tree.
        function update(source) {

            // Assigns the x and y position for the nodes
            let treeData = treeMap(root);

            // Compute the new tree layout.
            let nodes = treeData.descendants(),
                links = treeData.descendants().slice(1);

            // Normalize for fixed-depth.
            nodes.forEach(function(d){ d.y = d.depth * 80 + 80; });

            // ****************** Nodes section ***************************

            // Update the nodes...
            let node = d3.select('#tree').selectAll('g.node')
                .data(nodes, d => d.id);

            // Enter any new modes at the parent's previous position.
            let node_enter
                = node.enter().append('g')
                .attr('class', function(d){
                    return d.data.data.Wins === "1" ? "winner" : "loser";
                })
                .classed('node', true)
                .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

            // Add Circle for the nodes
            node_enter
                .append('circle').attr('r', 5);

            // Add labels for the nodes
            node_enter
                .append('text')
                .attr("dy", ".35em")
                .attr("x", d => d.children || d._children ? -13 : 13)
                .attr("text-anchor", d => d.children || d._children ? "end" : "start")
                .text(d => d.data.data.Team)
                .attr("class", function(d){
                    return d.data.data.Team + d.data.data.Opponent;
                });

            // UPDATE
            let node_update = node_enter.merge(node);

            // Transition to the proper position for the node
            node_update.transition()
                .attr("transform", d => "translate(" + d.y + "," + d.x + ")");

            // Update the node attributes and style
            node_update.select('circle.node')
                .attr('r', 10);

            // ****************** links section ***************************

            // Update the links...
            let link = d3.select("#tree").selectAll('path.link')
                .data(links, d => d.id);

            // Enter any new links at the parent's previous position.
            let link_enter = link.enter().insert('path', "g")
                .attr("class", function (d) {
                    return d.data.data.Team + d.data.data.Opponent;
                })
                .classed("link", true);

            // UPDATE
            let link_update = link_enter.merge(link);

            // Transition back to the parent element position
            link_update.transition()
                .attr('d', function (d) {
                    return diag(d, d.parent)
                });
        }

        function diag(s, d) {
            let path = `M ${s.y} ${s.x}
            C ${(s.y + d.y) / 2} ${s.x},
            ${(s.y + d.y) / 2} ${d.x},
            ${d.y} ${d.x}`;
            return path;
        }
    }

    /**
     * Updates the highlighting in the tree based on the selected team.
     * Highlights the appropriate team nodes and labels.
     *
     * @param row a string specifying which team was selected in the table.
     */
    updateTree(row) {
        // ******* TODO: PART VII *******
        this.clearTree();
        let team_selected = row.key, opponent_team = row.value.Opponent;
        if(row.value.type === "game"){
            d3.selectAll("path."+(team_selected+opponent_team)).classed("selected", true);
            d3.selectAll("path."+(opponent_team+team_selected)).classed("selected", true);
            d3.select(".node text."+(team_selected+opponent_team)).classed("selectedLabel", true);
            d3.select(".node text."+(opponent_team+team_selected)).classed("selectedLabel", true);
        } else {
            this.treeData.forEach(function(d){
                if(d.Team === team_selected){
                    if(d.Wins === "1"){
                        d3.selectAll("path."+(team_selected+d.Opponent)).classed("selected", true);
                    }
                    d3.select(".node text."+(team_selected+d.Opponent)).classed("selectedLabel", true);
                }
            })
        }
    }

    /**
     * Removes all highlighting from the tree.
     */
    clearTree() {
        // ******* TODO: PART VII *******

        // You only need two lines of code for this! No loops!
        d3.selectAll(".link").classed("selected", false);
        d3.selectAll(".node text").classed("selectedLabel", false);
    }
}
