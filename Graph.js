"use strict";

function Graph() 
{
	this.nodes = [];
	this.indexSearch = 0;

	this._uniqueID = 0;
	
	this.openListSize = 8;
	this.openList = new Array(this._openListSize);
	this.numOpen = 0;
};

Graph.prototype = 
{
	add: function(x, y, cost) {
		cost = cost || 1;
		var node = new this.Node(this._uniqueID++, x, y, cost);
		this.nodes.push(node);
	},

	link: function(fromIndex, toIndex, cost) 
	{
		cost = cost || 1;

		var from = this.nodeFromIndex(fromIndex);
		var to = this.nodeFromIndex(toIndex);

		from.links.push(new this.Link(from, to, cost));
		to.links.push(new this.Link(to, from, cost));
	},

	search: function(startNode, endNode, heuristic)
	{
		if(!startNode || !endNode) {
			console.error("[Graph.search]:", "An invalid node has been passed.");
			return;
		}

		// Select the heuristic function:
		if(!heuristic) {
			this.heuristicFunc = this.Heuristic.manhattan;
		}
		else 
		{
			this.heuristicFunc = this.Heuristic[heuristic];
			if(!this.heuristicFunc) {
				this.heuristicFunc = this.Heuristic.manhattan;
				console.warn("[Graph.search]:", "Invalid heuristic function passed, falling back to \"manhattan\" heuristic function.");
			}
		}

		var i, node, parentNode, link, links, numLinks;
		this.indexSearch++;
		this.numOpen = 1;
		this.openList[0] = startNode;
		startNode.indexSearch = this.indexSearch;
		startNode.parent = null;
		startNode.depth = 1;

		while(this.numOpen > 0)
		{
			parentNode = this.openList[--this.numOpen];
			links = parentNode.links;
			numLinks = links.length;

			// Resize buffer if needed:
			if(this.numOpenNodes + numLinks >= this.openListSize) {
				this.openListSize += numLinks;
				this.openList.length = this.openListSize;
			}

			// Add links to the open list:
			for(i = 0; i < numLinks; i++) 
			{
				link = links[i];
				node = link.to;
				
				if(node.indexSearch === this.indexSearch) { continue; } 
				node.indexSearch = this.indexSearch;
				node.parent = parentNode;
				node.depth = parentNode.depth + 1;

				if(node === endNode) {
					return this.genPath(endNode);
				}

				node.g = parentNode.g + this.heuristicFunc(node, endNode) + link.cost;
				this.openList[this.numOpen++] = node;
			}

			this.openList.sort(this._sortFunc);
		}

		return null;
	},

	genPath: function(node)
	{
		if(!node.parent) { return null; }

		var numNodes = node.depth;
		var path = new Array(numNodes);

		for(var i = 0; i < numNodes; i++, node = node.parent) {
			path[i] = node;
		}

		return path;
	},

	searchIndex: function(startIndex, endIndex) {
		var startNode = this.nodeFromIndex(startIndex);
		var endNode = this.nodeFromIndex(endIndex);
		return this.search(startNode, endNode);
	},

	_sortFunc: function(a, b) { 
		return a.g - b.g; 
	},

	nodeFromIndex: function(index)
	{
		var numNodes = this.nodes.length;
		for(var i = 0; i < numNodes; i++) {
			if(this.nodes[i].index === index) {
				return this.nodes[i];
			}
		}

		return null;
	},

	heuristicFunc: null,

	Heuristic: 
	{
		manhattan: function(node, endNode) {
			var dx = Math.abs(node.x - endNode.x);
			var dy = Math.abs(node.y - endNode.y);
			return dx + dy;
		},

		euclidian: function(node, endNode) {
			var dx = node.x - endNode.x;
			var dy = node.y - endNode.y;
			return Math.sqrt(dx * dx + dy * dy);
		}
	},

	//
	Node: function(index, x, y, cost) {
		this.index = index;
		this.indexSearch = 0;
		this.x = x;
		this.y = y;
		this.g = 0;
		this.links = [];
		this.parent = null;
	},

	Link: function(from, to, cost) {
		this.from = from;
		this.to = to;
		this.cost = cost;
	}
};

