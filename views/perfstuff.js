var perf = [];

		function updatePerfCount() {

			var x = document.getElementById("myNumber").value;

  			$('.performerDivB').remove();

    		for(i=0; i < x ; i++){
			    	perf[i] = document.createElement('div');
			    	perf[i].className = 'performerDivB';
			    	perf[i].id = 'cp' + (i+1);
			    	perf[i].innerHTML = i + 1;
			    	document.getElementById('performer-container').appendChild(perf[i]);
			    };

			     //makePerfIds();

			for (i = 0; i < perf.length; i++){
				perf[i].id = 'cp'+ (i+1);	
				console.log(perf[i].id)
				};

			};	
			
			
			console.log(perf.length);

			 for (var i = 0; i < perf.length; i++){
		    	$('#cp' + (i+1) +'.performerDivB').click(doTheThing(i));
		    	};
		  
		  		


			    function doTheThing(index) {

			    	return function(){ 
			    	var perf = "#cp" + index + '.perf;

			    	$(perf).fadeTo("fast", 0.5); 

			    	toAll = 0;
		 			toWhom = index+1;

		 			console.log(index+1);
		 			socket.emit('sendingTo', toWhom, toAll);
		 			socket.emit('sendingAll', toAll);
		 			};

		 		};

		 		

			     //};
			 // };
