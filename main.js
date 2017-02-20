$(document).ready(function(){
	var mygrid=new Mygrid();
	mygrid.init();
});
var Mygrid=function(){
	this.clicks=0;
	this.score=0;
	this.grid=new Array();
	this.pre=new Array();
	this.path=[];
	this.nexts=[];
	this.src=""; //选中小球坐标
	this.dst=""; //选中小球目标坐标
}
Mygrid.prototype={
	init:function(){
		var _this=this;
		var grid=_this.grid;
		for(var i=0;i<9;i++){
			grid[i]=new Array();
			for(var j=0;j<9;j++){
				grid[i][j]=0;
				var txt=i+""+j;
				var cell="<div class='cell' id="+txt+"></div>";
				$('#inner').append(cell);
			}
		}
		_this.generateNewBalls();
		$('.cell').click(function(){
			var id=$(this).attr('id');
			_this.clickFunc(id);
		});
	},
	generateNewBalls:function(){
		// 3 random colors in 7
		var _this=this;
		var clrs=new Array();
		var poss=new Array();
		var row,col;
		for(var i=0;i<3;i++){
			clrs[i]=Math.floor(Math.random()*7)+1;
		}
		// 3 random positions,none overlap
		do{
			row=Math.floor(Math.random()*9);
			col=Math.floor(Math.random()*9);
			poss[0]=row+""+col;
		}while(_this.grid[row][col]!=0)
		_this.grid[row][col]=clrs[0];

		do{
			row=Math.floor(Math.random()*9);
			col=Math.floor(Math.random()*9);
			poss[1]=row+""+col;
		}while(poss[1]==poss[0]||_this.grid[row][col]!=0)
		_this.grid[row][col]=clrs[1];

		do{
			row=Math.floor(Math.random()*9);
			col=Math.floor(Math.random()*9);
			poss[2]=row+""+col;
		}while(poss[2]==poss[1]||poss[2]==poss[1]||_this.grid[row][col]!=0)
		_this.grid[row][col]=clrs[2];
		for(var i=0;i<3;i++)
			_this.nexts[i+1]=poss[i];
		_this.showGrid();
	},
	clickFunc:function(id){
		var _this=this;
		//console.log(id);
		var row=Math.floor(id/10);
		var col=id%10;
		if(_this.clicks==0){
			if(_this.grid[row][col]!=0){
				_this.clicks++;
				_this.src=id;
				_this.choose(id);
			}
		}else{
			_this.clicks--;
			//if(id==_this.src) 
				this.release(_this.src);
			if(_this.grid[row][col]==0&&_this.checkPath(_this.src,row+""+col)){
				_this.nexts[0]=id;
				_this.dst=id;
				_this.move();
			}
		}
	},	
	choose:function(id){
		var e='#'+id;
		$(e).css("border-color","red");
	},
	release:function(id){
		var e='#'+id;
		$(e).css("border-color","white");
	},
	move:function(){
		var dstrow=Math.floor(parseInt(this.dst)/10);
		var dstcol=parseInt(this.dst)%10;
		var srcrow=Math.floor(parseInt(this.src)/10);
		var srccol=parseInt(this.src)%10;
		var val=this.grid[srcrow][srccol];
		this.release(this.src);
		var i=this.path.length;
		var _this=this;
		var myTime=setInterval(function(){
			i--;
			if(i<0) {
				_this.grid[dstrow][dstcol]=val;
				if(!_this.remove(1)){
					_this.generateNewBalls();
					_this.remove(4);
				}
				_this.showGrid();
				clearInterval(myTime);
				return;
			}
			var row=_this.path[i][0];
			var col=_this.path[i][1];
			_this.grid[row][col]=val;
			_this.showGrid();
			_this.grid[row][col]=0;
			
		},40);
	},
	showGrid:function(){
		for(var i=0;i<9;i++){
			for(var j=0;j<9;j++){
				var id="#"+i+""+j;
				if(this.grid[i][j]!=0){
					var val="./img/"+this.grid[i][j]+".png";
					$(id).html("<img src="+val+" width='60'>");
				}
				else
					$(id).html("");
			}
		}
		$('#score').text(this.score);
	},
	checkPath:function(src,dst){
		var dstrow=Math.floor(parseInt(dst)/10);
		var dstcol=parseInt(dst)%10;
		var srcrow=Math.floor(parseInt(src)/10);
		var srccol=parseInt(src)%10;
		var path=[[dstrow,dstcol]];
		var res=this.search(srcrow,srccol,dstrow,dstcol);
		if(res){
			var i=dstrow,j=dstcol;
			var pre=this.pre;
			while(!(i==srcrow&&j==srccol)){
				path.push(pre[i][j]);
				var cur=pre[i][j];
				i=cur[0];
				j=cur[1];
			}
		}
		this.path=path;
		return res;
	},
	search:function(currow,curcol,dstrow,dstcol){
		var queue=new Array();
		queue.push([currow,curcol]);
		var grid=this.grid;
		var used=new Array();
		for(var i=0;i<9;i++){
			used[i]=new Array();
			this.pre[i]=new Array();
			for(var j=0;j<9;j++){
				used[i][j]=false;
				this.pre[i][j]=[];
			}
		}
		var pre=this.pre;
		while(queue.length>0){
			var cur=queue.shift();
			var currow=cur[0];
			var curcol=cur[1];
			used[currow][curcol]=true;
			var row=[currow-1,currow,currow+1,currow];
			var col=[curcol,curcol-1,curcol,curcol+1];
			for(var k=0;k<4;k++){
				var i=row[k];
				var j=col[k];
				if(i>=0&&i<9&&j>=0&&j<9&&(grid[i][j]==0)&&(used[i][j]==0)){
					pre[i][j]=[currow,curcol];
					if(i==dstrow&&j==dstcol){
						return true;
					}
					else{
						used[i][j]=true;
						queue.push([i,j]);
					} 			
				}
			}
		}
		return false;
	},
	remove:function(flag){
		for(var next=0;next<flag;next++){
			/*var row=Math.floor(parseInt(this.dst)/10);
			var col=parseInt(this.dst)%10;*/
			var row=Math.floor(parseInt(this.nexts[next])/10);
			var col=parseInt(this.nexts[next])%10;
			var cnt=1;
			var val=this.grid[row][col];

			//行消除
			var pl=col-1,pr=col+1;
			while(pl>=0&&this.grid[row][pl]==val){
				cnt++;pl--;
			}
			while(pr<9&&this.grid[row][pr]==val){
				cnt++;pr++;
			}
			if(cnt>=5){
				for(var i=pl+1;i<pr;i++){
					this.grid[row][i]=0;
				}
				this.score+=cnt*10;
				return true;
			}
			//列消除
			cnt=1;
			var pu=row-1;pd=row+1;
			while(pu>=0&&this.grid[pu][col]==val){
				cnt++;pu--;
			}
			while(pd<9&&this.grid[pd][col]==val){
				cnt++;pd++;
			}
			if(cnt>=5){
				for(var i=pu+1;i<pd;i++){
					this.grid[i][col]=0;
				}
				this.score+=cnt*10;
				return true;
			}
			// '\'斜线消除
			cnt=1;
			var prer=row-1,prec=col-1,postr=row+1,postc=col+1;
			while(prer>=0&&prec>=0&&this.grid[prer][prec]==val){
				cnt++;prer--;prec--;
			}
			while(postr<9&&postc<9&&this.grid[postr][postc]==val){
				cnt++;postr++;postc++;
			}
			if(cnt>=5){
				for(var i=prer+1-row;i<postr-row;i++){
					this.grid[row+i][col+i]=0;
				}
				this.score+=cnt*10;
				return true;
			}
			// '/'斜线消除
			cnt=1;
			prer=row+1;prec=col-1;postr=row-1;postc=col+1;
			while(prer<9&&prec>=0&&this.grid[prer][prec]==val){
				cnt++;prer++;prec--;
			}
			while(postr>=0&&postc<9&&this.grid[postr][postc]==val){
				cnt++;postr--;postc++;
			}
			if(cnt>=5){
				for(var i=prer-1-row;i>postr-row;i--)
					this.grid[row+i][col-i]=0;
				this.score+=cnt*10;
				return true;
			}
		}
		return false;
	}
}
function sleep(d){
	var now=new Date();
	var exitTime=now.getTime()+d;
	while(1){
		now=new Date();
		if(now.getTime()>exitTime)
			return;
	}
}