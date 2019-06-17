// Try edit msg
 
//Add lodash';
var AST = {
  "nodeType": "Main",
  "value": {
    "type": "Select",
    "distinctOpt": null,
    "highPriorityOpt": null,
    "maxStateMentTimeOpt": null,
    "straightJoinOpt": null,
    "sqlSmallResultOpt": null,
    "sqlBigResultOpt": null,
    "sqlBufferResultOpt": null,
    "sqlCacheOpt": null,
    "sqlCalcFoundRowsOpt": null,
    "selectItems": {
      "type": "SelectExpr",
      "value": [
        {
          "type": "Identifier",
          "value": "*"
        }
      ]
    },
    "from": {
      "type": "TableRefrences",
      "value": [
        {
          "type": "TableRefrence",
          "value": {
            "type": "TableFactor",
            "value": {
              "type": "Identifier",
              "value": "logs"
            },
            "partition": null,
            "alias": null,
            "hasAs": null,
            "indexHintOpt": null
          }
        }
      ]
    },
    "partition": null,
    "where": {
      "type": "AndExpression",
      "operator": "and",
      "left": {
        "type": "ComparisonBooleanPrimary",
        "left": {
          "type": "Identifier",
          "value": "statuscode"
        },
        "operator": "=",
        "right": {
          "type": "String",
          "value": "'abc'"
        }
      },
      "right": {
        "type": "SimpleExprParentheses",
        "value": {
          "type": "ExpressionList",
          "value": [
            {
              "type": "AndExpression",
              "operator": "and",
              "left": {
                "type": "ComparisonBooleanPrimary",
                "left": {
                  "type": "Identifier",
                  "value": "organization"
                },
                "operator": "=",
                "right": {
                  "type": "String",
                  "value": "'A'"
                }
              },
              "right": {
                "type": "ComparisonBooleanPrimary",
                "left": {
                  "type": "Identifier",
                  "value": "statuscode"
                },
                "operator": "=",
                "right": {
                  "type": "String",
                  "value": "'vidya'"
                }
              }
            }
          ]
        }
      }
    },
    "groupBy": null,
    "having": null,
    "orderBy": null,
    "limit": null,
    "procedure": null,
    "updateLockMode": null
  }
}




let data = {}
if(AST.value.selectItems.value &&
AST.value.selectItems.value.length > 0)
{
   data.selectItems = [];
   _.map(AST.value.selectItems.value, (object) => {
     let newObject = {};
     
     if(object.name){
        newObject.key = _.map(object.params,'value').join(',');
        newObject.name = object.name;
        data.selectItems.push(newObject)
     }else{
        newObject.key = object.value;
        data.selectItems.push(newObject)
     }
   })
}
data.from = [{
  name : "logs"
} ]
data.where = AST.value.where ?
checkStatus(AST.value.where) : null;

console.log(JSON.stringify(data));
function addRules(ast,operator){
   let data = [];
    let leftResult = checkStatus( ast.left,operator);
    if(Array.isArray(leftResult)){
      data.push(...leftResult)
    }else{
      data.push(leftResult)
    }
    let rightResult = checkStatus( ast.right,operator);
    if(Array.isArray(rightResult)){
      data.push(...rightResult)
    }else{
      data.push(rightResult)
    }
    return data
  
}
function checkStatus(ast,parent){
  let newdata = {}
    if (ast && 
    (ast.type == 'AndExpression' || 
      ast.type == 'OrExpression') ){
        if(parent){
          let operator = ast.type == 'AndExpression' ? 'and'
          : ast.type == 'OrExpression' ? 'or' : null;
          if(parent == operator){
             return addRules(ast,operator)
          }else{
            console.log("parent !== operator");
          }
        }else{
          let operator = ast.type == 'AndExpression' ? 'and'
          : ast.type == 'OrExpression' ? 'or' : null;
          newdata.condition = operator;
          newdata.rules = [];
          newdata.rules.push(...checkStatus(ast,operator))
        }
    } else if (ast && 
      ast.type == 'InSubQueryPredicate'){
      console.log("Subquery")
    }else if(ast && 
       ast.type == "SimpleExprParentheses"){
      if(ast.value && 
      ast.value.type && 
      ast.value.type == "ExpressionList" &&
      ast.value.value.length){
            return checkStatus(ast.value.value[0])
      }
    }else{
      newdata = {
            "operator": ast.operator,
            "type": ast.right.type,
            "value":ast.right.value
        }
     if(ast.left.name){
        newdata.field = _.map(ast.left.params,'value').join(',');
        newdata.name = ast.left.name;
     }else{
        newdata.field = ast.left.value
     }
    } 
  
  return newdata
}