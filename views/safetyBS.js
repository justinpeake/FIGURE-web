	console.log(group);

							// currently addressed player 
							var who = group[i];
							console.log(who);

					

								console.log(whoWhat['player' + who]);
								console.log(typeof(whoWhat['player' + who]));

							if (typeof(whoWhat['player' + who])=='null'){
								console.log('its null yo');
								
							 var overlay = group.toString();
							 document.getElementById('iT' + index).innerHTML = overlay; 

							}
							// 	whoWhat['player' + who] = 'iT' + index;		

							// var newWho = whoWhat['player' + who];
							//  		// console.log(newWho);

					 	 	var pullTextPre = document.getElementById(whoWhat[newWho]).innerHTML;
							// console.log("pullTextPre = "+ pullTextPre);

							

						//var	pullTextPost = 

						// 	//who.toString();
						// 	var pullTextPost = pullTextPre.replace('who', ' ');

						// 		console.log("pullTextPost= "+ newText);
						// 	pullText.trim();


						// 	document.getElementById(newWho).innerHTML = pullText;
						