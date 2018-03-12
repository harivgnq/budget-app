// Budget Controller
var budgetController = ( function (){
    var Expense = function(id, description, value, percentage) {
        this.id= id;
        this.description= description;
        this.value= value;
        this.percentage= -1;
    } 
    
    Expense.prototype.calPercentage = function(totalIncome){
        if(totalIncome>0){
        this.percentage= Math.round((this.value/totalIncome)*100);    
        }
            
    }
    
    Expense.prototype.getPercentage = function () {
        return this.percentage;
    }
    
    var Income = function(id, description, value) {
        this.id= id;
        this.description= description;
        this.value= value;
    }  
    
    var data ={
        allItems : {
            exp:[],
            inc:[]    
        },
        totals: {
            exp:0,
            inc:0
        },
        budget:0,
        percentage:0
    }
    
var calculateTotals = function(type){
    
     var sum=0 
     data.allItems[type].forEach (function(element){
                                             sum+=element.value;
      
});
    data.totals[type]= sum;
};
    
    return {
        addItem: function(type, des, val){
            var newItem,ID;
            //create new id
if (data.allItems[type].length>0){
                ID = data.allItems[type][data.allItems[type].length-1].id+1;
}
            else{
                ID=0;
            }
            // create new income or expense line
            if(type ==='exp'){
            newItem =new Expense(ID, des,val);
            }
            else if(type === 'inc') {
                newItem= new Income(ID,des, val);
            }
            //insert data in to the data object
            data.allItems[type].push(newItem)
            return newItem;
        },
        
        deleteItem : function (type, id) {
          var ids, index;
            
            ids = data.allItems[type].map( function(current){
                return current.id
            });
            
            index = ids.indexOf(id);
            
            if (index!== -1) {
                
                data.allItems[type].splice(index,1)
            }
            
            
        },
        
        calculateBudget : function (){
            // calculate total income and expense
            calculateTotals('exp');
            calculateTotals('inc');
                            
            // calculate income- expense
            data.budget = data.totals.inc-data.totals.exp
            // calculate percentage
            if(data.totals.inc>0){
                data.percentage = Math.floor((data.totals.exp/data.totals.inc)*100);}
            else { data.percentage =-1;}

            
        },
        calculatePercentage: function(){
            
            data.allItems.exp.forEach(function(current){
                current.calPercentage(data.totals.inc)
                
            })
            
        },
        getPercent : function () {
          var allPerc = data.allItems.exp.map(function(cur){
              return cur.getPercentage();
          });
            return allPerc;
          }  
        ,
        getBudget : function () {
          return {
              budget: data.budget,
              totalInc: data.totals.inc,
              totalExp: data.totals.exp,
              percentage: data.percentage
          }  
        },
        testing: function(){
        console.log(data);
        }
    };
 
}) ();




//UI

var UIController = ( function (){
    var DOMStrings ={
        inputType:'.add__type',
        inputDesc: '.add__description',
        inputVal: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer:'.income__list',
        expenseContainer:'.expense__list',
        budgetLabel:'.budget__value',
        incomeLabel:'.budget__income--value',
        expenseLabel:'.budget__expense--value',
        percentageLabel:'.budget__expense--percentage',
        percentageincLabel:'.budget__income--percentage',
        container: '.container',
        itemPercentage:'.item__percentage',
        month: '.budget__title--month'
    }
    
var formatNumber = function(num, type){
   var splitNum, int, dec, 
    num = Math.abs(num);
    num = num.toFixed(2);
    splitNum = num.split('.')
    int = splitNum[0]
    //console.log(int);
    dec = splitNum[1]
    if (int.length>3) {
        int = int.substr(0,int.length-3)+','+int.substr(int.length-3,3)
    }
    
    return ( type ==='exp'? '-' : '+')+ int +'.'+ dec;
    //return num
}//


    
    return {
        getInput : function() {
            return {
            type: document.querySelector(DOMStrings.inputType).value,
            description: document.querySelector(DOMStrings.inputDesc).value,
            value: parseFloat (document.querySelector(DOMStrings.inputVal).value)
            
        }
        },
        displayBudget: function(obj){
            var type
            obj.budget>0? type= 'inc': type = 'exp';
            document.querySelector(DOMStrings.budgetLabel).textContent = formatNumber(obj.budget,type)
            document.querySelector(DOMStrings.incomeLabel).textContent = formatNumber(obj.totalInc,'inc')
            document.querySelector(DOMStrings.expenseLabel).textContent = formatNumber(obj.totalExp,'exp')
           
             if(obj.percentage >0){
                  document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage+'%';
                  document.querySelector(DOMStrings.percentageincLabel).textContent = (100-obj.percentage)+'%';
                 
             }
            
            else {
                 document.querySelector(DOMStrings.percentageLabel).textContent = obj.percentage;
                  document.querySelector(DOMStrings.percentageincLabel).textContent = (100-obj.percentage)+'%';
            }
               
            

            
        },
        
        displayPercentages: function(percentages){
            var fields, nodeListForEach
            
            fields= document.querySelectorAll(DOMStrings.itemPercentage);
            
            nodeListForEach= function(list, callback) {
                for (var i=0; i<list.length; i++){
                    callback(list[i],i);
                }
            }
            
            nodeListForEach (fields, function(current, index) {
                if (percentages[index]>0) {
                    current.textContent =percentages[index]+'%';
                }
                
                else {
                    current.textContent ='--'
                }
                
            })
            
            
        },
        
        getDOMstrings: function(){
            return DOMStrings;
        },
        
        displayMonth: function (){
            var now, months, year, month
            months=['January','February','March','April','May', 'June','July','August','September','October','November', 'December'];
            now= new Date();
            year = now.getFullYear();
            month = now.getMonth();
            
            document.querySelector(DOMStrings.month).textContent = months[month]+' '+year;
            
            
        },
        
        clearListItem: function(){
          var fields, fieldsArray
          fields = document.querySelectorAll(DOMStrings.inputDesc+','+DOMStrings.inputVal);
            fieldsArray = Array.prototype.slice.call(fields);
            fieldsArray.forEach(function(current, index, array){
                                current.value="";
                                })
            
        },
        
        delListItem : function(selectorID){
            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
            
        },
        
        addListItem: function(obj,type) {
         var html, newHtml, element;
            if(type=== 'inc'){
                element= DOMStrings.incomeContainer;
                 html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            else if (type === 'exp'){
                element= DOMStrings.expenseContainer;
                 html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage"></div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            newHtml= html.replace('%id%', obj.id);
            newHtml=newHtml.replace('%description%', obj.description);
            newHtml=newHtml.replace('%value%', formatNumber(obj.value,type));
            document.querySelector(element).insertAdjacentHTML('beforeend',newHtml);    
            
        }
}
}
) ();


//Application Controller


var Controller = ( function (budgetCtrl,UICtrl ){
    
    var setupEventListeners = function() {
        var dom = UICtrl.getDOMstrings();
        
         document.addEventListener('keypress', function(event){
        if ( event.keyCode ===13 || event.which ===13){            
            ctrlAddItem();
        }
         });
        document.querySelector(dom.inputBtn).addEventListener('click', ctrlAddItem);
        
        document.querySelector(dom.container).addEventListener('click',ctrlDelItem);
    }
    
    var updateBudget = function() {
        //4. calculate budget
        budgetCtrl.calculateBudget();
        //4.a return the budget
        var budget =budgetCtrl.getBudget();
        //5.display the budget
        UICtrl.displayBudget(budget) ;
    };
    
        var updatePercentage = function() {
        //4. calculate Percentage
        budgetCtrl.calculatePercentage();
        //4.a return the Percentage
        var percentage =budgetCtrl.getPercent();
        //5.display the Percentage
      UICtrl.displayPercentages(percentage) ;
    };
    
    var ctrlAddItem = function (){
        var input, newItem
        //1. Get input Data
         input = UICtrl.getInput();
        if(input.description!== "" && !isNaN( input.value)&& input.value> 0 ){
                    //2. Add Item to budget controller
         newItem= budgetCtrl.addItem(input.type, input.description, input.value)
        //3. Add the new item to the ui
        UICtrl.addListItem(newItem, input.type);
        UICtrl.clearListItem();
        //4. calculate and return budget
        updateBudget();
        //5. calculate and return percentages    
        updatePercentage()    ;
            
        }      
    }
    
    var ctrlDelItem = function(event){
        
 var itemId, splitId, type, id
 itemId= event.target.parentNode.parentNode.parentNode.parentNode.id
        if(itemId){
         splitId = itemId.split('-')  ;
            type = splitId[0];
            id =parseInt (splitId[1]);
        }
        
        //1. delete from data structure
        
        budgetCtrl.deleteItem(type, id);
        
        //2. delete from UI
        UICtrl.delListItem(itemId);
        
        //3. update and show new budget
         updateBudget();
        
         //4. update and show new percentage
        updatePercentage() ;
    }
    
        return {
        init: function(){
            setupEventListeners();
            UICtrl.displayMonth()
            UICtrl.displayBudget({
                budget:0,
                totalInc:0,
                totalExp:0,
                percentage:'--'
            }) ;
            console.log('app has started');
        }
    }

    
}) (budgetController, UIController);

Controller.init();

