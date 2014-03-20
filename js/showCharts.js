 $(function() {
    // define the structure variable
    variableNames = new Array() // 0 is a special value
    variablePossibleValues = new Array() // 0 is special
    observeNames = new Array()

    // define the data variable
    dataMatric = new Array()

	// initilize the html from json data
	function init(data) {
        console.log("We got " + data.length)
	    var lines = data.split('\n')
        if(lines.length < 0) {
            console.err("Error: rawdata invalid")
        }
        var numsArr = lines[0].split(',')
        var varTotalCount = parseInt(numsArr[0])
        var observeTotalCount = parseInt(numsArr[1])

        for(var i = 0; i < varTotalCount + 1; i++) {
            var line = lines[i + 1]
            line = $.trim(line)
            var splitArr = line.split(',')
            variableNames.push($.trim(splitArr[0]))
            variablePossibleValues.push(new Array())
            for(var j = 1; j < splitArr.length; j++) {
                variablePossibleValues[i].push($.trim(splitArr[j]))
            }   
        }
        var line = lines[varTotalCount + 2]
        line = $.trim(line)
        var splitArr = line.split(',')
        for(var i in splitArr) {
            observeNames.push($.trim(splitArr[i]))
        }

        for(var i = varTotalCount + 3; i < lines.length; i++) {
            line = $.trim(lines[i])
            if(line.length == 0) continue
            var splitArr = line.split(',')
            for(var p in splitArr) {
                splitArr[p] = $.trim(splitArr[p])
            }
            dataMatric.push(splitArr)
        }

        console.log("Congratuations! Data loaded ok~~")

        // complete the options on page
        for(var i = 1; i < varTotalCount + 1; i++) {
            // add variable variableNames[i] and its possible values variablePossibleValues[i] as a div.entry-chooseO
            var html = '<div class="entry-chooseOther"><span>' + variableNames[i] + '</span><select name="v' + i + '">';
            html += '<option value="">' +  '</option>'
            for(var j = 0; j < variablePossibleValues[i].length; j++) {
                html += '<option value="' + variablePossibleValues[i][j] + '">' + variablePossibleValues[i][j] + '</option>'
            }
            html += '</select></div>'
            $('.chooseOther').append($(html))
        }


    //选横坐标
         var html = '<div class="entry-chooseV"><select name="chooseV">';
        for(var i = 1; i < varTotalCount + 1; i++) {
            html += '<option value="' + variableNames[i] + '">' + variableNames[i] + '</option>'
        }
        html += '</select></div>'
        $('.chooseV').append($(html))
    //选择纵坐标

        var html = '<div class="entry-chooseO"><select name="chooseO">';
        for(var i = 0; i < observeTotalCount ; i++) {
            html += '<option value="' + observeNames[i] + '">' + observeNames[i] + '</option>'
        }
        html += '</select></div>'
        $('.chooseO').append($(html))    
        showChoose();
    }



	$.get("/http2/rawdata", function(data) {
	 	init(data);
	});

    function addChart(key, data_disable, data_enable, hc, vc) {
        function sortByArrItem1(a, b) {
            return a[0] - b[0];
        }
        data_enable = data_enable.sort(sortByArrItem1)
        data_disable = data_disable.sort(sortByArrItem1)
        console.log('addChart')
        console.log(data_enable)
        console.log(data_disable)
        window.containerCount++
        $('#containerWrapper').append($('<div class="one_case_chart" id="container_' + window.containerCount + '"></div>'))
        $('#container_' + window.containerCount).highcharts({
            credits:{//右下角的文本
            enabled: false,
             },
            title: {
                text: key,
                
            },
            subtitle: {
                text: '',
               
            },
            yAxis: {
                title: {text: vc}
           
            },
            xAxis: {
                title: {text: hc}
            },
            tooltip: {
                valueSuffix: ''
            },
            series: [{
                name: '开启优化',
                data: data_enable
            },{
                name: '关闭优化',
                data: data_disable
            }]
        });
    }

    // horizental cordianate,  can be the name or  an integal
    // vetical cordinate, string means name and integer means index
    // choices is an array with length of variableNames.length, any empty value means that the coresponding variable is not choosed
    function showSpecialCase(hc, vc, showSwitch, choices) {
        window.containerCount = 0
        $('.one_case_chart').remove()
        console.log("showSpecialCase: hc(" + hc + "), vc(" + vc + "), " + "showSwitch(" + showSwitch + ")")
        console.log("choices: (" + choices.join(',') + ")")
        var i;
        if(isNaN(hc)) { // hc is a name, change it to index
            for(i = 0; i < variableNames.length && variableNames[i] != hc; i++);
            if(i < variableNames.length) hc = i
            else {
                alert(hc + " 不是结果文件中可能的变量，可能值应该为：" + variableNames.join(','))
                return false
            }
        }
        if(isNaN(vc)) { // vc is a name, change it to index
            for(i = 0; i < observeNames.length && observeNames[i] != vc; i++);
            if(i < observeNames.length) vc = i
            else {
                alert(vc + " 不是结果文件中可能的观察变量，可能值应该为：" + observeNames.join(','))
                return false
            }
        }
        vc += variableNames.length

        console.log("hc=" + hc + ", vc=" + vc)
        showData = new Array()
        tmpData = new Array()
        // initialize the empty array according to choices, each array coorespond to a axis
        // key is an array of not-choose values. For example, if v1 and v2 not choose, key is array(v1, v2)
        for(i in choices) {
            if(i == 0 || i == hc) break;
            if(choices[i] == "") {
                if(showData.length == 0) {
                    for(var j in variablePossibleValues[i]) {
                        var v = new Array()
                        v.push(variablePossibleValues[i][j])
                    }    
                } else {
                    // append variablePossibleValues[i] to every showData item
                    for(var j in variablePossibleValues[i]) {
                        for(var s in showData) {
                            var v = new Array(showData[s])
                            v.append(variablePossibleValues[i][j])
                            tmpData.push(v)
                        }
                    }  
                }
                
            }
            showData = tmpData
            tmpData = new Array()
        }

        /* key = pv1-pv2-pv3
        / key -> array(
            array(enable),
             array(disable)
            )
        */
        for(i = 0; i < dataMatric.length; i++) {
            var key = ''
            valid = true
            // format key
            for(var j = 1; j < variableNames.length; j++) {
                if(j == hc) {
                    key += (variableNames[j] + '-')
                    continue;
                }
                if(choices[j] == "") {
                    key += (dataMatric[i][j] + '-')
                } else {
                    key += (choices[j] + '-')
                    // if choices[i] != "" and not match, ignore
                    if(dataMatric[i][j] != choices[j]) {
                        valid = false
                    }
                }
            }
            if(!valid) continue

            var found = false
            for(var k in showData)  {
                if(k == key) {
                    found = true
                    break
                }
            }
            if(!found) {
                showData[key] = new Array(new Array(), new Array())
            }
            if(dataMatric[i][0] == 0 || dataMatric[i][0] == "off") // off data
                showData[key][0].push([parseInt(dataMatric[i][hc]), parseFloat(dataMatric[i][vc])])
            else
                showData[key][1].push([parseInt(dataMatric[i][hc]), parseFloat(dataMatric[i][vc])])
        }

        for(k in showData) {
            console.log("")
            console.log("key: " + k)
            var dis = ""
            for(p in showData[k][0]) {
                dis += ("(" + showData[k][0][p].join(',') + "),")
            }
            console.log("disabled data: " + dis)
            var enable = ""
            for(p in showData[k][1]) {
                enable += ("(" + showData[k][1][p].join(',') + "),")
            }
            console.log("enable data: " + enable)
            addChart(k, showData[k][0], showData[k][1], variableNames[hc], observeNames[vc])
        }
        $('#containerWrapper').append("<div style='clear:both'></div>")
        return;
        
        //addChart(data_enable, data_disable, showSwitch)
   
    }

    function showChoose() {
                // hc
        var hc = $('select[name=chooseV').val()
        var vc = $('select[name=chooseO').val()
        var showSwitch = 3
        var choices = new Array()
        choices.push(0)
        $('.entry-chooseOther select').each(function() {
            var v = $(this).val()
            choices.push(v)
        })
        showSpecialCase(hc, vc, showSwitch, choices)
    }

    $(document).on('change', 'select', showChoose)

	// when change the ...
	$('#pid').change(function(){
        alert('t')
        var objS = document.getElementById("pid");
        var value = objS.options[objS.selectedIndex].value;
        if(value=="a"){
        	alert("请选择变量作为横坐标");	
        }else if(value=="b"){
        	document.getElementById('z2').disabled=true;
        	document.getElementById('z3').disabled=false;
        	document.getElementById('z4').disabled=false;
        	document.getElementById('z5').disabled=false;
        	document.getElementById('z6').disabled=false;
        	//add1();
        }else if(value=="c"){
        	document.getElementById('z3').disabled=true;
        	document.getElementById('z2').disabled=false;
        	document.getElementById('z4').disabled=false;
        	document.getElementById('z5').disabled=false;
        	document.getElementById('z6').disabled=false;
        }else if(value="d"){	
        	document.getElementById('z4').disabled=true;
        	document.getElementById('z2').disabled=false;
        	document.getElementById('z3').disabled=false;
        	document.getElementById('z5').disabled=false;
        	document.getElementById('z6').disabled=false;
        }else if(value=="e"){
        	document.getElementById('z5').disabled=true;
        	document.getElementById('z2').disabled=false;
        	document.getElementById('z3').disabled=false;
        	document.getElementById('z4').disabled=false;
        	document.getElementById('z6').disabled=false;
        }else if(value=="f"){ 	
        	document.getElementById('z6').disabled=true;
        	document.getElementById('z2').disabled=false;
        	document.getElementById('z3').disabled=false;
        	document.getElementById('z4').disabled=false;
        	document.getElementById('z5').disabled=false;
        }
	})
})


